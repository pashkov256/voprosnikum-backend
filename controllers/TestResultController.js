import Question from "../models/Question.js";
import Test from '../models/Test.js';
import TestAnswer from "../models/TestAnswer.js";
import TestResult from '../models/TestResult.js';
import User from '../models/User.js';
export const createTestResult = async (req, res) => {
    try {
        const { test, student, dateStart, randomizedQuestionsSetIndex } = req.body;

        // Проверяем существование теста и ученика
        const testExists = await Test.findById(test);
        const studentExists = await User.findById(student);

        if (!testExists) return res.status(404).json({ message: "Тест не найден" });
        if (!studentExists) return res.status(404).json({ message: "Пользователь не найден" });

        const newTestResult = new TestResult({
            test,
            student,
            testAnswers: [],
            // score:score,
            dateStart,
            randomizedQuestionsSetIndex
        });

        const savedTestResult = await newTestResult.save();
        return res.status(201).json(savedTestResult);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Ошибка при создании результата теста", error });
    }
};

export const checkTestResult = async (req, res) => {
    try {
        const { testId, studentId } = req.body
        const result = await TestResult.findOne({ test: testId, student: studentId });
        return result !== null;
    } catch (error) {
        console.error(error);
        return false;  // В случае ошибки возвращаем false
    }
};

