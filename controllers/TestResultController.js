import Question from "../models/Question.js";
import Test from '../models/Test.js';
import TestAnswer from "../models/TestAnswer.js";
import TestResult from '../models/TestResult.js';
import User from '../models/User.js';
export const createTestResult = async (req, res) => {
    try {
        const { test, student, dateStart,randomizedQuestionsSetIndex } = req.body;

        // Проверяем существование теста и ученика
        const testExists = await Test.findById(test);
        const studentExists = await User.findById(student);

        if (!testExists) return res.status(404).json({ message: "Тест не найден" });
        if (!studentExists) return res.status(404).json({ message: "Пользователь не найден" });

        const newTestResult = new TestResult({
            test,
            student,
            testAnswers:[],
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
        const {testId,studentId} = req.body
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

// export const createTestAnswer = async (req, res) => {
//     try {
//         const { testResult, question, answer,isCorrect } = req.body;
//         console.log(req.body)
//         // Проверка обязательных данных
//         // if (!testResult || !question || !answer || !isCorrect) {
//         //     return res.status(400).json({ message: "Все поля (testResult, question, answer) обязательны для заполнения" });
//         // }

//         // Проверка существования результата теста
//         const testResultExists = await TestResult.findById(testResult).populate({
//             path: "testAnswers",
//             model: TestAnswer,
//         });
//         if (!testResultExists) {
//             return res.status(404).json({ message: "Результат теста не найден" });
//         }

//         // Проверка существования вопроса
//         const questionExists = await Question.findById(question);
//         if (!questionExists) {
//             return res.status(404).json({ message: "Вопрос не найден" });
//         }

//         let test = await Test.findById(testResultExists.test)
//         console.log(`testResultExists.test ${testResultExists.test}`)
//         console.log(test)

//         // Создание нового ответа
//         const newTestAnswer = new TestAnswer({
//             testResult,
//             question,
//             // answer,
//             isCorrect
//         });
//         let countTrueAnswers = testResultExists.testAnswers.filter((answ)=>answ.isCorrect).length
//         if(isCorrect){
//             countTrueAnswers += 1
//         }
//         console.log(`countTrueAnswers ${countTrueAnswers}`)
//         let resultScore = Math.floor((countTrueAnswers / test.questions.length) * 10)

//         console.log(resultScore)
//         let ocenka = 0
//         if(resultScore == 10){
//             ocenka = 5
//         } else if (resultScore >= 8 || resultScore == 9 ){
//             ocenka = 4
//         } else if(resultScore >= 6 || resultScore == 7 ){
//             ocenka = 3
//         } else if (resultScore <= 5 ){
//             ocenka = 2
//         }


//         console.log(`resultScore ${resultScore}`)

//         // Сохранение в базе данных
//         const savedTestAnswer = await newTestAnswer.save();
//         testResultExists.score =ocenka
//         testResultExists.testAnswers.push(savedTestAnswer._id);
//         await testResultExists.save();
//         return res.status(201).json({
//             message: "Ответ успешно создан",
//             testAnswer: newTestAnswer
//         });
//     } catch (error) {
//         console.error("Ошибка при создании ответа на тест:", error);
//         return res.status(500).json({ message: "Ошибка на сервере" });
//     }
// };
export const createTestAnswer = async (req, res) => {
    try {
        const { testResult, question, answer, isCorrect, selectedAnswerOptions, correctAnswers, isTimeFail } = req.body;

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
        } else if (selectedAnswerOptions && correctAnswers) {
            // Если пользователь выбрал варианты ответа
            const correctSet = new Set(correctAnswers);
            const selectedSet = new Set(selectedAnswerOptions);

            // Подсчёт правильных и неправильных ответов
            const correctSelections = [...selectedSet].filter((option) => correctSet.has(option));
            const incorrectSelections = [...selectedSet].filter((option) => !correctSet.has(option));

            // Начисление и вычитание баллов
            pointsAwarded += correctSelections.length * 0.5; // +0.5 за каждый правильный вариант
            pointsAwarded -= incorrectSelections.length * 0.5; // -0.5 за каждый неправильный вариант

            // Если итоговое количество баллов отрицательное, приводим к нулю
            pointsAwarded = Math.max(pointsAwarded, 0);
        } else if (isCorrect !== undefined) {
            // Если это текстовый ответ
            pointsAwarded = isCorrect ? 1 : 0;
        }

        // Создание нового ответа
        const newTestAnswer = new TestAnswer({
            testResult,
            question,
            answer,
            isCorrect,
        });

        // Обновление баллов
        testResultExists.points += pointsAwarded;

        // Пересчёт максимального количества баллов
        const totalPointsPossible = test.questions.reduce((sum, q) => {
            if (q.options && q.correctAnswers) {
                return sum + q.correctAnswers.length * 0.5; // Каждый правильный вариант — 0.5 балла
            } else {
                return sum + 1; // Текстовый вопрос даёт 1 балл
            }
        }, 0);

        // Процентное соотношение: points пользователя относительно максимального количества баллов
        const percentage = (testResultExists.points / totalPointsPossible) * 100;

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



export const getAllTestResults = async (req, res) => {
    try {
        const {id} = req.params
        console.log(req.params)
        const results = await TestResult.find({ test: id }).populate('testAnswers').populate({
            path: "student",
            model: User,
        });
        console.log(results)
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTestResult = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`id ${id}`);
        
        const updates = req.body;
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
        const result = await TestResult.findByIdAndDelete(id);
        if (!result) return res.status(404).json({ error: 'Test result not found' });
        res.status(200).json({ message: 'Test result deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

