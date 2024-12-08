import express from 'express';
import { createTestResult, getAllTestResults, updateTestResult, deleteTestResult } from '../controllers/TestResultController.js';

const router = express.Router();

router.post('/results', createTestResult);
router.get('/results', getAllTestResults);
router.put('/results/:id', updateTestResult);
router.delete('/results/:id', deleteTestResult);

export default router;
