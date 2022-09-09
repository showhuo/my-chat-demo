function getMsgOwner(msg) {
  const { isGroupMsg, sender, receiver } = msg;
  return isGroupMsg ? receiver : [sender, receiver].sort().join('-');
}

async function updateMessages(mongoClient, msg) {
  const owner = getMsgOwner(msg);
  console.log('updateMessages: ', msg);
  try {
    await mongoClient
      .db('demo')
      .collection('messages')
      .updateOne({ owner }, { $push: { messages: msg } }, { upsert: true });
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getMsgOwner, updateMessages,
};
