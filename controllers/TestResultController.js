import TestResult from '../models/TestResult.js';

export const createTestResult = async (req, res) => {
    try {
        const { test, student, score } = req.body;
        const testResult = new TestResult({ test, student, score });
        await testResult.save();
        res.status(201).json(testResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllTestResults = async (req, res) => {
    try {
        const results = await TestResult.find().populate('test student');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTestResult = async (req, res) => {
    try {
        const { id } = req.params;
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
