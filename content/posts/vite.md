
+++
title = "webpack的基础使用方法"
tags = ["Node"]
date = 2026-03-01T10:00:00+08:00
cover ="/images/assets/webpack.png"
summary = "webpack 和 vite 的区别"
+++
## webpack

Webpack 是一个**静态模块打包工具**，可以把项目中的所有资源（JS、CSS、图片、字体等）都当作「模块」处理，最终打包成浏览器能识别的静态文件



### 使用步骤

```js
// 初始化
yarn init -y

// 生成一个 package.json # 项目依赖、定义快捷脚本（scripts）、配置项目基础信息（名称、版本、入口）
{
  "name": "test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js", 设为 index.js，Node.js 运行时会优先加载这个文件
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "packageManager": "pnpm@10.22.0"
}

```

webpack是核心模块，cli是命令行工具

```js
pnpm add webpack webpack-cli -D
//webpack-cli：webpack 本身是个核心库，没有 cli 的话，你无法在命令行直接调用 webpack 命令
```

你可以新建一个src文件夹，然后创建js文件

![image-20260318084946577](/images/assets/image-20260318084946577.png)



打包：

```js
pnpm webpack
//生成一个dist目录，里面有一个main.js,就是index.js打包后的产物
// pnpm build
```

或者也可以指定命令

![image-20260317221258593](/images/assets/image-20260317221258593.png)



### 特性

webpack默认是按需加载的（在**export default外的需要配置树摇**，让没用到的不放进main.js）**optimization.splitChunks**

在src里面的写法是基于 浏览器ES6的，其他的基于commonjs的，面向nodejs



但是如果需要定义打包的规则 或 分包 ，例如：定义入口、输出、loader、插件、条件逻辑等，不能写在package.json里面

### 配置文件 webpack.config.js

我这里主要讲一下里面的配置都是干嘛的，先阅读一下 这个代码

```js
const path = require("path")
// 引入html插件
const HTMLPlugin = require("html-webpack-plugin")

module.exports = {
    mode: "development", // 设置打包的模式，production表示生产模式  development 开发模式
    // entry: "./hello/hello.js", // 用来指定打包时的主文件 默认 ./src/index.js
    // entry: ["./src/a.js", "./src/b.js"],
    // entry: {
    //     a_newName: "./src/a.js",
    //     b_newName: "./src/b.js"
    // },
    // entry: "./src/a.js",

    output: {
        // path: path.resolve(__dirname, "dist"), // 指定打包的目录，必须要绝对路径
        // filename: "main.js", // 打包后的文件名
        // filename:"[name]-[id]-[hash].js",
        clean: true // 自动清理打包目录
    }, // 配置代码打包后的地址
    /* 
    webpack默认情况下，只会处理js文件，如果我们希望它可以处理其他类型的文件，则要为其引入loader

    - 以css为例：
        - 使用css-loader可以处理js中的样式
        - 使用步骤：
            1.安装：yarn add css-loader -D
            2.配置：
                module: {
                    rules: [
                        {
                            test: /\.css$/i,
                            use: "css-loader"
                        }
                    ]
                }
*/
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(jpg|png|gif)$/i,
                type: "asset/resource" // 图片直接资源类型的数据，可以通过指定type来处理
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },

    plugins: [
        new HTMLPlugin({
            // title: "Hello Webpack",
            template: "./src/index.html"
        })
    ],

    devtool: "inline-source-map"
}

```



#### entry

数组形式：单入口，多文件合并，webpack最终会把两个文件按顺序打包成一个输出文件，main.js

```js
entry: ["./src/a.js", "./src/b.js"],
```

对象形式：多入口，独立打包，支持自定义的「chunk 名称」，Webpack 会为每个入口单独打包，最终生成**两个输出文件**

```js
entry: {
  a_newName: "./src/a.js",
  b_newName: "./src/b.js"
},
    // output 保持：filename: 'js/[name].js'
```

> 这里要注意一下，你用对象写法的话，output就要指定两个，并且匹配上，不然会报错



#### output

定义 Webpack 打包产物的**输出规则**

