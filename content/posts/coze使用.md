+++
title = "coze基础用法"
tags = ["Agent"]
date = 2026-02-01T10:00:00+08:00
cover = "/images/assets/coze.png"
summary = "coze感觉比n8n好用一些"
+++


## coze的提示词

分为系统提示词和用户提示词

系统提示词持续影响整个会话，用户提示词指导模型执行特定任务



还可以让AI帮忙生成



![image-20260318214738643](/images/assets/image-20260318214738643.png)





## RAG---LLM带消息滞后的缺陷

检索增强技术

先从知识库中检索相关文档，讲检索到的文档与原始问题一起输入LLM,LLM基于检索内容生成最终答案

![image-20260318215154403](/images/assets/image-20260318215154403.png)



### 知识库创建

类型：

​	**文档、表格、图像**

​	保证上传文档的准确性、命名规范

<img src="/images/assets/image-20260318215616757.png" alt="image-20260318215616757" style="zoom:50%;" />

文档切片：

​	为了适应上下文长度限制，并且也能提升检索的精确度；

​	切片方式： **字符、标点符号**、语义



文档**向量化**——语义理解、相似度计算、快速检索

​	原来的文本变成数字，便于计算相似性



## Function calling

在语言模型中**集成**外部功能或API的调用能力（chat server），

意味着模型可以在生成文本的过程中**调用**外部函数或服务，获取额外的数据或执行的特定任务（LLM本身不能调用函数）



实现：信息实时性 、 数据局限性（某些领域不涉及，让他去获取）、功能扩展性



流程：

​	用户发 请求提示词 以及 functions 给 chat server 

```
prompt:" what's weather today"
function:{ getLocation , getweather(location) }
```

​			LLM 会根据用户的 提示词判断是 普通文本 还是 函数调用

​			如果是函数调用格式，让serve执行函数，并把结果给LLM

```
LLM: call getweather(location)  ---> server
server ---> raining ---> LLM
LLM---->Client
```



### 在coze中使用Function calling

一个插件其实是一堆工具的集合

<img src="/images/assets/image-20260319154056966.png" alt="image-20260319154056966" style="zoom:50%;" />

你可以在里面定义很多的工具

要指定输入和输出

<img src="/images/assets/image-20260319154117544.png" alt="image-20260319154117544" style="zoom:50%;" />

![image-20260319154822199](/images/assets/image-20260319154822199.png)



可以让AI帮忙写一个代码。制定好输入输出

```python
# 导入 Coze 运行时所需的 Args 类，用于获取输入参数和日志记录器
from runtime import Args
# 导入 requests 库，用于发送 HTTP 请求（调用天气 API）
import requests # 需要安装对应的库

# 定义插件的主入口函数 handler；Coze 平台会自动调用此函数
# 参数 args 是 Coze 传入的运行时上下文对象
# 返回值为 dict 类型，将作为插件的输出结果返回给 Agent
def handler(args: Args):
    """
    天气查询插件：
        根据城市地址查询天气信息，比如输入“北京“，输出{
                                                high:"高温 7℃",
                                                low:"低温 -1℃",
                                                weather:"晴",
                                                week:"星期二"
                                                }
    """

    # === 1. 解析输入 ===
    try:
        # 从 args.input 中获取 location 字段，并去除首尾空格（如用户输入 " 北京 "）
        # 注意：此处假设输入为对象属性访问（如 args.input.location），适用于 manifest 中声明了 location 字段的情况
        location = args.input.location.strip()
    except Exception:
        # 若获取 location 失败（如字段不存在、输入非对象等），设为空字符串
        location = ""

    # === 2. 城市编码映射（仅北京、天津，内置）===
    # 构建城市名称 → 天气 API 编码的映射字典（仅保留北京和天津两个城市，轻量且教学友好）
    city_code_map = {
        "北京": "101010100",   # 北京市的天气 API 编码
        "天津": "101030100"    # 天津市的天气 API 编码
    }
    # 根据用户输入的城市名，查找对应的编码；若找不到则返回 None
    city_code = city_code_map.get(location)

    # 不支持的城市（如输入“上海”或空字符串）→ 返回空值结构
    if not city_code:
        # 记录警告日志：提示该城市暂不支持（可在 Coze 后台查看）
        args.logger.warning(f"Unsupported location: '{location}'")
        # 返回标准化的空结果（所有字段为 None），保证输出结构一致
        return {
            "high": None,       # 最高温度
            "low": None,        # 最低温度
            "weather": None,    # 天气类型（如“晴”）
            "week": None        # 星期（如“星期二”）
        }

    # === 3. 调用天气 API ===
    # 拼接完整 API 请求 URL，替换 {city_code} 为实际城市编码
    url = f"http://t.weather.itboy.net/api/weather/city/{city_code}"
    
    try:
        # 发起 GET 请求，设置超时 5 秒（防止插件卡死）
        response = requests.get(url, timeout=5)
        # 若 HTTP 状态码非 2xx，主动抛出异常（如 404、500 等）
        response.raise_for_status()
        # 将响应体解析为 JSON 字典（安全方式，避免使用危险的 eval()）
        data = response.json()

        # 检查 API 业务层返回状态码（该 API 约定 status=200 表示成功）
        if data.get("status") != 200:
            # 若业务状态异常（如城市编码错误），抛出自定义异常
            raise ValueError("Weather API returned non-200 status")

        # 从返回数据中提取「今日」天气预报（forecast 列表第 0 项即为当天）
        # 路径：data → forecast 数组 → 第 0 个元素
        forecast = data["data"]["forecast"][0]
        
        # 构造并返回天气基本信息字典
        return {
            "high": forecast["high"],     # 字符串，如 "高温 7℃"
            "low": forecast["low"],       # 字符串，如 "低温 -1℃"
            "weather": forecast["type"],  # 字符串，如 "晴"、"小雨"
            "week": forecast["week"]      # 字符串，如 "星期二"
        }

    # 捕获所有可能的异常（网络错误、JSON 解析失败、字段缺失等）
    except Exception as e:
        # 记录错误日志，包含具体异常信息和请求城市，便于调试
        args.logger.error(f"Weather query failed for '{location}': {e}")
        # 统一返回空值结构，确保插件健壮性（不会因异常导致 Agent 崩溃）
        return {
            "high": None,
            "low": None,
            "weather": None,
            "week": None
        }
```

