import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Название теста
    description: { type: String, default: '' }, // Описание теста
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Учитель, создавший тест
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, // Группа, для которой доступен тест
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }], // Массив ID вопросов
    deadline: { type: Date, required: true }, // Крайний срок для прохождения
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Test', testSchema);
