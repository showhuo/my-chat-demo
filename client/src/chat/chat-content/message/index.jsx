import { useState } from "react";
import { currentUser } from "../../../config";
import Avatar from "./avatar";
import Quote from "./quote";

export default function Message({ message, setQuote }) {
  const [showExtraButtons, setShowExtraButtons] = useState(false);
  const { sender, time, body, quote } = message;

  return (
    <div className={`msg-container ${sender === currentUser ? "mine" : ""}`}>
      <div
        className={`message `}
        onMouseEnter={() => {
          setShowExtraButtons(true);
        }}
        onMouseLeave={() => {
          setShowExtraButtons(false);
        }}
      >
        <Avatar />
        <div className="text-container">
          <div className="headline">
            <span className="name">{sender}</span>
            <span className="time">{new Date(time).toLocaleTimeString()}</span>
          </div>
          <div className="content">
            <div className="msg">{body}</div>
            {showExtraButtons && (
              <button
                className="quote-button"
                title="quote"
                onClick={() => setQuote(message)}
              >
                quote
              </button>
            )}
          </div>
          {quote && <Quote quote={quote} />}
        </div>
      </div>
    </div>
  );
}
