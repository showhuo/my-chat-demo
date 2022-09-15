import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import "./App.scss";
import ChatContent from "./chat/chat-content";
import ChatList from "./chat/chat-list/index";
import { currentUser, socket } from "./config";

function App() {
  const [currentChat, setCurrentChat] = useState();
  const [currentChatData, setCurrentChatData] = useState([]);
  const [conversationId, setConversationId] = useState();
  const [chatList, setChatList] = useState([
    { name: "", avatarUrl: "", briefMsg: "", conversationId: "" },
  ]);

  useEffect(() => {
    socket.emit("get-conversations");
  }, []);

  const getNameFromConversation = (conversation) => {
    if (conversation?.participants.length > 2) {
      return "groupA";
    } else {
      for (const participant of conversation?.participants) {
        if (participant !== currentUser) {
          return participant;
        }
      }
    }
  };

  useEffect(() => {
    const callback = (conversations) => {
      console.log("return-get-conversations", conversations);
      const convertedChatList = (conversations || []).map((c) => {
        return {
          name: getNameFromConversation(c),
          avatarUrl: "",
          briefMsg: "",
          conversationId: c._id,
        };
      });
      setChatList(convertedChatList || []);
      setConversationId(conversations[0]?._id);
      setCurrentChat(getNameFromConversation(conversations[0]));
    };
    socket.on("return-get-conversations", callback);

    return () => {
      socket.off("return-get-conversations", callback);
    };
  }, []);

  const getCurrentChatData = useCallback(() => {
    socket.emit("get-message", {
      isGroupMsg: currentChat?.includes("group"), // 简化实现
      sender: currentUser,
      receiver: currentChat,
      conversationId,
    });
  }, [conversationId, currentChat]);

  useEffect(() => {
    getCurrentChatData();
  }, [currentChat, getCurrentChatData]);

  useEffect(() => {
    const callback = (messages) => {
      console.log("return-get-message", messages);
      setCurrentChatData(messages || []);
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
      console.log("return-send-message", message);
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
        setConversationId={setConversationId}
      />
      <ChatContent
        isGroupMsg={currentChat?.includes("group")}
        currentChat={currentChat}
        messages={currentChatData}
        setCurrentChatData={setCurrentChatData}
        updateBrief={updateBrief}
        conversationId={conversationId}
      />
    </div>
  );
}

export default App;
