import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export default (req, res, next) => {
    // const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
    // console.log(token);
    // if (token) {
    //     try {
    //         console.log(process.env.SECRET)
    //         const decoded = jwt.verify(token, process.env.SECRET);
    //         req.userId = decoded._id;
    //         next();
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(403).json({
    //             message: "Нет доступа1",
    //         });
    //     }
    // } else {
    //     return res.status(403).json({
    //         message: "Нет доступа2",
    //     });
    // }
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
    console.log(!token && "Token is " + token);
    if (!token) {
        return res.status(401).json({ message: 'Нет доступа.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.userId = decoded._id;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Неверный токен.' });
    }
};
