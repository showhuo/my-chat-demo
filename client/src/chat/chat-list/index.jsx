import ChatListItem from "./chat-list-item";

export default function ChatList({
  chatList,
  currentChat,
  setCurrentChat,
  setConversationId,
}) {
  const list = chatList.map((chat, idx) => {
    return (
      <ChatListItem
        key={idx}
        item={chat}
        isActive={chat.name === currentChat}
        onClick={() => {
          setCurrentChat(chat.name);
          setConversationId(chat.conversationId);
        }}
      />
    );
  });

  return <div className="chat-list">{list}</div>;
}
