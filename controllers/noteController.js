const Note = require('../models/Note');
const User = require('../models/User');

const createNote = async (req, res) => {
  try {
    const note = new Note({ ...req.body, owner: req.user.id });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user.id }).populate('sharedWith');
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const shareNote = async (req, res) => {
    console.log('Request received:', req.body); // Log request body
    const { noteId, recipientEmail } = req.body;
  
    try {
      if (!noteId || !recipientEmail) {
        return res.status(400).json({ error: 'Missing noteId or recipientEmail' });
      }
  
      const note = await Note.findOne({ _id: noteId, owner: req.user.id });
      if (!note) {
        return res.status(404).json({ error: 'Note not found or access denied' });
      }
  
      const recipient = await User.findOne({ email: recipientEmail });
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }
  
      if (note.sharedWith.includes(recipient._id)) {
        return res.status(400).json({ error: 'Note already shared with this user' });
      }
  
      note.sharedWith.push(recipient._id);
      await note.save();
  
      // Populate the sharedWith field with user details (name or email)
      const updatedNote = await Note.findById(noteId).populate('sharedWith', 'name email');
  
      res.status(200).json({ message: 'Note shared successfully', note: updatedNote });
    } catch (error) {
      console.error('Error in shareNote:', error); // Log errors
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };

  const removeCollaborator = async (req, res) => {
    try {
      const { noteId, recipientEmail } = req.params;
      const userId = req.user.id;
  
      console.log('Note ID:', noteId);
      console.log('Recipient Email:', recipientEmail);
      console.log('Authenticated User ID:', userId);
  
      const note = await Note.findOne({ _id: noteId, owner: userId });
      if (!note) {
        console.log('Note not found or user is not the owner');
        return res.status(404).json({ error: 'Note not found or access denied' });
      }
  
      const userToRemove = await User.findOne({ email: recipientEmail });
      if (!userToRemove) {
        console.log('User to remove not found');
        return res.status(404).json({ error: 'User to remove not found' });
      }
  
      note.sharedWith = note.sharedWith.filter(
        sharedUserId => sharedUserId.toString() !== userToRemove._id.toString()
      );
      await note.save();
  
      const updatedNote = await Note.findById(noteId).populate(
        'sharedWith',
        'name email'
      );
  
      res.status(200).json({ message: 'Collaborator removed', note: updatedNote });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };
  
  
  
  

module.exports = { createNote, getNotes, updateNote, deleteNote, shareNote, removeCollaborator };