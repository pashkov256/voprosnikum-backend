import express from 'express';
import { createTest, getAllTests, updateTest, deleteTest } from '../controllers/TestController.js';

const router = express.Router();

router.post('/tests', createTest);
router.get('/tests', getAllTests);
router.put('/tests/:id', updateTest);
router.delete('/tests/:id', deleteTest);

export default router;

