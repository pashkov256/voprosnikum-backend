import express from 'express';
import { createQuestion, getQuestionsByTest, updateQuestion, deleteQuestion } from '../controllers/QuestionController.js';

const router = express.Router();

router.post('/questions', createQuestion);
router.get('/questions/:testId', getQuestionsByTest);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

export default router;
