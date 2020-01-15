---
title: es6数组flat方法的代码实现
date: '2020-01-14'
type: 技术
tags: es6
note: es6数组flat方法的代码实现
---
# es6数组flat方法的代码实现

&#8195;&#8195;ES6的数组的flat方法的主要作用是进行数组降维处理。该方法返回的是一个新数组，对原数组没有影响。

**实现方法1 利用reduce和spead运算符**

```javascript 
function flat1(arr){
    return arr.reduce((accu,cur)=>{
        return Array.isArray(cur)?[...accu,...flat1(cur)]:[...accu,cur]
    } ,[]);
}
```
**实现方法2 利用reduce和contact**

```javascript 
function flat2(arr){
    return arr.reduce((accu,cur)=>{
        return Array.isArray(cur)?accu.concat(flat2(cur)):accu.concat(cur);
    } ,[]);
}
```
**实现方法3  通过判断数组中最后一个元素是否数组，是的话，就继续循环取最后一个元素，直到最后一个元素不为数组为止,然后再将数组逆序放入一个新的数组。**

```javascript
function flat3(arr){
    let res=[];
    let cloneArr=[...arr];
    while(cloneArr.length){
        let lastEle=cloneArr.pop();
        if(Array.isArray(lastEle)){
            cloneArr.push(...lastEle);
        }else{
            res.push(lastEle);
        }
    }
    return res.reverse();
}
```
**实现方法3的改进**

```javascript
function flat3(arr){
    let res=[];
    let cloneArr=[...arr];
    while(cloneArr.length){
        let lastEle=cloneArr.pop();
        if(Array.isArray(lastEle)){
            cloneArr.push(...lastEle);
        }else{
            //此时最后一个元素不是数组了，此时已经是一维数组
            return cloneArr.concat(lastEle);
        }
    }
}
```
**实现方法4** 

```javascript
//实现思想跟方法3差不多
function flat4(arr){
    while(arr.some(item=>Array.isArray(item))){
        arr=[].concat(...arr);
    }
    return arr;
}
```
<Valine></Valine>