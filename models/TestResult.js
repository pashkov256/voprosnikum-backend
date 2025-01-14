import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true }, // Тест, который проходил ученик
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ученик, прошедший тест
    testAnswers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestAnswer' }], // Ученик, прошедший тест
    score: { type: Number }, // Итоговая оценка ученика
    focusLossCount: { type: Number, default: 0 }, // Количество потери фокуса со страницы
    points: { type: Number, default: 0 }, // Баллы за тест ученика
    completedAt: { type: Date }, // Дата завершения теста (ЗАВЕРШЕН ЛИ ТЕСТ СМОТРЕТЬ ПО ЭТОМУ КЛЮЧУ)
    dateStart: { type: Date },//время когда начал
    completionTime: { type: String },//за сколько минут закончил
    randomizedQuestionsSetIndex: { type: Number },//за сколько минут закончил
});

export default mongoose.model('TestResult', testResultSchema);
