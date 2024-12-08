import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export default (req, res, next) => {
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
    console.log(token);
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET || "secretkey_ntitp");

            req.userId = decoded._id;
            next();
        } catch (error) {
            console.log(error);
            return res.status(403).json({
                message: "Нет доступа",
            });
        }
    } else {
        return res.status(403).json({
            message: "Нет доступа",
        });
    }
};
