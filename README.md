# Data

## 简化

假设总共只有 3 个用户，1 个 group

根据 url 参数 `?username=userA` 表明是用户A，其他用户同理

## 如何描述一条消息？
 
```
{
    id,
    isGroupMsg,
    time,
    sender,
    receiver,
    body,
    quote,
}

```

## 如何描述一个对话（collection messages）？
```
{
    owner: userA-userB,
    messages: Message[]
}

{
    owner: groupA,
    messages: Message[]
}
```
无论是 A 发给 B，还是 B 发给 A，通过`[nameA,nameB].sort().join('-')`获得相同的 owner key
## 群聊

 socket.io 的 room 刚好可以表达 group 的概念，使用 io.to(room) 转发群消息

## 如何渲染？

message 里包含 sender 和 receiver，根据 sender 是否为 currentUser 渲染不同背景色

## 如何处理 quote？

quote 属于 message 的一个属性，渲染时作为一个独立的 div，跟着 message 或者 input

## 安全问题 TODO

用户输入的、server 收到的数据需要先 sanitize 消毒，防止恶意脚本/语句


