const jwt = require("jsonwebtoken")

const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization'];
    const secretKey = process.env.JWT_SECRET
    if (typeof token !== 'undefined') {
      jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
        if (err) {
          return res.status(403).send('Invalid token');
        } else {
          req.user = decoded;
          next();
        }
      });
    } else {
      return res.status(401).send('Unauthorized');
    }
  }
module.exports = verifyToken