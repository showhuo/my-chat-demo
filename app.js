const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { mongoClient } = require('./mongo-client');
const { updateMessages, initFakeData } = require('./utils');

const app = express();
const server = http.Server(app);

initFakeData(mongoClient);

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

  // 查询所有对话
  socket.on('get-conversations', async () => {
    try {
      console.log('get-conversations:', username);
      const cursor = mongoClient.db('demo').collection('conversations').find({ participants: username });
      const length = await cursor.count();
      const res = await cursor.toArray();
      // console.log('conversations:', res);

      io.to(username).emit('return-get-conversations', length ? res : []);
    } catch (error) {
      console.error(error);
    }
  });

  // 查询消息
  socket.on('get-message', async ({
    sender, conversationId,
  }) => {
    try {
      const msgItemsCursor = mongoClient
        .db('demo')
        .collection('messages')
        .find({ conversationId });
        // TODO 可以按需查询，比如每次只查20条，前端可配合实现无限列表
      io.to(sender).emit('return-get-message', await msgItemsCursor.count() ? await msgItemsCursor.toArray() : []);
    } catch (error) {
      console.error(error);
    }
  });

  // 发送消息
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
