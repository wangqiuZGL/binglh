+++
title = "搞懂大模型定义词含义"
tags = ["Agent"]
date = 2026-02-01T10:00:00+08:00
cover = "https://p9-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/e6c7a55d79a34af28e5e185de2792b89~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgTHN4Xw==:q75.awebp?rk3s=f64ab15b&x-expires=1774405202&x-signature=y1pVaTZNpCynn7KkxAKwhlosXkk%3D"
summary = "MCP SKILL LLM"
+++


## LLM大语言模型

​	对话（只能一问一答）



### context 上下文

​	背景信息

### prompt

​	提示词



### memory

每次沟通前，可以把历史对话放到context里面，然后再提出问题

memory还可以再次调用LLM对历史对话进行总结





## Agent

LLM 对于网上的资料信息，需要提示关键词和位置才能获取【但是我们告诉他在哪里找又不智能】

因此就需要一个程序，帮助我们上网查询，再跟LLM沟通，然后处理LLM的结果再给用户

<img src="/images/assets/image-20260317163836903.png" alt="image-20260317163836903" style="zoom:50%;" />



### RAG-检索向量生成

agent可以上网搜索，也可以搜索本地文档和数据库，这时要使用向量数据库RAG，来吧相近的片段找出来

联网搜索的叫web search



## Function Calling

如果agent和LLM用自然语言沟通，很复杂，要有大量的判断，以及slice

因此需要一种固定格式,类似于前后端的接口通信

<img src="/images/assets/image-20260317164245169.png" alt="image-20260317164245169" style="zoom:50%;" />



## MCP- agent功能解耦

将一些 tools/list  方法返回工具列表， tools/call返回具体的方法

模型上下文协议，提供各种程序的程序集，Agent成一个传话筒  ，agent和工具服务之间的约定

<img src="/images/assets/image-20260317164457466.png" alt="image-20260317164457466" style="zoom:50%;" />



## 和agent通信的类型

命令行窗口的形式：CLI  IFlow\ CodeX \Claude Code

编程程序： cursor Trae 

桌面助手：Clawdbot、openclaw



## LangChain 

例如将 文件 提取 翻译 保存为 MD，直接让Agent做他会浪费token

完全可以写成脚本**py**，自动完成，中间的翻译让大模型完成



他的低代码方式叫：workFlow

 

## Skill - 渐进式批漏和按需加载

文件可以是各种形式，保存的形式也可能各种各样，每次都判断一下也很费劲

<img src="/images/assets/image-20260317165200697.png" alt="image-20260317165200697" style="zoom:50%;" />

因此可以在和智能体沟通时都提前让他读一下skill.md文件，里面说明了各种脚本的作用



一些比较简单的程序都直接嵌入到Agent里面了（内化在里面了）



