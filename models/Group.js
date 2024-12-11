import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true }, // Название группы
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: [] }],
    createdAt: { type: Date, default: Date.now } // Дата создания группы
});

export  default mongoose.model('Group', groupSchema);
