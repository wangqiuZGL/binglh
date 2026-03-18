+++
title = "CSS和TailCSS"
tags = ["CSS"]
date = 2026-03-01T10:00:00+08:00
cover = "/images/assets/tailwind.png"
summary = ""
+++

## CSS介绍

### CSS样式单位

绝对单位和相对单位

| 类型     | 特点                   | 常见单位              |
| -------- | ---------------------- | --------------------- |
| 绝对单位 | 尺寸固定，不随环境变化 | px、pt、cm、mm、in    |
| 相对单位 | 尺寸随参考物变化       | rem、em、vw/vh、%、ch |

### px（像素）—— 最基础的绝对单位

​	**含义**：屏幕上的最小显示单元（1px = 屏幕 1 个像素点）

​	TailwindCSS 中 1 个单位 = 4px（比如 `px-4` 对应 `padding-left/right: 16px`）

### rem（根元素相对单位）—— 适配不同屏幕的核

​	相对于根元素（`<html>`）的 `font-size` 计算（1rem = html 的 font-size 值）

​	‌**font-size是CSS（层叠样式表）中用于设置文本字体大小的核心属性**，具有继承性

```css
/* 根元素设置基准 */
html {
  font-size: 16px; /* 1rem = 16px */
}
/* 小屏幕适配 */
@media (max-width: 768px) {
  html {
    font-size: 14px; /* 1rem = 14px，全局尺寸自动缩小 */
  }
}
/* 使用 rem */
.title {
  font-size: 1.25rem; /* 1.25*16 = 20px */
  margin-bottom: 0.75rem; /* 0.75*16 = 12px */
}
```



### em（父元素相对单位）—— 局部适配

**含义**：相对于**当前元素 / 父元素**的 `font-size` 计算（优先级：当前元素 font-size > 父元素 font-size）



### vw/vh（视口相对单位）—— 大屏适配神器

`vw`：视口宽度的 1%（1vw = 屏幕宽度 / 100）；

`vh`：视口高度的 1%（1vh = 屏幕高度 / 100）；

完全随屏幕尺寸变化，适配性极强；

100vw = 屏幕宽度，100vh = 屏幕高度。



### %（百分比）—— 基于父元素的相对单

相对于父元素的对应属性值计算（比如宽度 % 参考父元素宽度，高度 % 参考父元素高度）



ch（字符宽度单位）—— 文本适配

相对于当前字体的 “0（零）” 字符宽度（1ch = 1 个 “0” 的宽度）



### CSS的继承

- 后代选择器（用`空格`分隔）：匹配父元素下**所有层级**的子元素（包括直接子、孙、曾孙等）；
- 直接子元素选择器（用`>`分隔）：仅匹配父元素下**第一层级**的直接子元素，不跨层级。
- **可继承属性**（主要是 “文字相关”）：`color`、`font-size`、`font-family`、`line-height`、`text-align`、`list-style` 等；
- **不可继承属性**（主要是 “盒模型 / 布局相关”）：`width`、`height`、`margin`、`padding`、`border`、`background`、`position` 等。

```css
// 如果想让不可继承属性 “继承”，可以用 inherit 关键  
.parent { width: 300px; }
.child { width: inherit; } /* 子元素继承父元素的width */
```



### CSS盒模型

盒子的实际宽度： **内容+左右内边距+左右边框宽度。**（不带margin) 

`box-sizing` 是控制 `width` 作用范围的 “开关”，有两个常用取值 ，默认值：box-sizing: content-box ，这时，width代表的是content的宽度；

box-sizing: border-box ，`width` 指向**内容区 + 内边距 + 边框** 的总宽度

<img src="/images/assets/image-20260316100259424.png" alt="image-20260316100259424" style="zoom:67%;" />





一般来说，不要给元素明确指定高度。 宽度是硬约束，高度是自适应的。布局策略应该顺应这个特性，而不是对抗它。 对于宽度：你需要主动控制。使用百分比、max-width、min-width、或者 clamp() 等手段来约束元素的宽度，让它在不同视口下有合理的表现。 对于高度：让内容自然撑开就好。你控制好内容本身和垂直方向的 padding，高度就是正确的结果



边框border有很多种样式

<img src="https://cdn.nlark.com/yuque/0/2026/png/45905807/1772338222450-08307bf3-c7cb-44bc-a227-bcb01f3bf57b.png?x-oss-process=image%2Fformat%2Cwebp" alt="image.png" style="zoom:50%;" />





