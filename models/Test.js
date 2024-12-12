import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Название теста
    description: { type: String, default: '' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    deadline: { type: Date, required: true }, // Крайний срок для прохождения
    createdAt: { type: Date, default: Date.now },

});

export default mongoose.model('Test', testSchema);
