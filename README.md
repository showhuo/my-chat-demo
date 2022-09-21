# Data

## 简化

假设总共只有 3 个用户，1 个 group

根据 url 参数 `?username=userA` 表明是用户A，其他用户同理

真实情况下可以使用独立的collection users描述
```ts
{
    _id,
    name,
    avatar,
    contacts: User[]
}
```

## 如何描述一条消息（collection messages）？
 
```js
{
    id,
    isGroupMsg,
    time,
    sender,
    receiver,
    body,
    quote,
    conversationId // 建立索引，方便根据conversationId查找messages
}

```

## 如何描述一个对话（collection conversations）？
```js
{
    _id: conversationId,
    participants: ['userA','userB']
}
```

## 群聊

 socket.io 的 room 刚好可以表达 group 的概念，使用 io.to(room) 转发群消息

## 如何渲染？

message 里包含 sender 和 receiver，根据 sender 是否为 currentUser 渲染不同背景色

## 如何处理 quote？

quote 属于 message 的一个属性，渲染时作为一个独立的 div，跟着 message 或者 input




