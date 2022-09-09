import { useCallback, useRef } from "react";
import { useEffect, useState } from "react";
import { currentUser, socket } from "../../context";
import Quote from "./message/quote";

export default function ChatInput({
  receiver,
  quote,
  isGroupMsg,
  setCurrentChatData,
}) {
  const [inputValue, setInputValue] = useState();
  const [showQuote, setShowQuote] = useState(false);
  const textAreaRef = useRef();

  useEffect(() => {
    if (quote) setShowQuote(true);
  }, [quote]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
  };

  const submit = useCallback(() => {
    if (!inputValue) return;
    const data = {
      time: Date.now(),
      sender: currentUser,
      receiver,
      isGroupMsg,
      body: inputValue,
      quote: showQuote ? quote : null,
    };
    socket.emit("send-message", data);
    setCurrentChatData((prevData) => {
      const newData = [...prevData];
      newData.push(data);
      return newData;
    });
    setInputValue("");
    setShowQuote(false);
  }, [inputValue, isGroupMsg, quote, receiver, setCurrentChatData, showQuote]);

  useEffect(() => {
    const callback = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    };
    const ref = textAreaRef.current;
    ref.addEventListener("keypress", callback);

    return () => {
      ref.removeEventListener("keypress", callback);
    };
  }, [submit]);

  const deleteQuote = () => {
    setShowQuote(false);
  };

  return (
    <div className="chat-input">
      <textarea
        ref={textAreaRef}
        className="text-area"
        value={inputValue}
        onChange={handleInputChange}
      />
      {showQuote && (
        <div className="with-delete-quote">
          <Quote quote={quote} />
          <button className="delete-quote" onClick={deleteQuote} title="delete">
            X
          </button>
        </div>
      )}
    </div>
  );
}