export const getTestResultByStudentAndTest = async (req, res) => {
    try {
        const { studentId, testId } = req.params;

        // Проверка наличия параметров
        if (!studentId || !testId) {
            return res.status(400).json({ message: "Не указан studentId или testId." });
        }

        // Поиск TestResult по studentId и testId
        const testResult = await TestResult.findOne({
            student: studentId,
            test: testId,
        }).populate({
            path: "student",
            model: "Users",
            select: '-passwordHash'
        })
            .populate({
                path: "testAnswers",
                model: "TestAnswer",
            })
        //'-role -login -passwordHash -plainPassword -group -createdAt -updatedAt -__v'
        // Если результат не найден
        if (!testResult) {
            return res.status(404).json({ message: "Результат теста не найден." });
        }

        // Возвращаем найденный результат
        res.status(200).json(testResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при получении результата теста." });
    }
};

export const createTestAnswer = async (req, res) => {
    try {
        const { testResult, question, answer, selectedOptions, isTimeFail, shortAnswer } = req.body;

        let isCorrect;
        // Проверка существования результата теста
        const testResultExists = await TestResult.findById(testResult).populate({
            path: "testAnswers",
            model: TestAnswer,
        });
        if (!testResultExists) {
            return res.status(404).json({ message: "Результат теста не найден" });
        }

        // Проверка существования вопроса
        const questionExists = await Question.findById(question);
        if (!questionExists) {
            return res.status(404).json({ message: "Вопрос не найден" });
        }

        const test = await Test.findById(testResultExists.test);

        let pointsAwarded = 0;

        // Логика начисления баллов
        if (isTimeFail) {
            // Если время истекло, ученик не ответил
            pointsAwarded = 0;
        } else if (questionExists.type == 'multiple-choice') {
            // Если пользователь выбрал варианты ответа


            const correctSet = new Set(questionExists.correctAnswers);
            const selectedSet = new Set(selectedOptions);
            if (correctSet.size !== 0) {
                if (selectedSet.size !== questionExists.options) {//если пользователь не выбрал все варианты ответа
                    const correctSelections = [...selectedSet].filter((option) => correctSet.has(option));
                    const incorrectSelections = [...selectedSet].filter((option) => !correctSet.has(option));

                    pointsAwarded += correctSelections.length * questionExists.multipleChoicePoints; // +questionExists.multipleChoicePoints за каждый правильный вариант
                    pointsAwarded -= incorrectSelections.length * questionExists.multipleChoicePoints; // -questionExists.multipleChoicePoints за каждый неправильный вариант
                } else {
                    pointsAwarded = 0
                }
            } else {
                pointsAwarded = questionExists.multipleChoicePoints
            }
        } else if (questionExists.type == 'short-answer') {
            // Если это текстовый ответ
            const answerIsCorrect = String(shortAnswer).toLowerCase() === String(questionExists.shortAnswer).toLowerCase();
            isCorrect = answerIsCorrect
            pointsAwarded = answerIsCorrect ? questionExists.shortAnswerPoints : 0;
        } else if (questionExists.type == 'single-choice') {
            // Если это ответ с выбором одного варианта
            if (questionExists?.correctAnswers?.includes(selectedOptions[0])) {
                pointsAwarded = questionExists.singleChoicePoints;
                isCorrect = true

            } else {
                pointsAwarded = 0;
                isCorrect = false
            }
        }
        // Если итоговое количество баллов отрицательное, приводим к нулю
        pointsAwarded = Math.max(pointsAwarded, 0);

        // Создание нового ответа
        const newTestAnswer = new TestAnswer({
            testResult,
            question,
            isTimeFail,
            isCorrect: isCorrect,
            selectedOptions: selectedOptions,
            shortAnswer,
            pointsAwarded
        });

        // Обновление баллов
        testResultExists.points += pointsAwarded;


        // Процентное соотношение: points пользователя относительно максимального количества баллов
        const percentage = (testResultExists.points / test.maxPoints) * 100;

        // Система оценивания
        if (percentage >= 80) {
            testResultExists.score = 5;
        } else if (percentage >= 70) {
            testResultExists.score = 4;
        } else if (percentage >= 50) {
            testResultExists.score = 3;
        } else {
            testResultExists.score = 2;
        }

        // Сохранение нового ответа и обновлённого результата теста
        const savedTestAnswer = await newTestAnswer.save();
        testResultExists.testAnswers.push(savedTestAnswer._id);
        await testResultExists.save();

        return res.status(201).json({
            message: "Ответ успешно создан",
            testAnswer: newTestAnswer,
        });
    } catch (error) {
        console.error("Ошибка при создании ответа на тест:", error);
        return res.status(500).json({ message: "Ошибка на сервере" });
    }
};

export const updateTestAnswer = async (req, res) => {
    try {
        const { testAnswerId, selectedOptions, shortAnswer, isTimeFail, pointsAwardedOld } = req.body;

        // Проверяем наличие ответа
        const testAnswer = await TestAnswer.findById(testAnswerId).populate({
            path: "question",
            model: Question,
        });
        if (!testAnswer) {
            return res.status(404).json({ message: "Ответ на вопрос не найден" });
        }

        // Проверяем наличие тестового результата
        const testResult = await TestResult.findById(testAnswer.testResult).populate({
            path: "testAnswers",
            model: TestAnswer,
        });
        if (!testResult) {
            return res.status(404).json({ message: "Результат теста не найден" });
        }

        const test = await Test.findById(testResult.test);
        if (!test) {
            return res.status(404).json({ message: "Тест не найден" });
        }

        const question = testAnswer.question;
        let pointsAwarded = 0;
        let isCorrect = false;

        // Логика начисления баллов
        if (isTimeFail) {
            pointsAwarded = 0; // Время истекло, баллы не начисляются
        } else if (question.type === "multiple-choice") {
            const correctSet = new Set(question.correctAnswers);
            const selectedSet = new Set(selectedOptions);


            if (correctSet.size !== 0) {
                const correctSelections = [...selectedSet].filter((option) => correctSet.has(option));
                const incorrectSelections = [...selectedSet].filter((option) => !correctSet.has(option));


                pointsAwarded += correctSelections.length * question.multipleChoicePoints; // +0.5 за каждый правильный вариант
                pointsAwarded -= incorrectSelections.length * question.multipleChoicePoints; // -0.5 за каждый неправильный вариант
            } else {
                pointsAwarded = question.multipleChoicePoints; // Если правильных вариантов нет
            }
        } else if (question.type === "short-answer") {
            const answerIsCorrect =
                String(shortAnswer).toLowerCase() === String(question.shortAnswer).toLowerCase();
            isCorrect = answerIsCorrect;
            pointsAwarded = answerIsCorrect ? question.shortAnswerPoints : 0;
        } else if (question.type === "single-choice") {
            if (question.correctAnswers.includes(selectedOptions[0])) {
                pointsAwarded = question.singleChoicePoints;
                isCorrect = true;
            } else {
                pointsAwarded = 0;
                isCorrect = false;
            }
        }

        // Если итоговое количество баллов отрицательное, приводим к нулю
        pointsAwarded = Math.max(pointsAwarded, 0);

        // Обновляем ответ
        testAnswer.selectedOptions = selectedOptions || testAnswer.selectedOptions;
        testAnswer.shortAnswer = shortAnswer || testAnswer.shortAnswer;
        testAnswer.isTimeFail = isTimeFail;
        testAnswer.pointsAwarded = pointsAwarded;
        testAnswer.isCorrect = isCorrect;

        // Пересчитываем баллы для тестового результата
        const previousPoints = testAnswer.pointsAwarded;

        testResult.points += pointsAwarded - pointsAwardedOld;

        // Пересчитываем процент выполнения теста
        const percentage = (testResult.points / test.maxPoints) * 100;

        // Обновляем оценку 
        if (percentage >= 80) {
            testResult.score = 5;
        } else if (percentage >= 70) {
            testResult.score = 4;
        } else if (percentage >= 50) {
            testResult.score = 3;
        } else {
            testResult.score = 2;
        }

        await testAnswer.save();
        await testResult.save();

        return res.status(200).json({
            testAnswer,
        });
    } catch (error) {
        console.error("Ошибка при обновлении ответа на тест:", error);
        return res.status(500).json({ message: "Ошибка на сервере" });
    }
};


export const getAllTestResults = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.params);

        const results = await TestResult.find({ test: id })
            .populate({
                path: 'testAnswers',
                populate: {
                    path: 'question',
                    select: 'title timeLimit correctAnswers shortAnswer type',
                },
            })
            .populate({
                path: 'student',
                select: 'fullName _id',
                model: User,
            });

        console.log(results);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTestResult = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        console.log({ updates });
        const result = await TestResult.findByIdAndUpdate(id, updates, { new: true });
        if (!result) return res.status(404).json({ error: 'Test result not found' });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTestResult = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.userId);
        const userRole = user.role;
        if (userRole !== 'student') {
            const result = await TestResult.findByIdAndDelete(id);
            if (!result) return res.status(404).json({ error: 'Результат теста не найден' });
            res.status(200).json({ message: 'Тест успешно удалён' });
        } else {
            return res.status(403).json({
                message: "Доступ запрещён. Ученики не могут выполнять эту операцию.",
            });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

