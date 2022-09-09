# Data

## 如何描述一个 user（collection users）

```
{
    name: userA,
    contacts: User[],
    groups: Group[],
    activeChats: User/Group[],
}
```

## 描述一个group（collection groups）
```
{
    name: groupA,
    members: User[]
}
```

## 如何描述一个对话？（collection messages）
 
```
type Message = {
    id,
    isGroupMsg,
    time,
    sender,
    receiver,
    isQuote,
    body,
    quote,
}

// 理想情况下，用这种方式存储所有对话，是最快的
{
    userA-userB: messages
    groupA: messages
}

// 但是为了可扩展性考虑，用以下document形式描述对话：
{
    owner: userA-userB/groupA,
    messages: Message[]
}


```

## 群聊

发消息给 group，先更新 group messages队列
然后根据group members(另一个collection)转发，让他们重新请求消息或者直接尾巴加一条消息？

## 未读消息

TODO
A 发给 B，server 检查 B 当前的活跃窗口，如果不是 B-A 对话，那么更新 B 的 chatList 里面，A 的 unreadCount 属性

## 如何渲染？

message 里包含 sender 和 receiver，如果 sender 是我，渲染浅灰色，否则浅绿色
isQuote 渲染额外的 quote 层，用 absolute 定位悬浮在输入框

## 如何 quote？

quote 属于 message 的一种，由 isQuote 和 quote 标识

## 安全问题

server 收到数据需要先 sanitize 消毒

## 简化

假设总共只有 5 个用户，1 个 group，总计 6 个对话
访问/userA 就表明是用户 A，其他 4 个用户同理
