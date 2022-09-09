const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { mongoClient } = require('./mongo-client');
const { getMsgOwner, updateMessages } = require('./utils');

const app = express();
const server = http.Server(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

const port = process.env.PORT || 4000;
const IS_DEV_MODE = process.env.DEV;
if (IS_DEV_MODE) console.log('This is local develop env.');

io.on('connection', (socket) => {
  const { username = 'userA' } = socket.handshake.auth;
  console.log('user connected: ', username);
  socket.join(username);
  socket.join('groupA'); // 简化实现，假设大家都是groupA成员

  // 查询对话
  socket.on('get-message', async ({ isGroupMsg, sender, receiver }) => {
    const owner = getMsgOwner({ isGroupMsg, sender, receiver });
    try {
      const msgItem = await mongoClient
        .db('demo')
        .collection('messages')
        .findOne({ owner });
      io.to(sender).emit('return-get-message', msgItem?.messages);
    } catch (error) {
      console.error(error);
    }
  });

  // 发送对话
  socket.on('send-message', async (msg) => {
    const { receiver } = msg;
    await updateMessages(mongoClient, msg);
    socket.to(receiver).emit('return-send-message', msg);
  });
});

app.use(express.static('./client/build'));

const htmlPath = `${__dirname}/client/${
  IS_DEV_MODE ? 'public' : 'build'
}/index.html`;

app.get('*', (_, res) => {
  res.sendFile(htmlPath);
});

server.listen(port, async () => {
  console.log(`Socket.IO server running at ${port}`);
});
