import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { transliterate } from 'transliteration';
import Group from "../models/Group.js";
import Test from "../models/Test.js";
import TestResult from "../models/TestResult.js";
import UserModel from "../models/User.js";
dotenv.config();
export const register = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const doc = new UserModel({
            fullName: req.body.fullName,
            login: req.body.login,
            role: req.body.role,
            group: req.body.group,
            passwordHash: hash,
        });

        const user = await doc.save();

        const token = jwt.sign(
            {
                _id: user._id,
            },
            process.env.SECRET,
            {
                expiresIn: "120d",
            }
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({ ...userData, token });
    } catch (error) {
        console.log(error);
        res.json({ message: "Не удалось зарегестрироваться" });
    }
};

export const createUserByAdmin = async (req, res) => {
    try {
        const adminId = req.userId; // ID пользователя который отправил запрос из JWT

        // Проверяем, является ли текущий пользователь администратором
        const adminUser = await UserModel.findById(adminId);
        if (!adminUser || adminUser.role === 'student') {
            return res.status(403).json({ message: 'Доступ запрещён. Только администраторы могут выполнять эту операцию.' });
        }

        const { fullName, role, group } = req.body;

        if (!fullName || !role) {
            return res.status(400).json({ message: 'Поле fullName и role обязательны.' });
        }
        let fio = fullName.split(' ')
        let fln = [fio[0], fio[1]].join('')

        // Транслитерация имени и фамилии
        const transliteratedName = transliterate(fln.toLowerCase());
        const randomDigitsLogin = Math.floor(10000 + Math.random() * 90000);
        const login = `${transliteratedName}${randomDigitsLogin}`;
        const randomDigitsPasswordStart = Math.floor(10 + Math.random() * 90);
        const randomDigitsPasswordEnd = Math.floor(1000 + Math.random() * 9000);
        const password = `${randomDigitsPasswordStart}${transliteratedName}${randomDigitsPasswordEnd}`;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const doc = new UserModel({
            fullName,
            login,
            role,
            group: group || null, // Группа не обязательна
            passwordHash,
            plainPassword: password,
        });

        const newUser = await doc.save();

        res.status(201).json({
            message: 'Пользователь успешно создан.',
            user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                login: newUser.login,
                role: newUser.role,
                group: newUser.group,
                createdAt: newUser.createdAt,
                plainPassword: password,
            },
            generatedPassword: password,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при создании пользователя.' });
    }
};


export const getUsersByGroup = async (req, res) => {
    try {
        const requestingUserId = req.userId;
        const requestingUser = await UserModel.findById(requestingUserId);
        if (!requestingUser || !["admin", "teacher"].includes(requestingUser.role)) {
            return res.status(403).json({
                message: "Доступ запрещён. Только администраторы или учителя могут выполнять эту операцию.",
            });
        }

        const { groupId } = req.params;

        if (!groupId) {
            return res.status(400).json({ message: "Не указан ID группы." });
        }

        // Получаем всех пользователей, относящихся к данной группе
        const users = await UserModel.find({ group: groupId }).select("-passwordHash");

        // if (users.length === 0) {
        //     return res.status(404).json({ message: "В этой группе нет пользователей." });
        // }

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при получении пользователей группы." });
    }
};

// export const getTeacherAndTestsByStudentGroup = async (req, res) => {
//     try {
//         const studentId = req.userId; // ID текущего ученика, отправившего запрос

//         // Проверяем, существует ли пользователь и является ли он учеником
//         const student = await UserModel.findById(studentId);
//         if (!student || student.role !== "student") {
//             return res.status(403).json({
//                 message: "Доступ запрещён. Только ученики могут выполнять эту операцию.",
//             });
//         }

//         if (!student.group) {
//             return res.status(400).json({
//                 message: "У ученика не указана группа. Обратитесь к администратору.",
//             });
//         }

//         const group = await Group.findById(student.group).populate("teachers", "_id fullName");
//         if (!group) {
//             return res.status(404).json({ message: "Группа не найдена." });
//         }

//         const teacherData = await Promise.all(
//             group.teachers.map(async (teacher) => {
//                 const tests = await Test.find({ teacher: teacher._id });
//                 console.log(`tests ${tests}`);

//                 return {
//                     _id: teacher._id,
//                     fullName: teacher.fullName,
//                     tests: tests,
//                 };
//             })
//         );


//         res.status(200).json({
//             groupName: group.name,
//             teachers: teacherData,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Ошибка при получении данных учителей и тестов." });
//     }
// };

export const getTeacherAndTestsByStudentGroup = async (req, res) => {
    try {
        const studentId = req.userId;

        const student = await UserModel.findById(studentId);
        if (!student || student.role !== "student") {
            return res.status(403).json({
                message: "Доступ запрещён. Только ученики могут выполнять эту операцию.",
            });
        }

        if (!student.group) {
            return res.status(400).json({
                message: "У ученика не указана группа. Обратитесь к администратору.",
            });
        }

        const group = await Group.findById(student.group).populate("teachers", "_id fullName");
        if (!group) {
            return res.status(404).json({ message: "Группа не найдена." });
        }

        const teacherIds = group.teachers.map((teacher) => teacher._id);

        // Загрузка всех тестов и testResult за один запрос
        const testsWithResults = await Test.aggregate([
            { $match: { teacher: { $in: teacherIds } } },
            {
                $lookup: {
                    from: "testresults", // Коллекция testResult
                    let: { testId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$test", "$$testId"] },
                                        { $eq: ["$student", new mongoose.Types.ObjectId(studentId)] }
                                    ]
                                }
                            }
                        },
                        { $project: { completionTime: 1 } },
                    ],
                    as: "testResult",
                },
            },
            {
                $addFields: {
                    testIsComplete: {
                        $cond: {
                            if: { $gt: [{ $size: "$testResult" }, 0] },
                            then: { $ne: ["$testResult.0.completionTime", undefined] },
                            else: false,
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "groups", // Коллекция groups
                    localField: "group", // Поле в test, которое ссылается на group
                    foreignField: "_id", // Соответствующее поле в коллекции group
                    as: "groupDetails", // Результат будет помещён в groupDetails
                },
            },
            {
                $unwind: {
                    path: "$groupDetails", // Раскручиваем массив groupDetails, если он не пустой
                    preserveNullAndEmptyArrays: true, // Оставляем пустое значение, если группа не найдена
                },
            },
            {
                $project: {
                    createdAt: 1,
                    deadline: 1,
                    name: 1,
                    timeLimit: 1,
                    testIsComplete: 1,
                    teacher: 1,
                    startDate: 1,
                    groupDetails: 1, // добавляем groupDetails
                },
            },
        ]);

        const teacherData = group.teachers.map((teacher) => {
            const teacherTests = testsWithResults.filter((test) => {
                // Добавляем проверки на наличие groupDetails
                return (
                    String(test.teacher) === String(teacher._id) &&
                    test.groupDetails &&
                    test.groupDetails.name === group.name
                );
            });
            return {
                _id: teacher._id,
                fullName: teacher.fullName,
                tests: teacherTests,
            };
        });

        res.status(200).json({
            groupName: group.name,
            teachers: teacherData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при получении данных учителей и тестов." });
    }
};


export const getAllTeachers = async (req, res) => {
    try {
        const adminId = req.userId;

        // Проверяем, является ли текущий пользователь администратором
        const adminUser = await UserModel.findById(adminId);
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещён. Только администраторы могут выполнять эту операцию.' });
        }

        // Получение всех учителей
        const teachers = await UserModel.find({ role: 'teacher' }).select('-passwordHash');

        // Форматирование ответа
        const teachersWithPasswords = teachers.map((teacher) => ({
            ...teacher.toObject(),
            password: teacher.plainPassword || 'Пароль не доступен', // Добавляем поле `password`
        }));

        res.status(200).json(teachersWithPasswords);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении списка учителей.' });
    }
};

