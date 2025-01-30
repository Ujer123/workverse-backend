const { Server } = require('socket.io');

const setupSocket = (server) => {
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('join-note', (noteId) => {
      socket.join(noteId);
    });

    socket.on('update-note', (noteId, updatedContent) => {
      socket.to(noteId).emit('note-updated', updatedContent);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;
