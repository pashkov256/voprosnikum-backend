import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import dotenv from "dotenv";
import { transliterate } from 'transliteration';
dotenv.config();
export const register = async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        console.log(req.body);
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
                expiresIn: "30d",
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
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещён. Только администраторы могут выполнять эту операцию.' });
        }

        const { fullName, role, group  } = req.body;

        if (!fullName || !role) {
            return res.status(400).json({ message: 'Поле fullName и role обязательны.' });
        }

        // Транслитерация имени и фамилии
        const transliteratedName = transliterate(fullName.replace(/\s+/g, '').toLowerCase());
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
//
// export const getAllTeachers = async (req, res) => {
//     try {
//         const adminId = req.userId;
//         // Проверяем, является ли текущий пользователь администратором
//         console.log(adminId)
//         const adminUser = await UserModel.findById(adminId);
//         if (!adminUser || adminUser.role !== 'admin') {
//             return res.status(403).json({ message: 'Доступ запрещён. Только администраторы могут выполнять эту операцию.' });
//         }
//         // Получение всех пользователей с ролью "teacher"
//         const teachers = await UserModel.find({ role: 'teacher' }).select('-passwordHash');
//
//         res.status(200).json(teachers);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Ошибка при получении списка учителей.' });
//     }
// };

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


export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ login: req.body.login });
        console.log(user)
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
                expiresIn: "30d",
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
        const user = await UserModel.findById(req.userId, "-passwordHash");

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
