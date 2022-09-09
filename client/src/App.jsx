import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import "./App.scss";
import ChatContent from "./chat/chat-content";
import ChatList from "./chat/chat-list";
import { currentUser, socket } from "./config";

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
    getCurrentChatData();
  }, [currentChat, getCurrentChatData]);

  useEffect(() => {
    const callback = (messages) => {
      setCurrentChatData(messages);
    };
    socket.on("return-get-message", callback);

    return () => {
      socket.off("return-get-message", callback);
    };
  }, []);

  const pushToCurrentData = useCallback(
    (message) => {
      const { sender, receiver, isGroupMsg } = message;
      if (
        (!isGroupMsg && sender === currentChat) ||
        (isGroupMsg && receiver === currentChat)
      ) {
        console.log("currentChat? ", message);
        const newData = currentChatData.slice();
        newData.push(message);
        setCurrentChatData(newData);
      }
    },
    [currentChat, currentChatData]
  );

  const updateBrief = useCallback(
    (message, fromMe) => {
      const { sender, receiver, body, isGroupMsg } = message;
      const brief = sender + ": " + body;
      const newChatList = chatList.slice();
      const idx = chatList.findIndex((c) => {
        if (fromMe || isGroupMsg) return c.name === receiver;
        return c.name === sender;
      });
      const newChat = { ...newChatList[idx] };
      newChat.briefMsg = brief;
      newChatList.splice(idx, 1, newChat);
      setChatList(newChatList);
    },
    [chatList]
  );

  useEffect(() => {
    const callback = (message) => {
      console.log(message);
      pushToCurrentData(message);
      updateBrief(message);
    };
    socket.on("return-send-message", callback);

    return () => {
      socket.off("return-send-message", callback);
    };
  }, [pushToCurrentData, updateBrief]);

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
        updateBrief={updateBrief}
      />
    </div>
  );
}

export default App;
