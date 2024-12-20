import Question from '../models/Question.js';
import Test from "../models/Test.js";

export const createQuestion = async (req, res) => {
    try {
        const { test, content, type, options, correctAnswers, imageUrl, timeLimit } = req.body;

        // Валидация по типу вопроса
        if (type === 'multiple-choice' && (!options || options.length < 2)) {
            return res.status(400).json({ error: 'Для вопросов с выбором требуется минимум 2 варианта.' });
        }

        if (!correctAnswers || correctAnswers.length === 0) {
            return res.status(400).json({ error: 'Не указаны правильные ответы.' });
        }

        const question = new Question({
            test,
            content,
            type,
            options: type === 'multiple-choice' ? options : [],
            correctAnswers,
            imageUrl,
            timeLimit,
        });

        await question.save();
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getQuestionsByTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const questions = await Question.find({ test: testId });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.type === 'multiple-choice' && (!updates.options || updates.options.length < 2)) {
            return res.status(400).json({ error: 'Для вопросов с выбором требуется минимум 2 варианта.' });
        }

        const question = await Question.findByIdAndUpdate(id, updates, { new: true });
        if (!question) return res.status(404).json({ error: 'Вопрос не найден' });

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createQuestionAndAddToTest = async (req, res) => {
    try {
        const { testId } = req.params; // ID теста из параметров маршрута

        // Проверяем, указан ли ID теста
        if (!testId) {
            return res.status(400).json({ message: "Не указан ID теста." });
        }

        // Проверяем, существует ли тест
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: "Тест не найден." });
        }

        // Создаем новый вопрос из данных, переданных в теле запроса
        const questionData = req.body;
        const newQuestion = new Question(questionData);
        const savedQuestion = await newQuestion.save();

        test.questions.push(savedQuestion._id);
        await test.save();

        res.status(201).json({ message: "Вопрос успешно создан и добавлен в тест.", question: savedQuestion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при создании вопроса и добавлении в тест." });
    }
};



export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findByIdAndDelete(id);
        if (!question) return res.status(404).json({ error: 'Question not found' });
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
