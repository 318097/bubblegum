/* Async middleware to wrap the controller into a try-catch block */
module.exports = handler => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      console.log('Error: ', err);
      next(err);
    }
  };
};