![image-20260319161735912](/images/assets/image-20260319161735912.png)







## 工作流 workflow

**业务逻辑的可视化执行**

可以将 复杂的任务 分解成一系列可管理、按顺序、按条件执行的步骤，并通过图形化界面讲这些步骤连接起来



两种类型： workflow 、 对话流 chatflow

![image-20260319163031641](/images/assets/image-20260319163031641.png)



### 节点---工作流的核心

具有特定功能的独立组件，负责处理数据、执行任务

类型：

​	流程控制    开始  结束

​	逻辑    条件判断、选择器、循环等

​	功能    插件、LLM、问答

​	数据处理	变量、聚合、转换

​	输出	输出节点	



按步骤的、条件分支的  批处理的、数据转换（表格转分析图）





## 对话助手

![image-20260319163650140](/images/assets/image-20260319163650140.png)





添加一个跨境电商对话流

![image-20260319163758840](/images/assets/image-20260319163758840.png)



### 意图识别

这是个插件，可以自定义，主要用来对用户输入进行判断，看是否与跨境电商有关

进行知识库检索会有性能开销，不能所有问题都去检索

创建一个插件，专门用来判断的

![image-20260319164802701](/images/assets/image-20260319164802701.png)



发布之后，到工作流中导入，并且指定输入、输出

![image-20260319164823398](/images/assets/image-20260319164823398.png)

![image-20260319164938506](/images/assets/image-20260319164938506.png)



### 选择器

- 作用：获取意图识别的结果

	```properties
	如果意图识别属于：打招呼、人工服务这两种类型，直接返回默认结果结束；否则，直接经过知识库检索
	```

- 实现方式：添加**《选择器》**节点

<img src="/images/assets/image-20260319223141781.png" alt="image-20260319223141781" style="zoom: 67%;" />

如果是 相关问题，才会到知识库的检索

### 知识库检索

![image-20260319224119135](/images/assets/image-20260319224119135.png)

![image-20260319224313376](/images/assets/image-20260319224313376.png)

### 判断是否可以检测出结果

使用选择器

![image-20260319224726550](/images/assets/image-20260319224726550.png)

<img src="/images/assets/image-20260319224808349.png" alt="image-20260319224808349" style="zoom:50%;" />

![image-20260319225002848](/images/assets/image-20260319225002848.png)



### 总结

开始：用户输入问题

插件：创建一个插件-**意图识别**

​	作用： 输入用户的问题，输出：问题类型 type ，问题内容 origin_query , 回复的结果 **response** ,是否需要rag need_rag



IF选择器：**判断type** 

​	如果为greeting（打招呼的，直接结束），output = "**response**"。【直接走最后结束节点】

​	否则：调用知识库（走下面的步骤）



新建一个知识库索引，新建一个知识库（表格，导入本地文档，解析成 question --- answer 类型）

​	输入是 origin_query , 知识库就是上面的，最大召回数为1，

​	输出是outputList (coze自带的)



IF选择器：判断检索的outputList是否为空，如果为空，走闲聊大模型，不为空，走RAG大模型



闲聊大模型：输入为 original_query ，系统提示词 和用户提示词（就是输入的original_query)；输出为自带的output

Rag大模型 输入：original_query , outputList , 输出为自带的output



结束：直接输出三种清空的结果

![image-20260320110527470](/images/assets/image-20260320110527470.png)

发布即可