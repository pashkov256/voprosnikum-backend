import Group from '../models/Group.js';
import Question from '../models/Question.js';
import Test from '../models/Test.js';
import TestResult from "../models/TestResult.js";
import User from "../models/User.js";
import { createRandomizedQuestionsSets } from '../utils/shuffle.js';
export const createTest = async (req, res) => {
    try {
        const { name, description, teacher, group, deadline } = req.body;
        console.log({ name, description, teacher, group, deadline })
        const test = new Test({ name, description, teacher, group, deadline });
        await test.save();
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



export const getTestById = async (req, res) => {
    try {
        const { id, mode } = req.params; // mode: "student" или "full" 
        const user = await User.findById(req.userId);
        const userRole = user.role;

        if (!id) {
            return res.status(400).json({ message: "Не указан ID теста." });
        }

        // Проверка на корректный mode
        if (mode !== "student" && mode !== "full") {
            return res.status(400).json({ message: "Некорректный mode запроса. Используйте 'student' или 'full'." });
        }

        // Если mode === "full", проверяем роль пользователя
        if (mode === "full" && userRole !== "teacher") {
            return res.status(403).json({ message: "Доступ запрещён. Только учителя могут запрашивать полный тест." });
        }

        // Поиск теста
        const test = await Test.findById(id)
            .populate({
                path: "questions",
                model: Question,
                select: mode === "student" ? "-correctAnswers -__v -createdAt -shortAnswer" : "-__v -createdAt", // Убираем правильные ответы для student
            })
            .populate({
                path: "teacher",
                model: User,
                select: "-plainPassword -passwordHash",
            });

        if (!test) {
            return res.status(404).json({ message: "Тест не найден." });
        }

        res.status(200).json(test);
    } catch (error) {
        console.error("Ошибка при получении теста:", error);
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
        const { teacherId } = req.params;
        const { sortGroupBy } = req.body; // Получаем сортировку по группе из тела запроса

        if (!sortGroupBy) {
            return res.status(400).json({ message: 'Поле sortGroupBy обязательно.' });
        }

        let query = { teacher: teacherId }; // Базовый запрос для поиска тестов

        // Добавляем условие поиска по группе, если sortGroupBy не равен "all"
        if (sortGroupBy !== "all") {
            query.group = sortGroupBy;
        }

        const tests = await Test.find(query).populate({
            path: "group",
            model: Group,
            select: "-teachers -createdAt",
        });

        if (!tests || tests.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(tests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};



export const updateTest = async (req, res) => {
    try {
        const { id } = req.params; // ID теста
        const updates = req.body; // Измененные данные теста

        const { questions: updatedQuestions, randomizedQuestionsSets, ...testUpdates } = updates;

        // Устанавливаем обновления для теста
        const updateData = { ...testUpdates };

        // Если randomizedQuestionsSets отсутствует в req.body, удаляем это поле


        // 1. Обновляем сам тест (без вопросов)
        const test = await Test.findByIdAndUpdate(id, updateData, { new: true });
        if (!test) return res.status(404).json({ error: "Test not found" });

        // 2. Обрабатываем вопросы
        const updatedQuestionIds = [];
        const updatedQuestionData = [];
        let newQuestionsCount = 0
        for (const question of updatedQuestions) {
            // if (question._id) {
            if (!question?.isNewQuestion) {
                const updateQuestionData = {};
                for (const key in question) {
                    updateQuestionData[key] = question[key];
                }
                // Если timeLimit отсутствует, добавляем оператор $unset
                if (question.timeLimit === undefined) {
                    updateQuestionData.$unset = { timeLimit: "" }; // Удаляем поле timeLimit
                }
                const updatedQuestion = await Question.findByIdAndUpdate(
                    question._id,
                    updateQuestionData,
                    { new: true }
                );
                updatedQuestionIds.push(updatedQuestion._id);
                updatedQuestionData.push(updatedQuestion);
            } else {
                const { _id, ...newQuestionData } = question;
                const newQuestion = await Question.create(newQuestionData);
                updatedQuestionIds.push(newQuestion._id);
                updatedQuestionData.push(newQuestion);
                newQuestionsCount += 1;
            }
        }

        test.maxPoints = updatedQuestionData.reduce((sum, q) => {
            if (q.type === 'multiple-choice') {
                return sum + q.correctAnswers.length * 0.5; // Каждый правильный вариант — 0.5 балла
            } else if (q.type === 'single-choice') {
                return sum + 1;
            } else if (q.type === 'short-answer') {
                return sum + 1;
            }
        }, 0);

        if (randomizedQuestionsSets === undefined) {
            test.randomizedQuestionsSets = [];
        } else {
            test.randomizedQuestionsSets = randomizedQuestionsSets;
        }


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
