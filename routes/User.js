import express from "express";
import {
    createUserByAdmin,
    getAllAdmins,
    getAllTeachers,
    getMe, getMinimalTeachersList, getTeacherAndTestsByStudentGroup,
    getUsersByGroup,
    login,
    register
} from "../controllers/UserController.js";
import checkAuth from "../utils/checkAuth.js";
// import { loginValidation, registerValidation } from "../validations.js";
const router = express.Router();

// router.post("/auth/register", registerValidation, register);
// router.post("/auth/login", loginValidation, login);
router.post("/auth/register", register);
router.post("/user/createByAdmin", checkAuth, createUserByAdmin);
router.get("/user/teachers", checkAuth, getAllTeachers);
router.get("/user/admins", checkAuth, getAllAdmins);
router.get("/teachers/minimal", checkAuth, getMinimalTeachersList);
router.get("/groups/teachers-tests", checkAuth, getTeacherAndTestsByStudentGroup);
router.get("/groups/:groupId/users", checkAuth, getUsersByGroup);
router.post("/auth/login", login);
router.get("/auth/me", checkAuth, getMe);



export default router;
