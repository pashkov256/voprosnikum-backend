import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }, // Вопрос, к которому относится ответ
    content: [{ type: String, required: true }], // Текст ответа
    isCorrect: { type: Boolean, required: true }, // Правильный ли ответ
});

export default mongoose.model('Answer', answerSchema);
