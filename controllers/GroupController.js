import Group from '../models/Group.js';

export const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
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
