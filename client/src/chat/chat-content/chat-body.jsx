import { useEffect, useRef } from "react";
import Message from "./message";

export default function ChatBody({ currentChat, messages, setQuote }) {
  const ref = useRef();
  const list = messages?.map((message, idx) => {
    return <Message key={idx} message={message} setQuote={setQuote} />;
  });

  useEffect(() => {
    ref.current.scrollTo({ top: ref.current.scrollHeight });
  }, [currentChat, messages]);

  return (
    <div className="chat-body" ref={ref}>
      <div className="title">{currentChat}</div>
      {list}
    </div>
  );
}
