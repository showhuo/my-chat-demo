const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const http = require('http');

const server = http.Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

const IS_DEV_MODE = process.env.DEV;
if (IS_DEV_MODE) console.log('This is local develop env, visit port 3000 pls.');

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
    console.error(err);
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
  console.log('updateMessages: ', msg);
  try {
    await client
      .db('demo')
      .collection('messages')
      .updateOne({ owner }, { $push: { messages: msg } }, { upsert: true });
  } catch (error) {
    console.error(error);
  }
}

io.on('connection', (socket) => {
  const { username = 'userA' } = socket.handshake.auth;
  console.log('user connected: ', username);
  socket.join(username);
  socket.join('groupA'); // 简化实现，假设大家都是groupA成员
  // 查询对话
  socket.on('get-message', async ({ isGroupMsg, sender, receiver }) => {
    const owner = getMsgOwner({ isGroupMsg, sender, receiver });
    try {
      const msgItem = await client
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
    await updateMessages(msg);
    socket.to(receiver).emit('return-send-message', msg);
  });

  // TODO 删除消息
  socket.on('delete-message', async () => {});
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
