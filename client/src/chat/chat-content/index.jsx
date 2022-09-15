import { useState } from "react";
import ChatBody from "./chat-body";
import ChatInput from "./chat-input";

export default function ChatContent(props) {
  const [quote, setQuote] = useState();

  return (
    <div className="chat-content">
      <ChatBody {...props} setQuote={setQuote} />
      <ChatInput {...props} quote={quote} />
    </div>
  );
}
