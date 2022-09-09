import doge from "../../../doge.jpeg";

export default function Avatar({ url }) {
  return (
    <img
      className="avatar"
      src={url || doge}
      alt="avatar"
      style={{ width: 40, height: 40, borderRadius: "100%" }}
    />
  );
}
