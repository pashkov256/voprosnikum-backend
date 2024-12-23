import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student'],
        required: true
    },
    login: { type: String, unique: true, required: true },
    passwordHash: {
        type: String,
        required: true,
    },
    plainPassword: {
        type: String, // Новое поле для хранения исходного пароля
        required: false,
    },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, // Group, only for students
    groupsTeacher: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: [] }],//групы учителя
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Users", userSchema);
