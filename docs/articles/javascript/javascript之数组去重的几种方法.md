---
title: 数组去重的几种方法
date: '2020-01-14'
type: 技术
tags: javascript
note: 数组去重的几种方法
---
&#8195;&#8195;平时工作当中经常会遇到数组去重的需求，所以在这里整理一下有哪些方法可以实现数组的去重。
<img src="../../images/数组去重的几种方法.png" alt="暂无数据" height="300" >

<h3>1、双层for循环</h3>

```js
function removeSameEle(arr){
    let res=[]; 
    for(var i=0,len=arr.length;i<len;i++){
        for(var j=0,resLen=res.length;j<resLen;j++){
            if(arr[i]===arr[j]){//判断结果中是否已存在该数据了
                break;
            }
        }
        //判断是否执行到了res的末尾
        if(j===resLen){
            res.push(arr[i]);
        }
    }
    return res;
}
```
<h3>2、indexof或者includes</h3>

```js       
function removeSameEle(arr){
    let res=[];
    for(var i=0,len=arr.length;i<len;i++){
        //if(!res.includes(arr[i])){
        if(res.indexof(arr[i])<0){//判断结果中是否存在该数据了
            res.push(arr[i])
        }
    }
    return res;
}
```

<h3>3、filter</h3>

```js
function removeSameEle(arr){
    let res=arr.filter((item,index,arr)=>{
        return arr.indexOf(item)===index;
    });
    return res;
}
```

<h3>4、reduce唯一值去重</h3>

```js       
function removeSameEle(arr){
    return arr.reduce((accu,cur)=>{
            return accu.includes(cur)?[...accu]:[...accu,cur]
        },[])
    })
}
```
<h3>5、set唯一值去重</h3>
&#8195;&#8195;此方法只能用于对简单数组进行去重。

```js
function removeSameEle(arr){
    return [...new Set(arr)];
}
```

<h3>6、Map去重</h3>  

```js
function removeSameEle(arr){
    let map=new Map();
    let res=[];
    for(let i=0;len=arr.length;i<len;i++){
        if(!map.has(arr[i])){
            map.set(arr[i],arr[i]);
            res.push(arr[i]);
        }
    }
    return res;
}
```

<h3>7、sort排序后去重</h3>

```js
function removeSameEle(arr){
    let res=[];
    let sortedArr=arr.sort();
    for(let i=0,len<sortedArr.length;i<len-1;i++){
        if(i==0||sortedArr[i]!==sortedArr[i+1]){
            res.push(sortedArr[i]);
                if(i===(len-2)){
                res.push(sortedArr[i+1]);
            }
        }
    }
    return res;
}
```

<h3>8、使用object.keys()去重</h3>

```js
function removeSameEle(arr){
    let res=[];
    let obj={};
    arr.forEach((item,index)=>{
        if(!obj[item]){
            obj[item]=item
        }
    });
    for(let value of Object.values(obj)){
        res.push(value);
    }
    return res;
}
```
