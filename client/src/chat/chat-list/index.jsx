import ChatListItem from "./chat-list-item";

export default function ChatList({ chatList, currentChat, setCurrentChat }) {
  const list = chatList.map((chat, idx) => {
    return (
      <ChatListItem
        key={idx}
        item={chat}
        isActive={chat.name === currentChat}
        onClick={() => {
          setCurrentChat(chat.name);
        }}
      />
    );
  });

  return <div className="chat-list">{list}</div>;
}
