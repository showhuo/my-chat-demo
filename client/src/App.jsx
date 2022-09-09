import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import "./App.scss";
import ChatContent from "./chat/chat-content";
import ChatList from "./chat/chat-list";
import { currentUser, socket } from "./context";

function App() {
  const [currentChat, setCurrentChat] = useState("userA");
  const [currentChatData, setCurrentChatData] = useState([]);
  const [chatList, setChatList] = useState([
    { name: "", avatarUrl: "", briefMsg: "" },
  ]);

  // 简化实现，假设只有固定的几个对话
  useEffect(() => {
    const fakeChatList = ["userA", "userB", "userC", "groupA"]
      .filter((name) => name !== currentUser)
      .map((name) => ({
        name,
        avatarUrl: "",
        briefMsg: "",
      }));
    setChatList(fakeChatList);
  }, []);

  const getCurrentChatData = useCallback(() => {
    socket.emit("get-message", {
      isGroupMsg: currentChat?.includes("group"), // 简化实现
      sender: currentUser,
      receiver: currentChat,
    });
  }, [currentChat]);

  useEffect(() => {
    const callback = (messages) => {
      setCurrentChatData(messages);
    };
    socket.on("return-get-message", callback);

    return () => {
      socket.off("return-get-message", callback);
    };
  }, []);

  useEffect(() => {
    getCurrentChatData();
  }, [currentChat, getCurrentChatData]);

  // 收到更新指定对话的数据
  // 如果是当前对话，push当前消息
  // 如果不是，更新brief消息
  useEffect(() => {
    const callback = (message) => {
      console.log(message);
      const { sender, receiver, isGroupMsg } = message;
      if (
        (!isGroupMsg && sender === currentChat) ||
        (isGroupMsg && receiver === currentChat)
      ) {
        console.log("currentChat? ", message);
        const newData = currentChatData.slice();
        newData.push(message);
        setCurrentChatData(newData);
      } else {
        const { sender, body } = message;
        const brief = sender + ": " + body;
        const newChatList = chatList.slice();
        const idx = chatList.findIndex((c) => {
          if (isGroupMsg) return c.name === receiver;
          return c.name === sender;
        });
        const newChat = { ...newChatList[idx] };
        newChat.briefMsg = brief;
        newChatList.splice(idx, 1, newChat);
        setChatList(newChatList);
      }
    };

    socket.on("return-send-message", callback);

    return () => {
      socket.off("return-send-message", callback);
    };
  }, [chatList, currentChat, currentChatData]);

  // TODO 收到要求删除的消息，如果需要删除的信息，不属于当前对话，则忽略
  useEffect(() => {
    const callback = (message) => {
      const { sender, receiver, isGroupMsg } = message;
      if (!isGroupMsg && sender !== currentChat) return;
      if (isGroupMsg && receiver !== currentChat) return;
      const { _id } = message;
      const idx = currentChatData.findIndex({ _id });
      const newChatData = currentChatData.slice();
      newChatData.splice(idx, 1);
      setCurrentChatData(newChatData);
    };
    socket.on("delete-message", callback);

    return () => {
      socket.off("delete-message", callback);
    };
  }, [currentChat, currentChatData]);

  return (
    <div className="App">
      <ChatList
        chatList={chatList}
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
      />
      <ChatContent
        isGroupMsg={currentChat?.includes("group")}
        currentChat={currentChat}
        messages={currentChatData}
        setCurrentChatData={setCurrentChatData}
      />
    </div>
  );
}

export default App;
