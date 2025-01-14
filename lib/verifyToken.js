const jwt = require("jsonwebtoken");
const createError = require("./error.js");

const verifyToken = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return createError(401, "You are not authenticated!");
    }
    const [bearer, token] = authorizationHeader.split(" ");
    if (bearer !== "Token" || !token) {
      return createError(401, "Invalid authorization header format!");
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return createError(403, "Token is not valid!", err);
      }
      req.user = user;
      next();
    });
  };

const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            createError(403, "You are not authorized!");
        }
    })
}

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.isAdmin) {
            next();
        } else {
            createError(403, "You are not authorized!");
        }
    })
}

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyUser
}