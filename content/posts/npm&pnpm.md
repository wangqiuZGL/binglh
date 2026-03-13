
+++
title = "npm vs pnpm"
tags = ["node"]
date = 2025-03-13T10:00:00+08:00
cover = "/images/covers/index.jpg"
summary = "介绍二者的区别"
+++


## pnpm和npm比较

pnpm 基于 **内容寻址** 的文件系统来存储磁盘上所有的文件 ，在项目中需要使用到依赖的时候，**pnpm 只会安装一次**，之后再次使用都会直接**硬链接**指向该依赖，极大节省磁盘空间，并且加快安装速度

> 即使一个包的不同版本，pnpm 也会极大程度地复用之前版本的代码，仅下载更新的几个包



npm2  依赖管理 ： 按照 安装包的**依赖树**结构 直接填充在本地的目录结构下。比如`express`和`koa`他们会同时依赖`accepts`

<img src="/images/assets/image-20260313194958246.png" alt="image-20260313194958246" style="zoom:50%;" />

> 1. 层级依赖过深
> 2. 相同包的相同版本会多次被下载，利用率低，占用磁盘空间大



npm3 不再使用嵌套的结构了 , **扁平化**——**扁平化依赖算法耗时长**

<img src="/images/assets/image-20260313195047781.png" alt="image-20260313195047781" style="zoom:50%;" />

如果是同版本的，那就都在同一级目录

但是如果版本不同，npm还是会完整的下载两个不同的版本：

![image-20260313195141412](/images/assets/image-20260313195141412.png)



npm5 引入 package-lock.json 机制，锁定项目的依赖结构，保证依赖的稳定性



## pnmp的优势

`node_modules` 中`.pnpm`下每个包的每个文件都是来自内容可**寻址存储的硬链接**

> 引用的是文件在文件系统中的物理索引（inode），当移动或者删除原始文件时，硬链接不会被破坏
>
> ln file hardfile   //  file删除之后，hardfile不受影响
>
> ln -s file softfile

如果有依赖不同版本的时候，pnpm也只会下载不同版本中不同的内容

![image-20260313195624512](/images/assets/image-20260313195624512.png)