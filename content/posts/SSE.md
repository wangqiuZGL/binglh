
+++
title = "SSE的基本流程"
tags = ["node"]
date = 2026-03-13T10:00:00+08:00
cover = "/images/assets/sse.png"
summary = "抓包、服务器向客户端通信"
+++

## 认识SSE

### 服务端流程

1. 开启一个 HTTP服务。
2. 定义一个 GET接口。
3. 设置 Content-Type 为 `text/event-stream; charset=utf-8`。
4. 服务端每次响应就会往前端发一个消息，调用 end 结束响应就会断开（这种方式的断开，前端会主动重连)。





> 这里使用 express 。
>
> 注意：
>
> **浏览器出于安全性的考虑而做出的限制**，AJAX 只能向自己的服务器（同源下）发送请求。如果两个页面拥有相同的协议、域名和端口，那么这两个页面就属于同一个源，其中只要有一个不相同，就是不同源
>
> **CORS：**全称为 `Cross-origin resource sharing`，即跨域资源共享，它允许浏览器向跨域服务器发送 `AJAX` 请求，克服了 `AJAX` 只能同源使用的限制。
>
> 在服务端：
>
> ```
> Node 服务器端设置响应头示例代码如下：
> app.use((req, res, next) => {
>   res.header('Access-Control-Allow-Origin', '*');（允许所有域名访问）
>   res.header('Access-Control-Allow-Methods', 'GET, POST');（允许的请求方法）
>   Access-Control-Allow-Headers: Content-Type（允许的请求头）
>   next();
> })
> ```
>
> 同源政策是浏览器给予AJAX技术的限制，服务器端是不存在同源政策限制
>
> `cors` 中间件的本质是：**自动给后端响应头中添加 CORS 相关的字段**，告诉浏览器 “这个后端允许指定的前端





```js
const express = require("express");
const cors = require("cors");// 解决跨域问题
const app = express();
// 2. 启用 cors 中间件（最简单的配置：允许所有域名访问）
app.use(cors());

const arr = ["李", "航", "爱", "用", "P", "D", "D"];

app.get("/api/sse", (req, res) => {
  // #1 设置响应头
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8"
  });
  let counter = 0;
  // #2 每 1000 秒给前端发送 arr 里的一个字，前端逐步拼接
  const intervalId = setInterval(() => {
    // #3 以 data: 开头（这样才会触发前端的 onmessage 事件），\n\n → 固定，表示“本条消息结束”
    res.write("data:" + arr[counter] + "\n\n");
    counter++;
    if (counter >= arr.length) {
      clearInterval(intervalId);
    }
  }, 1000);

    // 发布订阅者模式
  res.on("close", () => {
    console.log("客户端断开连接");
    clearInterval(intervalId);
    res.end();
  });
});

app.listen(3000, () => console.log("http://localhost:3000"));
```

 

这里面可以学到的 res 和 req 的方法

| 对象 | 方法 / 属性                | 作用说明                                                     | 代码中的具体应用场景                                | 注意事项                                                     |
| ---- | -------------------------- | ------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------ |
| req  | method                     | 获取 HTTP 请求方法（如 GET/POST）                            | 未直接使用，但可用于判断请求类型                    | -                                                            |
| req  | url                        | 获取请求的 URL 路径                                          | 未直接使用，可用于路由匹配 / 日志记录               | -                                                            |
| req  | query                      | 获取 GET 请求的查询参数（如 `/api/sse?speed=1000` 中的 speed） | 未直接使用，可扩展用于接收前端自定义发送速度        | -                                                            |
| req  | headers                    | 获取客户端请求头信息（如 User-Agent、Accept 等）             | 未直接使用，可用于验证客户端身份 / 权限             | -                                                            |
| res  | writeHead(status, headers) | 设置 HTTP 响应状态码和响应头（一次性设置多个头）             | 设置 SSE 核心头：`text/event-stream; charset=utf-8` | 1. 状态码 200 表示成功；2. 必须包含 SSE 协议的 Content-Type  |
| res  | write(chunk)               | 向响应流写入数据（非结束），支持持续发送数据                 | 按 `data: 内容\n\n` 格式发送数组中的单个字符        | 1. 数据格式必须符合 SSE 协议（data: 开头 + \n\n 结尾）；2. 支持多次调用 |
| res  | on("close", callback)      | 监听响应流关闭事件（客户端断开连接时触发）                   | 客户端断开时清理定时器、结束响应                    | 必须清理定时器，否则会导致服务器内存泄漏                     |
| res  | end([data])                | 结束响应流（告诉客户端响应完成）                             | 1. 数据发送完毕后调用；2. 客户端断开时调用          | 1. SSE 场景中不能提前调用（否则中断数据发送）；2. 是 HTTP 响应的收尾操作 |
| res  | setHeader(key, value)      | 单独设置某个响应头（cors 中间件底层调用）                    | cors 自动设置 `Access-Control-Allow-Origin: *`      | 跨域场景必须设置，否则前端无法接收 SSE 数据                  |

