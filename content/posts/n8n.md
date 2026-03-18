
+++
title = "workflow搭建尝试"
tags = ["Agent"]
date = 2026-02-01T10:00:00+08:00
cover = "https://p3-xtjj-sign.byteimg.com/tos-cn-i-73owjymdk6/8539f625e4da4e1e98cbaa12fec6c2bb~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5ZCO56uv5bCP6IKl6IKg:q75.awebp?rk3s=f64ab15b&x-expires=1774405442&x-signature=5R7BGBiqzUIE06jXVQGb0UYarHE%3D"
summary = "n8n平台"
+++


## n8n部署

推荐下载docker桌面应用

在命令行输入两行命令：

```
docker volume create n8n_data


docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

<img src="/images/assets/image-20260317184542371.png" alt="image-20260317184542371" style="zoom:50%;" />



进入

<img src="/images/assets/image-20260317184750089.png" alt="image-20260317184750089" style="zoom:50%;" />

配置成社区节点：

<img src="/images/assets/image-20260317185004041.png" alt="image-20260317185004041" style="zoom:50%;" />





## 创建工作流

有很多种触发方式

<img src="/images/assets/image-20260317185301922.png" alt="image-20260317185301922" style="zoom:50%;" />

可以选择聊天触发



然后打开open chat 发送你好

<img src="/images/assets/image-20260317185509651.png" alt="image-20260317185509651" style="zoom:50%;" />





创建一个判断标签，然后双击进去，可以把chatInput拖进去，判断里面是否为String，再加上正则表达式

<img src="/images/assets/image-20260317185728982.png" alt="image-20260317185728982" style="zoom:50%;" />



判断里面是否含有链接,**问豆包**：判断字符串里面有链接的正则表达式即可，点一下Execute step

接下来做条件为true时的情况，首先要添加一个AI agent



### 配置聊天模型

<img src="/images/assets/image-20260317191643091.png" alt="image-20260317191643091" style="zoom:50%;" />

我这里使用的是gpt-4.1



### 配置提示词和系统提示词

<img src="/images/assets/image-20260317191611224.png" alt="image-20260317191611224" style="zoom:50%;" />

### 添加你需要的mcp工具

在agent下面的tool里面点加号，搜mcp，然后添加 mcp client

在这里注册服务的api key：https://www.firecrawl.dev/app/api-keys

具体操作配置 https://github.com/modelcontextprotocol/servers?tab=readme-ov-file 查看这里面有说明

```
例如：
{
  "mcpServers": {
    "firecrawl-mcp": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "YOUR-API-KEY"
      }
    }
  }
}
```

<img src="/images/assets/image-20260317192108073.png" alt="image-20260317192108073" style="zoom:50%;" />

从 AI 工具中获取名为 `toolname` 的值

<img src="/images/assets/image-20260317192759753.png" alt="image-20260317192759753" style="zoom:50%;" />



接着申请另一个工具 联网搜索

https://app.tavily.com/home

https://github.com/tavily-ai/tavily-mcp

![image-20260317194835989](/images/assets/image-20260317194835989.png)



配置完成，然后聊天即可