```js
// 指定输出目录
const path = require('path');

module.exports = {
    entry: {
      home: './src/home.js',
      detail: './src/detail.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),// 1. 输出目录（必填，必须是绝对路径）
      // 多入口会生成 home.xxx.js、detail.xxx.js
      filename: 'js/[name].[contenthash:8].js', // [contenthash:8] 取哈希前8位，缩短文件名
      clean: true
        
    }
};
```

打包后 `dist/js` 目录会生成：

```
home.12345678.js
detail.87654321.js
```

还可以配置：

`publicPath`（静态资源公共路径），定义打包后文件「在浏览器中访问的基础路径」

```js
filename: 'js/[name].[contenthash].js',
  // 场景1：CDN 部署（最终资源路径：https://cdn.example.com/js/home.xxx.js）
publicPath: 'https://cdn.example.com/',
```





#### loader

https://webpack.docschina.org/concepts/loaders/

场景：

​	打包好的main.js 里面操作dom了， 但是你的 `<script src="./main.js"></script>` 写在head里面，不在body里面，运行就没反应

​	解析 HTML → 遇到 `<script src="xxx.js">` → 暂停 HTML 解析

​	下载 JS 文件 → 下载完成后立即执行 JS；

​	JS 执行完成后 → 恢复 HTML 解析



因此需要defer声明

| 特性     | defer                                                  | async                                              |
| -------- | ------------------------------------------------------ | -------------------------------------------------- |
| 下载时机 | HTML 解析时**并行下载**JS                              | HTML 解析时**并行下载**JS                          |
| 执行时机 | HTML 解析完成后（`DOMContentLoaded` 前）**按顺序执行** | JS 下载完成后**立即执行**（会暂停 HTML 解析）      |
| 执行顺序 | 按 `<script>` 标签在 HTML 中的顺序执行                 | 不保证顺序（谁先下载完谁先执行）                   |
| 适用场景 | 依赖 DOM / 依赖其他 JS（如 jQuery 插件、业务逻辑）     | 不依赖 DOM / 不依赖其他 JS（如统计脚本、广告脚本） |

这两个声明都可以让JS 后台并行下载，不阻塞解析；

但是他俩一个是下载完后立即执行，一个是要等HTML 解析完全完成



代码中使用了CSS样式，就需要把CSS也导入到 index.js 里面

但是 webpack默认只能打包 JS ,直接打包会报错，所以需要使用 **loaders**

所以对于: 图片、CSS、特殊格式文件 都需要用loaders  需要查看官方文档

![image-20260318092119768](/images/assets/image-20260318092119768.png)

```js
    module: {
        rules: [
            {
                test: /\.css$/i,  // 正则表达式
                exclude: /node_modules/, // 排除不需要处理的文件（可选）
                include: path.resolve(__dirname, 'src'), // 只处理指定目录的文件（可选）
                use: ["style-loader", "css-loader"] // css-loader是打包，style-loader是css生效
            },
            {
                test:/\.(jpg|png|gif)$/i,
                type:"asset/resource" // 图片直接资源类型的数据，可以通过指定type来处理
            }
        ]
    }


```

他也有特性： 执行顺序是从下到上，从右到左



#### 插件

用来拓展功能，比如直接打包 dist目录不会生成 index.html  

**对代码不做处理**

![image-20260318093742016](/images/assets/image-20260318093742016.png)

需要require 这个插件，template的作用是，给webpack一个参考的模板，生成的html会基于这个自动补全一些代码

Html 里面还可以配置title，改标题



Eslink他是属于插件的，检查语法的，不对代码做处理





#### watch  && dev serve

自动监听内容变化，然后更新dist

但是我们开发一般都把代码放在服务器里面运行，用watch文件类型的不合适



`watch`（Webpack 内置的监听模式）和 `devServer`（`webpack-dev-server` 提供的开发服务器）都是 Webpack 提升开发效率的核心功能。`watch` 是「被动监听文件变化并重新打包」，`devServer` 是「主动提供开发服务 + 热更新 + 更多便捷功能