### 前端流程

1. 传入接口地址，创建 EventSource 对象。
2. 通过 **onmessage 可以监听消息，onopen 监听连接上的那一刻**

```js
<script>
      const msgEl = document.getElementById("msg");
      const eventSource = new EventSource("http://127.0.0.1:3000/api/sse");

      eventSource.onopen = () => {
        console.log("open");
      };

      eventSource.onmessage = (valueText) => {
        msgEl.textContent += valueText.data;
      };

      eventSource.onerror = (error) => {
        console.log("例如访问了一个不存在的端口：", error);
      };

      // 组件卸载的时候关闭连接
      const closeConnection = () => {
        eventSource.close();
        console.log("close");
      };

      document
        .getElementById("closeBtn")
        .addEventListener("click", closeConnection);
    </script>
```

### 注意点！！

1. 接口侧必须严格的按照 data: 内容部分 /n/n 格式写入，否则前端无法触发 onmessage（但是这是针对浏览器自带的 EventSource，我们可以自定义 SSE 客户端对象，来定义自己的协议）
2. 服务端用 res.end() 把这条连接关掉（“断开”）后，浏览器的 EventSource 会认为这是“意外断线”，过几秒会自动再发起一次请求，重新连上同一个 /api/sse
3. 前端也是一样，一旦 close，除非重新创建一个新实例进行重连





## event定义

同一个接口可以通过不同 event 来定义承载各种不同的功能，做到最大程度复用

```js
// index.js
const EVENT_TYPES = {
  a: { event: "未读消息", data: "你有一条未读消息" },
  b: { event: "订单更新", data: "订单 #10086 已发货" },
  c: { event: "系统通知", data: "系统将于今晚 22:00 维护" },
};

  const intervalId = setInterval(() => {
    const key = eventKeys[tick % eventKeys.length]; // 循环发送事件，tick 为 0 时发送 a 事件，tick 为 1 时发送 b 事件，tick 为 2 时发送 c 事件，以此类推
    const { event, data } = EVENT_TYPES[key];
    // 先写 event 类型，再写 data，\n\n 表示本条消息结束
    res.write(`event: ${event}\n`);
    res.write(`data: ${data}\n\n`);
    tick++;
  }, 2000);

//前端 通过addEventListener 来使用
eventSource.addEventListener('未读消息',(e)=>{
	// e.data
})
```

SSE 有固定的文本格式，核心是「事件类型 + 数据 + 结束符」，代码里的关键逻辑：`event: 类型\n data: 内容\n\n` 的格式



客户端访问 `/api/sse` 时，服务器创建长连接

客户端断开（比如点「断开连接」按钮），服务器触发 `res.on("close")`，清理定时器



前端一定要记得eventSource一定要关闭 `eventSource.close();`



## Fetch + ReadableStream

如果希望服务端数据不要一次性的发过来

用 `fetch` 发请求，然后读取响应流，手动解析 SSE 格式。

```js
const url = 'http://localhost:3000/getData'
// 数据的流获取
async function getResponse(content){
  const resp = await fetch(url,{
    method:'post',
    header:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({content})
    }
)}

const reader = resp.body.getReader() // 获取 ReadableStream 的 reader 对象
const decoder = new TextDecoder() // 创建一个 TextDecoder 实例，用于将二进制数据转换为字符串

// 通过 reader.read() 方法读取数据流中的数据块，直到流结束
// 返回一个包含 down 和 value 属性的对象，
const {down,value} =await reader.read() // 继续读取下一个数据块
// down 表示是否已经读取到流的末尾，value 是当前读取到的数据块
while(!down){ // 通过 down 属性判断是否已经读取到流的末尾
  const {down,value} =await reader.read() // 继续读取下一个数据块
  const txt = decoder.decode(valuwe) // 将读取到的数据块转换为字符串
  console.log(txt) // 输出当前读取到的字符串
  
}

```



## 通过 Cookie 携带 Toke

`EventSource` 原生不支持自定义请求头，无法直接传 `Authorization`。而 Cookie 会被浏览器**自动携带**到同域/跨域（配置后）请求中，包括 SSE 连接，因此是最简单的方案。

使用 `fetch` 实现 SSE 时，加上 `credentials: "include"`：

```js
const res = await fetch(url, {
  method: "GET",
  credentials: "include", // 关键：告诉浏览器携带 cookie
  signal: controller.signal,
});
```

> 如果用的是原生 `EventSource`，写法为：
>
> ```
> const es = new EventSource("/api/sse", { withCredentials: true });
> ```



