import mongoose from "mongoose";

const testAnswerSchema = new mongoose.Schema({
    testResult: { type: mongoose.Schema.Types.ObjectId, ref: 'TestResult', required: true }, // ID результата теста
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }, // ID вопроса
    // answer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', required: true }, // ID ответа, выбранного учеником
    isCorrect: { type: Boolean },// Правильный ли был выбран ответ,только для текстового ответа
    isTimeFail: { type: Boolean },// Правильный ли был выбран ответ,только для текстового ответа
    selectedOptions: { type: [String] },
    shortAnswer: { type: String },
    pointsAwarded: { type: Number, default: 0 },
});

export default mongoose.model('TestAnswer', testAnswerSchema);
