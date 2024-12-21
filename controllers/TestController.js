import Test from '../models/Test.js';
import Question from '../models/Question.js';
import User from "../models/User.js";
import TestResult from "../models/TestResult.js";
export const createTest = async (req, res) => {
    try {
        const { name, description, teacher, group, deadline } = req.body;
        console.log( { name, description, teacher, group, deadline })
        const test = new Test({ name, description, teacher, group, deadline });
        await test.save();
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



export const getTestById = async (req, res) => {
    // try {
    //     const params = req.params;
    //     if (!params.id) {
    //         return res.status(400).json({ message: "Не указан ID теста." });
    //     }
    //     const test = await Test.findById(params.id).populate({
    //         path: "questions",
    //         model: Question,
    //         select: "-__v -createdAt",
    //     }) .populate({
    //         path: "teacher",
    //         model: User,
    //         select:"-plainPassword -passwordHash"
    //     });;
    //     if (!test) {
    //         return res.status(404).json({ message: "Тест не найден." });
    //     }
    //     res.status(200).json(test);
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: "Ошибка при получении теста." });
    // }
    try {
        const params = req.params;
        const studentId = req.userId || req.body.studentId; // Предполагаем, что ID пользователя передаётся через токен или в теле запроса.

        if (!params.id) {
            return res.status(400).json({ message: "Не указан ID теста." });
        }

        if (!studentId) {
            return res.status(400).json({ message: "Не указан ID студента." });
        }

        // Поиск теста с вопросами и учителем
        const test = await Test.findById(params.id)
            .populate({
                path: "questions",
                model: Question,
                select: "-__v -createdAt",
            })
            .populate({
                path: "teacher",
                model: User,
                select: "-plainPassword -passwordHash",
            });

        if (!test) {
            return res.status(404).json({ message: "Тест не найден." });
        }

        // Проверяем, есть ли TestResult для данного студента и теста
        const testResult = await TestResult.findOne({
            student: studentId,
            test: params.id,
        });

        // Добавляем поле haveTestResult
        const result = {
            ...test.toObject(),
            haveTestResult: !!testResult, // true, если TestResult найден, иначе false
        };

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при получении теста." });
    }
};


export const getAllTests = async (req, res) => {
    try {
        const tests = await Test.find().populate('group teacher');
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



export const getTestsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params; // Получаем ID учителя из параметров маршрута

        // Поиск тестов по ID учителя
        const tests = await Test.find({ teacher: teacherId });

        if (!tests || tests.length === 0) {
            return res.status(404).json({ message: 'Тесты для данного учителя не найдены.' });
        }

        res.status(200).json(tests); // Возвращаем найденные тесты
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updateTest = async (req, res) =>   {
    try {
        const { id } = req.params; // ID теста
        const updates = req.body; // Измененные данные теста

        const { questions: updatedQuestions, ...testUpdates } = updates;

        // 1. Обновляем сам тест (без вопросов)
        const test = await Test.findByIdAndUpdate(id, testUpdates, { new: true });
        if (!test) return res.status(404).json({ error: "Test not found" });

        // 2. Обрабатываем вопросы
        const updatedQuestionIds = [];
        for (const question of updatedQuestions) {
            if (question._id) {
                // Если вопрос уже существует, обновляем его
                const updatedQuestion = await Question.findByIdAndUpdate(
                    question._id,
                    question,
                    { new: true }
                );
                updatedQuestionIds.push(updatedQuestion._id);
            } else {
                // Если вопрос новый, создаем его
                const newQuestion = await Question.create(question);
                updatedQuestionIds.push(newQuestion._id);
            }
        }

        // 3. Обновляем массив questions в тесте
        test.questions = updatedQuestionIds;
        await test.save();

        res.status(200).json(test);
    } catch (error) {
        console.error("Ошибка при обновлении теста с вопросами:", error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteTest = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await Test.findByIdAndDelete(id);
        if (!test) return res.status(404).json({ error: 'Test not found' });
        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
