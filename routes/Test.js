import express from 'express';
import {
    createTest,
    getAllTests,
    updateTest,
    deleteTest,
    getTestsByTeacher,
    getTestById
} from '../controllers/TestController.js';

const router = express.Router();

router.post('/tests', createTest);
router.get('/tests', getAllTests);
router.get('/tests/teacher/:teacherId', getTestsByTeacher);
router.get("/tests/:id", getTestById);
router.put('/tests/:id', updateTest);
router.delete('/tests/:id', deleteTest);
router.delete('/tests/:id', deleteTest);

export default router;

