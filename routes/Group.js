import express from 'express';
import { createGroup, getAllGroups, updateGroup, deleteGroup } from '../controllers/GroupController.js';

const router = express.Router();

router.post('/groups', createGroup);
router.get('/groups', getAllGroups);
router.put('/groups/:id', updateGroup);
router.delete('/groups/:id', deleteGroup);

export default router;
