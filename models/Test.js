import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Название теста
    description: { type: String, default: '' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    deadline: { type: Date }, // Крайний срок для прохождения
    timeLimit: { type: Number, default: 0 }, // Время на прохождение теста (в минутах)
    maxPoints: { type: Number, default: 0 }, // Максимальное количество баллов за тест
    createdAt: { type: Date, default: Date.now },
    countRandomizedQuestionsSets: { type: Number, default: 8},//количество вариантов с рандомными вопросами  
    randomizedQuestionsSets: { type: [[Number]], default: []},//варианты с рандомными вопросами  
    isQuestionsRandomized: { type: Boolean, default: true},//вопросы в рандомном порядке?
    isResultVisibleAfterDeadline: { type: Boolean, default: false }, // Показывать результат теста только после истечения срока сдачи
});


export default mongoose.model('Test', testSchema);
