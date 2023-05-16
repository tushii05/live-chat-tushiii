const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./helpers/formatDate')
const {
  getActiveUser,
  exitRoom,
  newUser,
  getIndividualRoomUsers,
} = require('./helpers/userHelper');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set public directory
app.use(express.static(path.join(__dirname, 'public')));

// // this block will run when the client connects
// io.on('connection', socket => {
//   socket.on('joinRoom', ({ username, room }) => {
//     const user = newUser(socket.id, username, room);

//     socket.join(user.room);

//     // General welcome
//     socket.emit('message', formatMessage("TushiiChatBox", 'Messages are limited to this room! '));

//     // Broadcast everytime users connects
//     socket.broadcast
//       .to(user.room)
//       .emit(
//         'message',
//         formatMessage("TushiiChatBox", `${user.username} has joined the room`)
//       );

//     // Current active users and room name
//     io.to(user.room).emit('roomUsers', {
//       room: user.room,
//       users: getIndividualRoomUsers(user.room)
//     });
//   });

//   // Listen for client message
//   socket.on('chatMessage', msg => {
//     const user = getActiveUser(socket.id);

//     io.to(user.room).emit('message', formatMessage(user.username, msg));
//   });

//   // Runs when client disconnects
//   socket.on('disconnect', () => {
//     const user = exitRoom(socket.id);

//     if (user) {
//       io.to(user.room).emit(
//         'message',
//         formatMessage("TushiiChatBox", `${user.username} has left the room`)
//       );

//       // Current active users and room name
//       io.to(user.room).emit('roomUsers', {
//         room: user.room,
//         users: getIndividualRoomUsers(user.room)
//       });
//     }
//   });
// });



io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = newUser(socket.id, username, room);

    if (!room) {
      // User has not yet joined a room
      socket.emit('error', 'Please join a room before sending a message.');
      return;
    }

    socket.join(user.room);

    // General welcome
    socket.emit('message', formatMessage("TushiiChatBox", 'Messages are limited to this room! '));

    // Broadcast everytime users connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage("TushiiChatBox", `${user.username} has joined the room`)
      );

    // Current active users and room name
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getIndividualRoomUsers(user.room)
    });
  });

  // Listen for client message
  socket.on('chatMessage', msg => {
    const user = getActiveUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = exitRoom(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage("TushiiChatBox", `${user.username} has left the room`)
      );

      // Current active users and room name
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getIndividualRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Live Chat app started at http://localhost:${PORT}`));