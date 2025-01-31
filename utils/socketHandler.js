const { Server } = require('socket.io');

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

  io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    // When user joins their room, emit user info
    socket.on('join-user', async (userId) => {
      try {
        // Fetch user information from the database (e.g., MongoDB)
        const user = await User.findById(userId);

        if (user) {
          console.log(`User ${user.name} (${user.email}) joined their room`); // Replace with actual user properties

          // Emit the user's info to the socket
          socket.emit('user-info', { name: user.name, email: user.email });
        } else {
          console.log(`User with ID ${userId} not found`);
        }

        // Join user-specific room
        socket.join(userId);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    });


    // Handle note updates from clients
    socket.on('update-note', async ({ noteId, updatedContent }) => {
      try {
        // Broadcast update to all users who have access to the note
        io.to(noteId).emit('note-updated', { noteId, updatedContent });
      } catch (err) {
        console.error('Socket update error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;