| 特性               | 块级盒子（block）                       | 行内盒子（inline）                         | 行内块盒子（inline-block）                     |
| ------------------ | --------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| **排版方式**       | 独占一行，自上而下排列                  | 与其他行内元素并排，随文字流排列           | 与其他行内 / 行内块元素并排，不独占一行        |
| **宽高设置**       | `width/height` 完全生效（可自定义尺寸） | `width/height` 完全无效（尺寸由内容决定）  | `width/height` 完全生效                        |
| **margin/padding** | 上下左右 `margin/padding` 都生效        | 只有左右 `margin/padding` 生效，上下无效   | 上下左右 `margin/padding` 都生效               |
| **默认宽度**       | 撑满父元素的 100% 宽度                  | 仅包裹内容的宽度                           | 仅包裹内容的宽度（可手动设置）                 |
| **换行特性**       | 元素后自动换行                          | 元素后不换行                               | 元素后不换行                                   |
| **常见默认元素**   | `div`、`p`、`h1-h6`、`ul/li`、`section` | `span`、`a`、`em`、`strong`、`img`（特殊） | 无默认元素，需手动设置 `display: inline-block` |



### trainsition 过度

`transition` 是复合属性，完整写法覆盖 4 个维度

```css
/* 语法：transition: 属性名 时长 过渡曲线 延迟; */
element {
  transition: property duration timing-function delay;
}


	
duration：过渡时长（必选，如0.3s/500ms，无时长则无过渡）；

过滤曲线的有 line匀速、ease慢块慢
```



**property**：要过渡的 CSS 属性（必选，可写all表示所有可过渡属性）

针对单个属性设置过渡： transition: background-color 0.3s ease;  

​	颜色类：`background-color`/`color`/`border-color`（对应简写`transition-colors`）；

​	尺寸 / 位置类：`width`/`height`/`left`/`top`/`transform`（`transform`性能最优）；

​	透明度 / 阴影：`opacity`/`box-shadow`/`text-shadow`；

​	其他：`border-radius`/`padding`/`margin`。

```css
/* 写法1：逗号分隔（推荐，可分别设置不同时长/曲线） */
.card {
  width: 200px;
  opacity: 0.8;
  transition: 
    width 0.3s ease-out, 
    opacity 0.5s ease-in;
}

  /* 单属性过渡：背景色，0.3秒，ease曲线 */
  transition: background-color 0.3s ease;
```



`transition`：「触发式」过渡，需要状态变化（hover / 类名切换）才能触发，只能定义「开始和结束」两个状态，适合简单动效；

`animation`：「主动式」动画，无需触发即可自动执行，可定义多个关键帧（`@keyframes`），支持循环、延迟、播放方向等，适合复杂动效。



### 触发BFC

当然能触发BFC容器的代码不单单只有`overflow:hidden`,以下是其它能将容器设置为BFC容器的代码：

1. overflow：hidden || auto || overlay || scroll
2. float: left || right
3. position: absolute || fixed
4. display: inline-block
5. display: table-cell || table-xxx
6. display： flex || inline-flex



BFC （Block Formatting Context 块级格式化上下文）

**一个BFC区域包含创建该上下文元素的所有子元素，但是不包括创建了新的BFC的子元素的内部元素，BFC是一块块独立的渲染区域，可以将BFC看成是元素的一种属性，拥有了这种属性的元素就会使他的子元素与世隔绝，不会影响到外部其他元素**



BFC是一个完全独立的空间，内部元素的渲染不会影响到外界。区域只有父里的子，没有祖孙



#### 1.解决外边距垂直坍塌

两个盒子的`margin`外边距分别设置为10px与50px，可结果显示两个盒子之间只有`50px`的距离（边距坍塌时取最大的那个margin），这就导致了`margin`塌陷问题

给这两个盒子都添加一个父元素，并且将这个父元素设置为BFC区域，这是就产生了两个独立的个体不会相互影响，这样就可以解决margin坍塌的问题了

解决此问题可以使用`BFC`规则---`给这两个盒子都添加一个父元素，并且将这个父元素设置为BFC区域，这是就产生了两个独立的个体不会相互影响，这样就可以解决margin坍塌的问题了`



#### 2.解决包含坍塌

当我们给子元素添加margin时，会带着父盒子一起移动。但是我们只想要子元素距离父元素50px，而不是带着父元素一起移动

