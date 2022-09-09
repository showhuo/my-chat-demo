export default function Quote({ quote }) {
  return (
    <div className="quote-container">
      <div className="quote-msg">
        <div className="bar" />
        <div className="the-msg">{quote?.body}</div>
      </div>
    </div>
  );
}
