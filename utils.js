function getMsgOwner(msg) {
  const { isGroupMsg, sender, receiver } = msg;
  return isGroupMsg ? receiver : [sender, receiver].sort().join('-');
}

async function updateMessages(mongoClient, msg) {
  console.log('updateMessages: ', msg);
  try {
    await mongoClient
      .db('demo')
      .collection('messages')
      .insertOne(msg);
    // 创建一个简单的index
    mongoClient.db('demo').collection('messages').createIndex({ conversationId: 1 });
  } catch (error) {
    console.error(error);
  }
}

async function initFakeData(mongoClient) {
  if (await mongoClient.db('demo').collection('conversations').estimatedDocumentCount() >= 4) {
    console.log('conversations >= 4, dont insert fakeData');
    return;
  }
  try {
    const fakeConversations = [];
    const users = ['userA', 'userB', 'userC'];
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        fakeConversations.push({
          participants: [users[i], users[j]],
        });
      }
    }
    fakeConversations.push({
      participants: users,
    });
    console.log('initFakeData:', fakeConversations);
    await mongoClient.db('demo').collection('conversations').insertMany(fakeConversations);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getMsgOwner, updateMessages, initFakeData,
};
