const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
    return; // Add a return statement to exit the middleware here.
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; //Authorization : 'Bearer token'
    if (!token) {
      throw new HttpError("Authentication Failed", 401); // Use 'throw' to trigger the catch block
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(new HttpError("Authentication Failed", 401)); // Use 401 for unauthorized requests
  }
};
