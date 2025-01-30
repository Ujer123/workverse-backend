const express = require('express');
const { createNote, getNotes, updateNote, deleteNote, shareNote } = require('../controllers/noteController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.post('/', createNote);
router.get('/', getNotes);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/share', shareNote);

module.exports = router;