| 特性     | watch（Webpack 内置）                       | devServer（webpack-dev-server）                           |
| -------- | ------------------------------------------- | --------------------------------------------------------- |
| 核心作用 | 监听文件变化，自动重新执行打包              | 启动本地开发服务器，内置 watch + 热更新 + 静态服务等      |
| 打包产物 | 生成**物理文件**到 `output.path`（如 dist） | 打包产物存在**内存**中，不生成物理文件（没dist,需要build) |
| 页面刷新 | 文件变化 → 重新打包 → 需手动刷新页面        | 文件变化 → 自动刷新 / 热更新（HMR），无需手动操作         |
| 额外能力 | 无（仅监听 + 重新打包）                     | 端口代理、热模块替换（HMR）、静态资源服务、压缩等         |
| 性能     | 重新打包后写入磁盘，速度较慢                | 内存打包，速度极快                                        |
| 适用场景 | 简单项目、需要物理打包文件的场景            | 现代前端开发（React/Vue/ 小程序等）主流选择               |

![image-20260318094732569](/images/assets/image-20260318094732569.png)

运行 `pnpm run dev` 后,网址http://localhost:3000,自动打开浏览器

（HMR）：只更新修改的模块，不刷新整个页面

devServer里面是没有dist的，打包在服务器里面



#### devtool

控制 源码映射的， 仅用于调试（比如断点调试），在F12 控制台里面可以看到源码，Webpack 内置功能，无需额外安装依赖

声明：devtool: "inline-source-map"

注意在**开发模式**下使用，因为生产模式会把代码尽可能压缩，而且生产模式也不能让别人看见源码





## vite

1. **构建方式：** Webpack 通过构建整个项目的依赖图，将所有资源打包成一个或多个 bundle 文件，每次重启都需要打包。

	Vite 采用了即时编译的方式，在开发模式下通过浏览器原生支持的 ES Module 特性进行加载，不需要打包。

2. **开发体验：** Webpack 需要较多的配置，对复杂的项目来说，需要花费时间和精力来配置各种 loader 和 plugin。Vite 开箱即用，不需要复杂的配置即可快速启动项目，支持各种插件以满足特定需求。

3. **热更新：** Webpack 的热更新通常需要借助 webpack-dev-server 等插件，在一些情况下配置起来比较复杂。Vite 内置了基于浏览器原生模块热更新的开发服务器，无需额外配置即可实现快速的热更新。

写法上 一个es6一个commonjs



简单来说：省事，一个命令就装好了很多配置

现代浏览器本身就支持 `ES Modules`，会`主动发起`请求去获取所需文件。Vite充分利用了这一点，将开发环境下的模块文件直接作为浏览器要执行的文件，而不是像 Webpack 那样`先打包`，再交给浏览器执行。这种方式减少了中间环节，提高了效率。

> script 标签中设置 `type="module"`

Webpack 是基于 `Node.js` 构建的，而 Vite 则是基于 `esbuild` 进行预构建依赖。esbuild 是采用 `Go` 语言编写的，Go 语言是`纳秒`级别的，而 Node.js 是`毫秒`级别的。因此，Vite 在打包速度上相比Webpack 有 `10-100` 倍的提升。

在 Webpack 中，当一个模块或其依赖的模块内容改变时，需要`重新编译`这些模块。

而在 Vite 中，当某个模块内容改变时，只需要让浏览器`重新请求`该模块即可，这大大减少了热更新的时间。



vite不能通过live-serve 和 物理路径打开



## live-serve

####  WebSocket 连接（双向通信通道）

这是实现 “自动刷新” 的核心，live-server 会在 HTTP 服务器基础上，额外开启一个 WebSocket 服务（和 HTTP 服务器共用端口）：

- 当浏览器访问 live-server 提供的页面时，页面会自动注入一段隐藏的 JS 代码，建立浏览器与 live-server 的 WebSocket 连接；
- 这个连接是**双向的**：服务器能主动给浏览器发消息，浏览器也能给服务器发消息。

#### 4. 自动注入的客户端脚本

live-server 会在你加载的 HTML 页面中，自动插入一小段 JS 代码（无需你手动写），这段代码的作用：

- 建立 WebSocket 连接，监听服务器的 “刷新指令”；
- 接收指令后，根据文件类型执行不同操作（比如 CSS 修改只刷新样式，HTML/JS 修改刷新整个页面）。

