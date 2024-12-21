import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    // test: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Test',
    //     required: true,
    // },
    title: { type: String, required: true },
    title1: { type: String },
    type: {
        type: String,
        enum: ['short-answer', 'multiple-choice'],
        required: true,
        default: 'multiple-choice', // По умолчанию вопрос с выбором вариантов
    },
    options: {
        type: [String], // Список вариантов ответа (только для multiple-choice)
        default: [],    // Пустой массив, если это short-answer
    },
    correctAnswers: {
        type: [String], // Корректные ответы (поддерживает несколько для multiple-choice)
        required: true,
    },
    imageUrl: {
        type: String, // Ссылка на изображение, если оно требуется для вопроса
        default: null,
    },
    timeLimit: {
        type: Number, // Время на вопрос в секундах
    },
});

export default mongoose.model('Question', questionSchema);
