import jwt from "jsonwebtoken";
import { promisify } from "util";
const jwt_key = process.env.JWT_SECRET_KEY;

const jwtVerifyAsync = promisify(jwt.verify);

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: "No token provided" });
    }
    if (!(authHeader.split(" ")[0].toLowerCase() === "bearer")) {
      return res.status(400).json({ message: "invalid auth header" });
    }
    const token = authHeader.split(" ")[1];
    const user = await jwtVerifyAsync(token, jwt_key);
    if (!user) return res.status(401).send({ message: "User not verified" });
    req.user = { userId: user.userId, email: user.email };
    next();
  } catch (err) {
    return res.status(401).send({
      message: "User is not valid",
    });
  }
};

export default authenticate;