后端配置的cors

​	作用是让后端允许前端跨域请求并支持携带 Cookie

```
app.use(cors({
  origin: true,       // 自动回显请求来源，等同于指定具体域名
  credentials: true,  // 允许跨域携带 cookie
}));
```

**规定：**如果前端请求的 `credentials` 是 `include`（要带 Cookie），后端的 `Access-Control-Allow-Origin` 必须是**具体的域名**（比如 `http://localhost:5173`），不能是通配符 `*`。

| 配置方式                          | 适用场景                                 | 能否跨域带 Cookie | 灵活性            |
| --------------------------------- | ---------------------------------------- | ----------------- | ----------------- |
| `origin: "*"`                     | 不需要带 Cookie 的公开接口（比如查天气） | ❌ 不能            | 最高（所有域名）  |
| `origin: "http://localhost:5173"` | 固定前端域名的场景                       | ✅ 能              | 最低（只能 5173） |
| `origin: true`                    | 多前端域名、需要带 Cookie 的场景         | ✅ 能              | 中等（自动匹配）  |

`origin: true` 是 `cors` 中间件的便捷配置，**动态匹配请求的 Origin 并返回具体域名**，而非通配符；





## fetch和eventSource的区别

`EventSource` 是浏览器原生为 SSE 设计的**高层封装 API**，而 `fetch + ReadableStream` 是基于底层 API 手动实现 SSE 协议解析。



| 维度             | fetch + ReadableStream（你的写法）          | EventSource                                                  |
| ---------------- | ------------------------------------------- | ------------------------------------------------------------ |
| **协议解析**     | 手动解析 `data:` 前缀、拆分行、处理流式数据 | 自动解析 SSE 协议（`data:`/`event:`/`id:`/`retry:`）         |
| **请求方法**     | 支持 GET/POST 等任意方法                    | **仅支持 GET 方法**（无法发送 POST 请求）                    |
| **自定义请求头** | 支持任意请求头（如 token、Content-Type）    | 仅支持少量简单请求头（如 Accept、Cache-Control），自定义头（如 token）可能被浏览器拦截 |
| **重连机制**     | 需手动实现（断连后要自己重新发起请求）      | 内置自动重连（默认 3 秒重试，可通过服务端 `retry:` 指令修改） |
| **事件分类**     | 需手动解析 `event:` 字段区分事件类型        | 自动按 `event:` 字段触发对应事件（如 `es.addEventListener('custom', callback)`） |
| **错误处理**     | 需手动捕获 AbortError / 网络错误            | 内置 `onerror` 事件，自动区分连接状态（CONNECTING/OPEN/CLOSED） |
| **兼容性**       | 依赖 ReadableStream（现代浏览器支持）       | 兼容性更广（IE 除外，老浏览器也支持）                        |
| **取消请求**     | 用 AbortController 手动中止                 | 调用 `close()` 方法即可，底层自动处理                        |



## Whistle 代理

Whistle 是基于 Node.js 的**跨平台 Web 调试代理工具**，核心是**拦截、查看、修改 HTTP/HTTPS/WebSocket 请求与响应**

启动后在本地（默认 `127.0.0.1:8899`）跑一个代理服务器，所有经过它的请求都会被**捕获、解析、可修改**



浏览器 / 设备 → 配置代理（SwitchyOmega） → 把请求发给 Whistle（`127.0.0.1:8899`）

Whistle 按规则处理：转发、修改、Mock、替换、注入等

Whistle 把处理后的请求发给目标服务器

服务器返回响应 → Whistle 再次处理 → 返回给浏览器 / 设备

全程在 Whistle 面板（`http://127.0.0.1:8899`）可查看请求详情、日志、规则

![image-20260322175434761](/images/assets/image-20260322175434761.png)

在这里常用：

```
# 把 www.baidu.com 指向本地 3000 端口
www.baidu.com 127.0.0.1:3000
# 泛域名：所有 .test.com 指向本地
*.test.com 127.0.0.1:8080

# 把线上 /api 转发到本地服务
https://example.com/api http://127.0.0.1:3000/api
# 正则匹配：所有 /api/v1/* 转发
/^https?:\/\/example\.com\/api\/v1/ http://127.0.0.1:4000

# 接口返回固定 JSON
https://example.com/api/user { "name": "test", "age": 20 }
# 接口返回本地文件
https://example.com/api/list file:///Users/xxx/mock/list.json

# 替换线上 JS 为本地文件
https://example.com/js/app.js file:///Users/xxx/dev/app.js
# 替换图片
https://example.com/img/logo.png file:///Users/xxx/dev/logo.png

# 拦截并打印 WebSocket 消息
wss://example.com/ws log://
```

\*  resCors://*         作用：给**所有响应**自动加上跨域头：Access-Control-Allow-Origin: *