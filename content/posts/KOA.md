+++
title = "koa and express"
tags = ["node"]
date = 2025-03-13T10:00:00+08:00
cover = "/images/assets/image-20260313202442978.png"
summary = "介绍二者的区别"
+++



## express

跟springboot差不多

下面有个小案例

```js
import express from 'express'

// 创建 express 应用实例
const app = express()

const port = 3000

// 路由，相当于后端接口。浏览器访问 localhost:3000/abc 即可展示 Hello World
app.get('/abc', (req, res) => {
  res.send('Hello World!')
})

// 启动服务，监听端口 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
```



> `app`: `express` 的实例。
>
> `METHOD`: `http` 请求方法，如 get、post、put、delete 等。
>
> `PATH`: 服务器上的路径。
>
> `HANDLER`: 路由处理函数，每个路由可以具有一个或多个处理程序函数，这些函数在路由匹配时执行。



express 可以提供 静态文件的访问

```js
app.use('/static',express.static('public'));

// 例如  public/static/image/1.jpg  可以通过路径访问
//   http://localhost:3000/static/image/1.jpg
app.use(express.static('files')); //把你项目中 files 这个文件夹里的所有文件（比如图片、CSS、JS、HTML、音频 / 视频等）变成「可通过 HTTP 访问的静态资源」。
```





## KOA

Koa是由Express原班人马打造的一个**新的web框架**，旨在成为一个更小、更富有表现力、更健壯的基础上构建web应用和APIs。

首先，创建一个新的目录`koa-test`，并在此目录下初始化npm项目，然后安装**Koa及相关工具**：

```js
mkdir koa-test
cd koa-test
npm init -y
npm i koa
npm i nodemon --save-dev
```

创建一个app.js

```js
const Koa = require('koa');
const app = new Koa();

// 中间件
app.use(async ctx => {
  ctx.body = 'Hello Koa';
});

// 监听3000端口
app.listen(3000, () => {
  console.log('Server running at http://127.0.0.1:3000');
});
```

添加一个`dev`启动脚本：

<img src="/images/assets/image-20260313201042743.png" alt="image-20260313201042743" style="zoom: 67%;" />

![image-20260313201135800](/images/assets/image-20260313201135800.png)

使用[Postman](https://link.juejin.cn/?target=https%3A%2F%2Fwww.postman.com%2F)或任何其他API测试工具发送请求到 `http://127.0.0.1:3000`。你应该能看到响应：“Hello Koa”。



## KOA的原理内容

### 四个核心文件

**application.js** : 创建class实例的构造函数，它继承了events，这样就会赋予框架事件监听和事件触发的能力。暴露了一些常用的api，toJSON、listen、use

**context.js**:对象暴露

**request.js、response.js**:es6的get和set的一些语法，去取headers或者设置headers、还有设置body



| 文件           | 核心作用                                                     | 关键亮点                   |
| -------------- | ------------------------------------------------------------ | -------------------------- |
| application.js | 框架入口，提供事件能力（监听 / 触发），暴露 use/listen/toJSON 等 API | 继承 EventEmitter 实现事件 |
| request.js     | 封装请求相关操作，用 ES6 get/set 简化请求头、URL 的获取 / 设置 | 只处理「请求」的读取       |
| response.js    | 封装响应相关操作，用 ES6 get/set 简化响应体、状态码、响应头的设置 / 获取 | 只处理「响应」的写入       |
| context.js     | 上下文，把 request/response 的属性代理到自身，简化开发者使用（ctx.xxx） | 统一入口，减少代码层级     |



> Koa 的上下文对象 `ctx` 是请求和响应对象的封装，它包含了请求查询、请求体、路由匹配、响应状态等信息。
>
> Koa 支持流式响应，可以通过 `ctx.body = stream` 的方式发送流式数据
>
> 调用 `ctx.throw` 或返回 `Promise` 对象来正确处理错误



### 中间件机制

<img src="/images/assets/image-20260313202442978.png" alt="image-20260313202442978" style="zoom:50%;" />

```js
const app = new Koa();

app.use(async (ctx, next) => {
	console.log(1);
	await next();
	console.log(6);
});

app.use(async (ctx, next) => {
	console.log(2);
	await next();
	console.log(5);
});

app.use(async (ctx, next) => {
	console.log(3);
	await next();
	console.log(4);
});

// 输出： 1 2 3 4 5 6
```

`await next()` 是「暂停当前中间件，执行下一个中间件」。而非「等待一个空 Promise」







## 二者的不同

koa2中使用了async/await，Koa.js允许你使用ES6中的Generator函数，更好的异步处理机制

Express.js更适合于构建大型的应用程序，稳定





## 参考博客

https://juejin.cn/post/6844904099876438030?searchId=202603132011583D29D35659261843E7C4##heading-10