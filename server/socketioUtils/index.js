const jwt = require("jsonwebtoken");
const checkToken = (token, key) => {
  try {
    let payload = jwt.verify(token, key);
    return payload;
  } catch (err) {
    return false;
  }
};
const authCheck = (socket, next) => {
  try {
    let jwtToken = socket.handshake.headers.authorization;
    jwtToken = jwtToken.split(" ")[1];
    let payload = checkToken(jwtToken, process.env.JWT_KEY);
    if (payload) {
      socket.handshake.headers.userName = payload.userName;
      next();
    } else {
      throw new Error("Auth fail");
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { authCheck };
