const Note = require('../models/Note');
const User = require('../models/User');

const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    // Create and save the note
    const note = new Note({
      title,
      content,
      owner: userId,
    });

    await note.save();

    // Add note to user's notes array
    await User.findByIdAndUpdate(
      userId,
      { $push: { notes: note._id } },
      { new: true }
    );

    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note." });
  }
};

const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get both owned and shared notes with population
    const notes = await Note.find({
      $or: [
        { owner: userId },
        { 'sharedWith.user': userId }
      ]
    })
    .populate('owner', '_id email')
    .populate('sharedWith.user', '_id email');

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes." });
  }
};

const updateNote = async (req, res) => {
  try {

    const note = await Note.findOneAndUpdate(
      { 
        _id: req.params.id,
        
      },
      req.body,
      { new: true }
    );

    if (!note) return res.status(404).json({ error: 'Note not found or insufficient permissions' });
    // req.app.get('io').to(note._id.toString()).emit('note-updated', note);
    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    // Only owner can delete
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!note) return res.status(404).json({ error: 'Note not found or unauthorized' });
    
    // Remove note reference from user's notes array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { notes: note._id } }
    );

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const shareNote = async (req, res) => {
  const { noteId, recipientEmail } = req.body;

  try {
    const note = await Note.findOne({ 
      _id: noteId,
      owner: req.user.id 
    });

    if (!note) return res.status(404).json({ error: 'Note not found or unauthorized' });

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) return res.status(404).json({ error: 'User not found' });

    // Check if already shared
    const isShared = note.sharedWith.some(sw => 
      sw.user.toString() === recipient._id.toString()
    );

    if (!isShared) {
      note.sharedWith.push({ 
        user: recipient._id,
        canEdit: false // Add permission flags
      });
      await note.save();
    }

    const populatedNote = await Note.findById(noteId)
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email');

    res.status(200).json({ 
      message: 'Note shared successfully',
      note: populatedNote
    });
  } catch (error) {
    console.error('Error sharing note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeCollaborator = async (req, res) => {
  const { noteId } = req.params;
  const { email } = req.body;

  try {
    const note = await Note.findOne({
      _id: noteId,
      owner: req.user.id
    }).populate('sharedWith.user');

    if (!note) return res.status(404).json({ error: 'Note not found or unauthorized' });


    const collaborator = await User.findOne({ email });
    if (!collaborator) return res.status(404).json({ error: 'User not found' });

    console.log('Removing collaborator:', {
      noteId: noteId,
      collaboratorEmail: email,
      collaboratorId: collaborator._id
    });

    // Remove collaborator
    note.sharedWith = note.sharedWith.filter(sw => 
      sw.user._id.toString() !== collaborator._id.toString()
    );

    await note.save();
    res.status(200).json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createNote, getNotes, updateNote, deleteNote, shareNote, removeCollaborator };