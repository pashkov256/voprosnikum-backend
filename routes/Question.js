import express from 'express';
import {
    createQuestion,
    getQuestionsByTest,
    updateQuestion,
    deleteQuestion,
    createQuestionAndAddToTest
} from '../controllers/QuestionController.js';

const router = express.Router();

router.post('/questions', createQuestion);
router.get('/questions/:testId', getQuestionsByTest);
router.put('/questions/:id', updateQuestion);
router.post('/question/test/:testId', createQuestionAndAddToTest);
router.delete('/questions/:id', deleteQuestion);

export default router;
