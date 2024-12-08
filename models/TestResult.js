import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true }, // Тест, который проходил ученик
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ученик, прошедший тест
    score: { type: Number, required: true }, // Итоговый балл ученика
    completedAt: { type: Date, default: Date.now }, // Дата завершения теста
});

export default mongoose.model('TestResult', testResultSchema);
