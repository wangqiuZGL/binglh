
+++
title = "虚拟DOM&Diff算法"
tags = ["Vue"]
date = 2025-01-01T10:00:00+08:00
cover = "/images/assets/image-20260315174408410.png"
summary = "文件分片、断点、进度显示"
+++


## 什么是虚拟DOM

​	**一个用来表示真实DOM的对象**

​	

```
<ul id="list">
    <li class="item">哈哈</li>
    <li class="item">呵呵</li>
    <li class="item">嘿嘿</li>
</ul>
```



```js
let oldVDOM = { // 旧虚拟DOM
        tagName: 'ul', // 标签名
        props: { // 标签属性
            id: 'list'
        },
        children: [ // 标签子节点
            {
                tagName: 'li', props: { class: 'item' }, children: ['哈哈']
            },
            {
                tagName: 'li', props: { class: 'item' }, children: ['呵呵']
            },
            {
                tagName: 'li', props: { class: 'item' }, children: ['嘿嘿']
            },
        ]
    }
```



**虚拟DOM算法操作真实DOM，性能高于直接操作真实DOM**



## 什么是diff算法 ---- vue2

diff 算法是一种通过同层的树节点进行比较的高效算法，深度优先算法。 时间复杂度:O(n)

​	其有两个特点：

​		•比较只会在同层级进行, 不会跨层级比较

​		•在diff比较的过程中，循环从两边向中间比较



流程：

当数据改变时，会触发`setter`，并且通过`Dep.notify`去通知所有`订阅者Watcher`，订阅者们就会调用`patch方法`，给真实DOM打补丁，更新相应的视图。



分为多种情况：

<img src="/images/assets/image-20260315174408410.png" alt="image-20260315174408410" style="zoom:67%;" />



patch方法：接收两个参数，**oldVnode newVnode**

​	如果 这俩相同（判断标注：key、标签名、input框要求type相同、是否都有data），那么继续向深层比较

​		如果这两个对象 === 比完一样，那么终止

​		如果节点类型一样，但是内容不一样，则用newVnode 里面的替换掉 旧的

​		他们的孩子处理 ： 多了添加，少了删除，如果都有孩子，那么就要进行 `updateChildren`



​	如果这俩不相同，替换就行了

```js
const oldEl = oldVnode.el; //旧虚拟节点的真实DOM节点 ,为了拿到他的父节点
const parentEl = api.parentNode(oldEl) // 拿到原本的父节点
createEl(newVnode); //创建新虚拟节点对应  的真实dom
if(parentEl!==null) {
    api.insertBefore(parentEle, vnode.el, api.nextSibling(oEl)) // 将新元素添加进父元素
    api.removeChild(parentEle, oldVnode.el)  // 移除以前的旧元素节点
    oldVnode = null
}
return newVnode
```





### updateChildren

对比的方法就是首尾指针法：

​	新的子节点集合和旧的子节点集合，各有首尾两个指针

​	

```js
<ul>
    <li>a</li>
    <li>b</li>
    <li>c</li>
</ul>

修改数据后

<ul>
    <li>b</li>
    <li>c</li>
    <li>e</li>
    <li>a</li>
</ul>
```

![image-20260315175211708](/images/assets/image-20260315175211708.png)

然后会进行互相进行比较，总共有五种比较情况：

```
oldS = a, oldE = c
newS = b, newE = a
```

- 1、`oldS 和 newS `使用`sameVnode方法`进行比较，`sameVnode(oldS, newS)`
- 2、`oldS 和 newE `使用`sameVnode方法`进行比较，`sameVnode(oldS, newE)`
- 3、`oldE 和 newS `使用`sameVnode方法`进行比较，`sameVnode(oldE, newS)`
- 4、`oldE 和 newE `使用`sameVnode方法`进行比较，`sameVnode(oldE, newE)`
- 5、如果以上逻辑都匹配不到，再把所有旧子节点的 `key` 做一个映射到旧节点下标的 `key -> index` 表，然后用新 `vnode` 的 `key` 去找出在旧节点中可以复用的位置。



#### 第一步

`oldS 和 newE` 相等，需要把`节点a`移动到`newE`所对应的位置

![image-20260315175354615](/images/assets/image-20260315175354615.png)

此时 `oldS`和 `newE` 移动 【只让相等的移动。S++ E--】



#### 第二步

![image-20260315175502192](/images/assets/image-20260315175502192.png)



#### 第三步

![image-20260315175525138](/images/assets/image-20260315175525138.png)

#### 第四步

`oldS > oldE`，则`oldCh`先遍历完成了，而`newCh`还没遍历完，说明`newCh比oldCh多`，所以需要将多出来的节点，插入到真实DOM上对应的位置上

![image-20260315180536046](/images/assets/image-20260315180536046.png)









## Vue3 Diff —— 最长递增子序列

**静态标记（PatchFlags）**：编译阶段标记动态内容，diff 时只处理动态部分，跳过静态节点；

**最长递增子序列**：针对列表渲染，计算最小 DOM 移动量，减少不必要的 DOM 操作；

**非递归流程**：避免深层递归阻塞主线程，配合浏览器调度更流畅。



这是 Vue3 diff 最核心的部分，针对 `v-for` 列表的对比逻辑：

- 步骤 1：先做「头尾快速对比」（比如旧列表头是 a，新列表头也是 a → 直接复用，指针后移）；
- 步骤 2：对剩余节点，用「最长递增子序列」计算出无需移动的节点；
- 步骤 3：只移动需要调整位置的节点，或创建 / 删除新增 / 删除的节点。



