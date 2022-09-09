import { useState } from "react";
import ChatBody from "./chat-body";
import ChatInput from "./chat-input";

export default function ChatContent({
  currentChat,
  messages,
  isGroupMsg,
  setCurrentChatData,
}) {
  const [quote, setQuote] = useState();

  return (
    <div className="chat-content">
      <ChatBody
        messages={messages}
        setQuote={setQuote}
        currentChat={currentChat}
      />
      <ChatInput
        receiver={currentChat}
        quote={quote}
        isGroupMsg={isGroupMsg}
        setCurrentChatData={setCurrentChatData}
      />
    </div>
  );
}
