import Avatar from "./chat-content/message/avatar";

export default function ChatListItem({ item, isActive, onClick }) {
  const { name, avatarUrl, briefMsg, time } = item;
  return (
    <div
      className={`chat-list-item ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <Avatar url={avatarUrl} />
      <div className="texts">
        <div className="title">
          <span className="name">{name}</span>
          <span>{time}</span>
        </div>
        <span className="latest-msg">{briefMsg}</span>
      </div>
    </div>
  );
}
