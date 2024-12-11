import Group from '../models/Group.js';
import UserModel from '../models/User.js';
export const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        console.log(name)
        const group = new Group({ name });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const group = await Group.findByIdAndUpdate(id, updates, { new: true });
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.findByIdAndDelete(id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addTeacherToGroup = async (req, res) => {
    try {
        // const requestingUserId = req.userId;
        // const requestingUser = await UserModel.findById(requestingUserId);
        // console.log(req.body)
        // if (!requestingUser || requestingUser.role !== "student") {
        //     return res.status(403).json({
        //         message: "Доступ запрещён. Только администратор может добавлять преподавателей в группы.",
        //     });
        // }
        const { groupId, teacherId } = req.body;

        if (!groupId || !teacherId) {
            return res.status(400).json({
                message: "Необходимо указать ID группы и ID преподавателя.",
            });
        }
        const teacher = await UserModel.findById({_id:teacherId});
        if (!teacher || teacher.role !== "teacher") {
            return res.status(400).json({
                message: "Пользователь с указанным ID либо не существует, либо не является преподавателем.",
            });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Группа не найдена." });
        }
        if (group.teachers.includes(teacherId)) {
            return res.status(400).json({
                message: "Этот преподаватель уже добавлен в группу.",
            });
        }
        group.teachers.push(teacherId);
        await group.save();

        res.status(200).json({
            message: "Преподаватель успешно добавлен в группу.",
            group,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при добавлении преподавателя в группу." });
    }
};


export const removeTeacherFromGroup = async (req, res) => {
    try {
        const { groupId, teacherId } = req.body;

        // Проверяем, указан ли groupId и teacherId
        if (!groupId || !teacherId) {
            return res.status(400).json({
                message: "Необходимо указать ID группы и ID учителя.",
            });
        }

        // Проверяем, существует ли группа
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                message: "Группа не найдена.",
            });
        }

        const teacher = await UserModel.findById(teacherId);
        if (!teacher || teacher.role !== "teacher") {
            return res.status(404).json({
                message: "Пользователь с указанным ID не найден или не является учителем.",
            });
        }

        const updatedTeachers = group.teachers.filter(
            (teacher) => teacher.toString() !== teacherId
        );

        group.teachers = updatedTeachers;
        await group.save();

        res.status(200).json({
            message: "Учитель успешно удалён из группы.",
            group,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Ошибка при удалении учителя из группы.",
        });
    }
};

export const getGroupById = async (req, res) => {
    try {
        const requestingUserId = req.userId;
        const requestingUser = await UserModel.findById(requestingUserId);

        if (!requestingUser || !["admin", "teacher"].includes(requestingUser.role)) {
            return res.status(403).json({
                message: "Доступ запрещён. Только администраторы или учителя могут выполнять эту операцию.",
            });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Не указан ID группы." });
        }

        const group = await Group.findById({_id:id}).populate({
            path: "teachers", // Поле, которое нужно заполнить
            select: "_id fullName",
            // Поля, которые нужно оставить у преподавателей
        });

        if (!group) {
            return res.status(404).json({ message: "Группа не найдена." });
        }

        res.status(200).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при получении данных группы." });
    }
};
