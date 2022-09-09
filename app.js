const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const http = require('http');

const server = http.Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const port = process.env.PORT || 4000;
const uri = 'mongodb+srv://demo:1234@cluster0.30iqypb.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function connectToDB() {
  try {
    await client.connect();
    console.log('connectToDB successfully');
  } catch (err) {
    console.log(err);
    client.close();
  }
}
connectToDB();

function getMsgOwner(msg) {
  const { isGroupMsg, sender, receiver } = msg;
  return isGroupMsg ? receiver : [sender, receiver].sort().join('-');
}

async function updateMessages(msg) {
  const owner = getMsgOwner(msg);
  await client.db('demo').collection('messages').updateOne({ owner }, { $push: { messages: msg } }, { upsert: true });
}

io.on('connection', (socket) => {
  const { username = 'userA' } = socket.handshake.auth;
  socket.join(username);
  socket.join('groupA'); // 简化实现，假设大家都是groupA成员
  // 查询对话
  socket.on('get-message', async ({ isGroupMsg, sender, receiver }) => {
    const owner = getMsgOwner({ isGroupMsg, sender, receiver });
    const msgItem = await client.db('demo').collection('messages').findOne({ owner });
    io
      .to(sender)
      .emit('return-get-message', msgItem?.messages);
  });
  // 发送对话
  socket.on('send-message', async (msg) => {
    const { receiver } = msg;
    await updateMessages(msg);
    socket
      .to(receiver)
      .emit('return-send-message', msg);
  });

  // TODO 删除消息
  socket.on('delete-message', async () => {});
});

app.use(express.static('./client/build'));

app.get('*', (req, res) => {
  res.sendFile(`${__dirname}/client/build/index.html`);
});

server.listen(port, async () => {
  http.get({ host: 'api.ipify.org', port: 80, path: '/' }, (resp) => {
    resp.on('data', (ip) => {
      console.log(`My public IP address is: ${ip}`);
      console.log(`Socket.IO server running at ${`${ip}:${port}`}`);
    });
  });
});
