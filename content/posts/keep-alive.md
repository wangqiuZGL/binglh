+++
title = "keep-alive的妙用"
tags = ["vue"]
date = 2025-09-13T10:00:00+08:00
cover = "/images/assets/a.jpg"
summary = "新增钩子和component"
+++




## keep-alive

通过Map或Object缓存组件vnode实例，渲染时直接从缓存中取



缓存组件实例：避免重复销毁和创建，保留组件状态
提升性能：适用于需要频繁切换但状态需保留的组件（如Tab页、表单填写页）

<template>
  <keep-alive :include="['ComponentA', 'ComponentB']" :max="5">
    <component :is="currentComponent"></component>
  </keep-alive>
</template>
新增钩子（仅在被缓存的组件中触发）
onActivated：组件被激活（插入DOM）时触发。首次加载：onCreate->onMounted->onActivated
onDeactivated：组件被停用（移除DOM）时触发  切换离开：onDeactivated
再次进入：onActivated
彻底销毁：onUnmounted

> 1.include
> 匹配组件名称（name选项），仅缓存匹配的组件 ,支持字符串、正则、数组

> 2.exclude
>
> 排除指定组件，优先级高于include

> 3.max
> 最大缓存实例数，超出时按LRU（最近最少使用）策略淘汰旧实例
>
> LUR原理：有限淘汰最久未访问的实例



`<Component : is="组件名"> </Component>` 用来控制显示哪个组件的



## 进阶用法

**“哪些路由页面需要缓存、哪些不需要”**的精细化控制

通过 `router-view` 的**插槽**拿到当前路由组件，再结合路由 `meta` 标记

```js
<router-view v-slot="{ Component }">
  <keep-alive>
    <component :is="Component" v-if="$route.meta.keepAlive" />
  </keep-alive>
  <component :is="Component" v-if="!$route.meta.keepAlive" />
</router-view>
```

你可以`在router/index.js`里面配置

```js
{ path: '/home', component: Home, meta: { keepAlive: true } }
```

加 `v-slot="{ Component }"` → 能 “主动” 拿到组件实例