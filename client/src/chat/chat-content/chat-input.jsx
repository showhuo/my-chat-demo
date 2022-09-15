import { useCallback, useRef } from "react";
import { useEffect, useState } from "react";
import { currentUser, socket } from "../../config";
import Quote from "./message/quote";

export default function ChatInput({
  currentChat,
  quote,
  isGroupMsg,
  setCurrentChatData,
  updateBrief,
  conversationId,
}) {
  const [inputValue, setInputValue] = useState();
  const [showQuote, setShowQuote] = useState(false);
  const textAreaRef = useRef();

  const focusInput = useCallback(() => {
    textAreaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (quote) setShowQuote(true);
    focusInput();
  }, [focusInput, quote]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (textAreaRef.current.clientHeight < textAreaRef.current.scrollHeight)
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
  };

  const submit = useCallback(() => {
    if (!inputValue) return;
    const data = {
      time: Date.now(),
      sender: currentUser,
      receiver: currentChat,
      isGroupMsg,
      body: inputValue,
      quote: showQuote ? quote : null,
      conversationId,
    };
    socket.emit("send-message", data);
    setCurrentChatData((prevData) => {
      const newData = [...prevData];
      newData.push(data);
      return newData;
    });
    updateBrief(data, true);
    setInputValue("");
    setShowQuote(false);
    focusInput();
  }, [
    inputValue,
    currentChat,
    isGroupMsg,
    showQuote,
    quote,
    conversationId,
    setCurrentChatData,
    updateBrief,
    focusInput,
  ]);

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

  useEffect(() => {
    focusInput();
  }, [focusInput, currentChat]);

  return (
    <div className="chat-input" onClick={focusInput}>
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
