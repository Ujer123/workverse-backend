const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Add this import
const Note = require('../models/Note'); // Add this import

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "https://workverse-frontend.netlify.app",
        "http://localhost:3000"
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  // Add authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));

      // Attach user information to the socket
      socket.userId = user._id;
      socket.userEmail = user.email;
      socket.userName = user.name;
      
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected', socket.id, 'User ID:', socket.userId);

    // Modified join-user handler
    socket.on('join-user', async () => {
      try {
        console.log(`User ${socket.userName} (${socket.userEmail}) joined their room`);
        
        // Join user-specific room using their ID
        socket.join(socket.userId);
        
        // Emit user info
        socket.emit('user-info', { 
          name: socket.userName, 
          email: socket.userEmail 
        });
      } catch (err) {
        console.error("Error in join-user:", err);
      }
    });

    // Improved note update handler
    socket.on('update-note', async ({ noteId, updatedContent }) => {
      try {
        // Verify note access
        const note = await Note.findOne({
          _id: noteId,
          collaborators: socket.userId
        });

        if (!note) {
          return socket.emit('update-error', 'Note not found or no permission');
        }

        // Update the note
        const updatedNote = await Note.findByIdAndUpdate(
          noteId,
          { content: updatedContent, updatedAt: new Date() },
          { new: true }
        );

        // Broadcast with editor info
        io.to(noteId).emit('note-updated', {
          noteId,
          updatedContent: updatedNote.content,
          editor: {
            name: socket.userName,
            email: socket.userEmail,
            timestamp: new Date()
          }
        });

      } catch (err) {
        console.error('Update error:', err);
        socket.emit('update-error', 'Failed to update note');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;