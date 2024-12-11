import express from 'express';
import {
    createGroup,
    getAllGroups,
    updateGroup,
    deleteGroup,
    getGroupById,
    addTeacherToGroup,
    removeTeacherFromGroup
} from '../controllers/GroupController.js';
import checkAuth from "../utils/checkAuth.js";

const router = express.Router();

router.post('/groups', createGroup);
router.post('/groups', createGroup);
router.post('/group/add-teacher', addTeacherToGroup );
router.delete('/group/delete-teacher', removeTeacherFromGroup );
router.get('/groups', getAllGroups);
router.put('/groups/:id', updateGroup);
router.get('/group/:id',checkAuth, getGroupById);
router.delete('/groups/:id', deleteGroup);

export default router;
