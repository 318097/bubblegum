import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import _ from "lodash";
import config from "../config.js";
import { getAppBasedInfo } from "./common.js";
import User from "../api/v1/user/user.model.js";
import UserV2 from "../api/v2/user/user.model.js";

const getToken = (req) => _.get(req, "headers.authorization");

const appendUserInfo = async (req, user) => {
  const { _id } = user;
  const appBasedInfo = await getAppBasedInfo({ user, source: req.source });
  req.user = { ...user, ...appBasedInfo };

  req.userId = _id;
  req._id = _id;
  req.id = _id;
  req.status = _.get(user, "accountStatus.status");
  req.verified = _.get(user, "accountStatus.verified", false);
};

// Token helpers & auth middlewares bound to one user collection. v1 users live
// in the bubblegum db and v2 users in the circle db, so each API version gets
// its own set. When `audience` is set, tokens are signed with it and tokens
// without it (e.g. v1 tokens) are rejected.
const createAuth = ({ UserModel, audience }) => {
  const tokenOptions = audience ? { audience } : {};

  const checkToken = expressjwt({
    secret: config.JWT,
    algorithms: ["HS256"],
    requestProperty: "user",
    ...tokenOptions,
  });

  const signToken = (_id, email) =>
    jwt.sign({ _id, email }, config.JWT, {
      expiresIn: "90d",
      ...tokenOptions,
    });

  const validateToken = (token) => {
    try {
      if (!token) return;
      return jwt.verify(token, config.JWT, tokenOptions);
    } catch (error) {
      throw new Error("INVALID_JWT_TOKEN");
    }
  };

  const getUser = (_id) => UserModel.findById(_id).lean();

  const getUserFromToken = async (token) => {
    const { _id } = validateToken(token) || {};
    return await getUser(_id);
  };

  const decodeToken = (req, res, next) => {
    /* this will call next() if token is valid or send error.& attached the decoded token to `req.user` */
    checkToken(req, res, next);
  };

  const extractUser = async (req, res, next) => {
    const user = await getUser(req.user._id);

    /* if no user is found, it was a valid JWT but didn't decode to a real user in DB
    Either the user was deleted or it was a JWT from some other source */
    if (!user) return res.status(401).send("UNAUTHORIZED");

    await appendUserInfo(req, user);
    next();
  };

  const transparent = async (req, res, next) => {
    const { token } = req;

    if (token) {
      const user = await getUserFromToken(token);
      // valid JWT but no such user in this db: carry on as anonymous
      if (user) await appendUserInfo(req, user);
    }

    next();
  };

  const protectedRoute = [decodeToken, extractUser];

  return {
    signToken,
    validateToken,
    getUserFromToken,
    transparent,
    protectedRoute,
  };
};

const temporaryAccess = async (req, res, next) => {
  req.user = await User.findOne({ email: "318097@gmail.com" }).lean();
  next();
};

// const externalAccess = async (req, res, next) => {
//   if (!req.validSource)
//     return res.status(401).send("Unauthorized: Invalid source.");

//   const token = getToken(req);
//   if (token) {
//     req.user = validateToken(token);
//     extractUser(req, res, next);
//   } else {
//     req.user = await User.findOne({ email: "318097@gmail.com" }).lean();
//     next();
//   }
// };

// v1 (bubblegum) is the default export set; v2 routes use `authV2`.
const {
  signToken,
  validateToken,
  getUserFromToken,
  transparent,
  protectedRoute,
} = createAuth({ UserModel: User });

const authV2 = createAuth({ UserModel: UserV2, audience: "v2" });

export {
  getToken,
  signToken,
  validateToken,
  getUserFromToken,
  transparent,
  temporaryAccess,
  protectedRoute,
  authV2,
};
