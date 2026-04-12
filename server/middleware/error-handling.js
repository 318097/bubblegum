import logger from "../utils/logger.js";

/* Error handling middleware to wrap the controller into a try-catch block */
export default (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      const errMsg = err.message;
      logger.error(errMsg);
      logger.error(err);
      next(errMsg);
    }
  };
};
