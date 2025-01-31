const express = require('express');
const { createNote, getNotes, updateNote, deleteNote, shareNote, removeCollaborator} = require('../controllers/noteController');
const authenticate = require('../middleware/authMiddleware');
const Note = require('../models/Note');
const router = express.Router();

router.use(authenticate);

router.post('/', createNote);
router.get('/', getNotes);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/share', shareNote);
router.delete("/notes/remove-collaborator", removeCollaborator); 
  
  

module.exports = router;
