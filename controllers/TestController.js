import Test from '../models/Test.js';

export const createTest = async (req, res) => {
    try {
        const { name, description, teacher, group, deadline } = req.body;
        const test = new Test({ name, description, teacher, group, deadline });
        await test.save();
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

export const updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const test = await Test.findByIdAndUpdate(id, updates, { new: true });
        if (!test) return res.status(404).json({ error: 'Test not found' });
        res.status(200).json(test);
    } catch (error) {
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
