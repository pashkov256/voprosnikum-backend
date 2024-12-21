import express from 'express';
import {
    createTestResult,
    getAllTestResults,
    updateTestResult,
    deleteTestResult,
    checkTestResult,
    getTestResultByStudentAndTest,
    createTestAnswer
} from '../controllers/TestResultController.js';

const router = express.Router();

router.post('/test/:id/create-result', createTestResult);
router.post('/check-test-result', checkTestResult);
router.get('/test/:id/results', getAllTestResults);
router.get('/test/:testId/student/:studentId', getTestResultByStudentAndTest);
router.post('/test/create-answer', createTestAnswer);
router.put('/results/:id', updateTestResult);
router.delete('/results/:id', deleteTestResult);

export default router;
