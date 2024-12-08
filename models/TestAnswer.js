import mongoose from "mongoose";

const testAnswerSchema = new mongoose.Schema({
    testResult: { type: mongoose.Schema.Types.ObjectId, ref: 'TestResult', required: true }, // ID результата теста
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }, // ID вопроса
    answer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', required: true }, // ID ответа, выбранного учеником
    isCorrect: { type: Boolean, required: true } // Правильный ли был выбран ответ
});

export  default mongoose.model('TestAnswer', testAnswerSchema);
