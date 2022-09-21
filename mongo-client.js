const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = 'mongodb+srv://demo:1234@cluster0.30iqypb.mongodb.net/?retryWrites=true&w=majority';
const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function connectToDB() {
  try {
    await mongoClient.connect();
    console.log('connectToDB successfully');
    // 创建一个conversationId index，方便根据对话id查询message
    mongoClient.db('demo').collection('messages').createIndex({ conversationId: 1 });
  } catch (err) {
    console.error(err);
    mongoClient.close();
  }
}

connectToDB();

module.exports = { mongoClient };
