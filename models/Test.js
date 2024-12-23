import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Название теста
    description: { type: String, default: '' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    deadline: { type: Date }, // Крайний срок для прохождения
    timeLimit: { type: Number, default: 0 }, // Время на прохождение теста (в минутах)
    createdAt: { type: Date, default: Date.now },
    isResultVisibleAfterDeadline: { type: Boolean, default: false }, // Показывать результат теста только после истечения срока сдачи
});


export default mongoose.model('Test', testSchema);