> 这个只发生在垂直方向，且父元素 是块级元素，父子之间没有空白内容, 父元素没有 padding和border

CSS 认为「父元素和子元素的顶部 / 底部外边距是同一个区域」，所以子元素的 margin-top 会「向上溢出」，变成父元素和它上级元素之间的 margin，最终表现为父元素跟着一起移动。



这个时候我们也可以使用BFC来解决这个问题。`只需将父元素设为BFC区域`

或者加上padding和border



#### 3.清除浮动

**正常文档流** 是元素默认的排列规则：父元素的高度默认是「由子元素的高度撑开」的；块级元素（div、p、ul 等）会独占一行，从上到下排列；

`float` 的设计本质是「让元素脱离正常文档流」，只为实现「文字环绕」效果，但这会导致一个关键问题：

**父元素在计算自身高度时，会「忽略」所有浮动的子元素** —— 因为浮动元素已经不在正常文档流里了，父元素认为「自己内部没有内容」，所以高度会塌陷为 0（或仅包含非浮动内容的高度）。



我们也可以使用`BFC`，因为BFC里面的所有子元素都是不会影响到外部元素的。



#### 4、避免被浮动元素覆盖



![image-20260316151426177](/images/assets/image-20260316151426177.png)

```
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .box1 {
            background: red;
            height: 200px;
        }

        .box2 {
            background: green;
            width: 100px;
            height: 100px;
            float: left;
        }
    </style>
</head>

<body>
    <div class="box2"></div>

    <div class="box1"></div>
</body>
```



我们只需要将box1设置为`BFC`，此时box1即为一个独立的个体，就不会收到浮动的影响了。

![image-20260316151450828](/images/assets/image-20260316151450828.png)





## TailwindCSS

### 安装

 安装 v3 稳定版（指定版本号） 

pnpm add -D tailwindcss@3 postcss autoprefixer 

用 pnpm exec 执行初始化（因为已本地安装，无需 dlx）

pnpm exec tailwindcss init -p



### 常见误区

**①tailcss不是内联样式**

​	通过预定义的**工具类**（class）来实现样式，不需要写原生 CSS 属性

| 维度           | CSS 内联样式                                                 | Tailwind CSS                                                 |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **本质**       | 原生 CSS 属性直接写在元素上                                  | 基于原子化工具类的 CSS 框架（**最终编译为类选择器**）        |
| **功能覆盖**   | 仅支持基础 CSS 属性，**无法使用**伪类（:hover）、媒体查询、伪元素等 | 支持所有 CSS 特性（伪类、媒体查询、响应式、暗黑模式等）      |
| **可复用性**   | **完全不可复用**，修改需逐个改元素                           | 工具类可全局复用，也可通过 `@apply` 封装自定义类             |
| **响应式设计** | 需手写 **`@media` 或 JS 控制**，极其繁琐                     | 内置响应式前缀（sm:/md:/lg:），一键适配不同屏幕              |
| **维护性**     | 样式散落在各个元素，代码冗余，后期难维护                     | 样式逻辑集中在工具类，统一规范，易维护                       |
| **性能**       | 无额外编译步骤，但样式冗余（**每个元素重复写**）             | 编译后只保留用到的类，体积小；可通过 PurgeCSS 精简           |
| **设计规范**   | 完全自由，易出现样式不统一（比如不同人写的圆角可能是 8px/10px） | 基于预设的设计系统（如间距、颜色、圆角都有统一取值），保证样式一致性 |

> CSS 原子化是指将 CSS 的样式拆分为极小的、独立的单元，每个单元只负责一个单一的样式规则。这些样式通常以类名的形式存在，直接应用到 HTML 标签上，从而实现样式的组合和复用。常见的原子化工具或框架有Tailwind CSS，unocss，windi css。







### 三条指令



1. Tailwind 三条指令是做什么

- @tailwind base;
	注入 Tailwind 的基础样式（类似浏览器样式归一化 + 一些默认基础规则）。
- @tailwind components;
	注入组件层（你自己写的组件类通常放这一层）。
- @tailwind utilities;
	注入工具类（你在 JSX 里写的 bg-slate-50、flex、px-4 这些都属于这里）。



`@layer base` 是 TailwindCSS 中非常核心的**层（Layer）** 特性

