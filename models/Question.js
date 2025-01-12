import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['short-answer', 'multiple-choice', 'single-choice'],
        required: true,
        default: 'multiple-choice', // По умолчанию вопрос с выбором вариантов
    },
    options: {
        type: [String], // Список вариантов ответа (только для multiple-choice)
        default: [],    // Пустой массив, если это short-answer
    },
    correctAnswers: {
        type: [String], // Корректные ответы (поддерживает несколько для multiple-choice)
    },
    imageUrl: {
        type: String, // Ссылка на изображение, если оно требуется для вопроса
        default: null,
    },
    shortAnswer: {
        type: String,
        default: null,
    },
    timeLimit: {
        type: Number, // Время на вопрос в секундах
    },
});

export default mongoose.model('Question', questionSchema);