export const getMinimalTeachersList = async (req, res) => {
    try {
        const requestingUserId = req.userId;

        const requestingUser = await UserModel.findById(requestingUserId);
        if (!requestingUser || !["admin", "teacher"].includes(requestingUser.role)) {
            return res.status(403).json({
                message: "Доступ запрещён. Только администраторы или учителя могут выполнять эту операцию.",
            });
        }

        const teachers = await UserModel.find({ role: "teacher" }).select("_id fullName");

        res.status(200).json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при получении списка преподавателей." });
    }
};

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ login: req.body.login });
        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден",
            });
        }

        const isValidPass = await bcrypt.compare(
            req.body.password,
            user._doc.passwordHash
        );
        if (!isValidPass) {
            return res.status(400).json({
                message: "Неверный логин или пароль",
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            process.env.SECRET,
            {
                expiresIn: "120d",
            }
        );
        const { passwordHash, ...userData } = user._doc;
        res.json({ ...userData, token });
    } catch (error) {
        res.json({ message: "Не удалось авторизоваться" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId, "-passwordHash").populate({
            path: 'groupsTeacher',
            select: '-createdAt -updatedAt -__v -teachers',
        });

        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден",
            });
        }

        const { ...userData } = user._doc;

        res.json({ ...userData });
    } catch (error) {
        res.status(500).json({ message: "Нет доступа" });
    }
};
