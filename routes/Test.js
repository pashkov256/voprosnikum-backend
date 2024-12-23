import express from 'express';
import {
    createTest,
    deleteTest,
    getAllTests,
    getTestById,
    getTestsByTeacher,
    updateTest
} from '../controllers/TestController.js';
import checkAuth from "../utils/checkAuth.js";


const router = express.Router();

router.post('/tests', createTest);
router.get('/tests', getAllTests);
router.post('/tests/teacher/:teacherId', getTestsByTeacher);
router.get("/tests/:id",checkAuth, getTestById);
router.put('/tests/:id', updateTest);
router.delete('/tests/:id', deleteTest);
router.delete('/tests/:id', deleteTest);

export default router;

