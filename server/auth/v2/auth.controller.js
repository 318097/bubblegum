import admin from "firebase-admin";
import fusionServiceAccount from "../../../secrets/fusion-97e8c-firebase-adminsdk-qjtt8-a6765111ba.json" with { type: "json" };
import User from "../../api/v2/user/user.model.js";
import { signToken } from "../../utils/authentication.js";
import { extractUserData } from "../../utils/common.js";
import { startSession, endSession } from "../../utils/session.js";
import { verifyAccountStatus } from "../../utils/account.js";

const authenticateWithGoogle = async (req, res) => {
  const { name, authToken, photoURL } = req.body;

  const serviceAccounts = {
    FUSION: fusionServiceAccount,
    CIRCLE: fusionServiceAccount,
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccounts[req.source]),
    });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(authToken);

    let { uid, email } = decoded;
    let isAnonymous = false;
    if (!email) {
      // anonymous user
      email = `${uid}@google.uid`;
      isAnonymous = true;
    }

    let user = await User.findOne({ email });

    if (!user) {
      const newUser = {
        name: name || "Anonymous",
        uid,
        email,
        username: email,
        photoURL,
        isAnonymous,
        source: req.source,
      };
      user = await User.create(newUser);
    }

    const token = signToken(user._id, user.email);

    await startSession({
      userId: user._id,
      source: req.source,
      authMethod: "GOOGLE",
      token,
    });

    res.send({ token, ...user });
  } catch (err) {
    console.log(err);
    res.status(401).json({ success: false, error: err.message });
  }
};

const checkAccountStatus = async (req, res) => {
  // await verifyAccountStatus(req);
  try {
    res.send({ ...req.user, token: req.token });
  } catch (err) {
    console.log(err);
  }
};

const logout = async (req, res) => {
  await endSession(req);
  res.send("ok");
};

export { checkAccountStatus, logout, authenticateWithGoogle };
