import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  if (!token) {
    return res.status(401).json({ message: "Нет доступа." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.userId = decoded._id;
    next();
  } catch (error) {
    res.status(403).json({ message: "Неверный токен." });
  }
};