| 层级         | 作用                                          | 优先级 |
| ------------ | --------------------------------------------- | ------ |
| `base`       | 基础样式（全局重置、默认标签样式）            | 最低   |
| `components` | 组件样式（按钮、卡片等可复用组件）            | 中等   |
| `utilities`  | 工具类样式（Tailwind 自带的 px-4、bg-red 等） | 最高   |



```
@layer base {
  html,
  body,
  #root {
    margin: 0;
    min-height: 100%;
  }

  body {
    font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }
}
```

**把你自定义的 html/body/#root 基础样式，归类到 Tailwind 的 `base` 层中**。

如果直接写全局样式（不加 `@layer`），样式优先级是 “谁后加载谁生效”，容易和 Tailwind 自带样式冲突

Tailwind 在打包生产环境代码时，会自动删除未使用的样式（摇树优化）

​	放在 `@layer` 里的样式：会被 Tailwind 识别，**只有用到的才保留**；		

​	不放在 `@layer` 里的全局样式：会被原样保留（即使没用），导致最终 CSS 文件体积变大。



`@layer base` 定义的样式是**全局自动生效**的（比如 body 的样式会作用于整个页面）

如果在组件中用 Tailwind 工具类（比如 `text-red-500`）覆盖 `base` 层的样式（比如 body 的 color: #333），工具类会优先生效（这是 Tailwind 层的设计初衷）。



### 主题切换

 Tailwind 暗黑模式的**触发类**。

页面中所有 `dark:` 前缀的样式会生效

![image-20260315230015961](/images/assets/image-20260315230015961.png)



### 常见使用方法

#### 水平居中：

`left-1/2` 设置左边距为 50% 

`-translate-x-1/2` 将元素向左移动自身宽度的 50%

> 向右移动写法是 `translate-x-1/2`

#### 响应式设计前缀

md:表示在中等屏幕（min-width: 768px）及以上应用后面的样式

```
<section className="grid grid-cols-1 gap-4 md:grid-cols-4">
```



#### 卡片样式

h-44 设置高度为 44

rounded-2xl 设置圆角为 2xl

border 设置边框

border-slate-200 设置边框颜色为 slate-200

bg-white 设置背景颜色为白色

p-5 设置内边距为 5

text-left 设置文本左对齐

text-sm 设置文本大小为小

font-bold 设置文本为粗体

text-slate-500 设置文本颜色为

resize-none 禁用浏览器右下角手动拖拽，统一交互体验


#### 渐变色文字

`background-clip: text` 是实现**字体渐变色**的核心 CSS 属性

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>字体渐变色</title>
  <style>
    .gradient-text {
      /* 1. 设置渐变背景（核心：线性渐变，从左到右，红→橙→黄） */
      background: linear-gradient(to right, #ff0000, #ffa500, #ffff00);
      /* 2. 裁剪背景到文字（兼容写法必须加） */
      -webkit-background-clip: text;
      background-clip: text;
      /* 3. 文字设为透明，让渐变背景显示 */
      color: transparent;
      /* 可选：美化文字 */
      font-size: 60px;
      font-weight: bold;
      text-align: center;
      margin-top: 50px;
      display: inline;
    }
  </style>
</head>
<body>
  <div class="gradient-text">Hello 渐变字体</div>
</body>
</html>
```

而tailwindCSS:

bg-gradient-to-r 设置从左到右的线性渐变背景

from-sky-500 渐变起始颜色为 sky-500

via-cyan-500 渐变中间颜色为  cyan-500

to-blue-600 渐变结束颜色为 blue-600

 bg-clip-text 将背景裁剪为文本形状:把元素的背景（颜色 / 渐变 / 图片）“裁剪” 成文字的形状

text-transparent  文本设置为透明



下面这种写法会发现文字变化一点也不明显，**因为h1是块级元素，默认占一整行**，因此要在末尾加上inline-block

```html
<h1 className="bg-gradient-to-r from-sky-500 via-cyan-700 to-blue-900 bg-clip-text text-5xl font-bold text-transparent inline-block">
        嗨，我是灵犀
</h1>

```

#### 对话框

父容器：flex justify-end 右对齐

子容器：

​	max-w-[80%] 设置最大宽度为 80%

​	rounded-2xl 设置圆角为 2xl，rounded-tr-none 设置右上角不圆

​	bg-sky-600 设置背景颜色为 sky-600，px-4 设置水平内边距为 4

![image-20260316154415202](/images/assets/image-20260316154415202.png)
