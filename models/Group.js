import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true }, // Название группы
    createdAt: { type: Date, default: Date.now } // Дата создания группы
});

export  default mongoose.model('Group', groupSchema);
