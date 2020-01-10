改造下面的代码，使之输出0 - 9，写出你能想到的所有解法。
```javascript
for (var i = 0; i< 10; i++){
    setTimeout(() => {
        console.log(i);
    }, 1000)
}
```
### 方法1
```javascript
//给setTimeout传第三个参数，作为函数的形参
for (var i = 0; i< 10; i++){
    setTimeout((i) => {
        console.log(i);
    }, 1000,i)
}
````
### 方法2
```javascript
//利用立即执行函数，将i作为函数的形参
//方式1
for (var i = 0; i< 10; i++){
    ((i)=>{
        setTimeout(() => {
            console.log(i);
        }, 1000,)
    })(i)
}
//方式2
for (var i = 0; i < 10; i++) {
    setTimeout(((i) => {
        console.log(i);
    })(i), 1000)
}
```
### 方法3
```javascript
//利用let,构建块级作用域
for (let i = 0; i< 10; i++){
    setTimeout(() => {
        console.log(i);
    }, 1000,)
}
```
### 方法4
```javascript
for (var i = 0; i < 10; i++) {
    setTimeout(console.log(i), 1000)
}
```
### 方法5
```javascript
//利用 eval 或者 new Function 执行字符串
for (var i = 0; i < 10; i++) {
    setTimeout(eval('console.log(i)'), 1000)
}
for (var i = 0; i < 10; i++) {
    setTimeout(new Function('console.log(i)')(), 1000)
}
```
### 方法6
```javascript
//利用try/catch的块级作用域
for(var i = 0; i < 10; i++){ 
    try{
        throw i;
    }catch(i){
        setTimeout(() => { console.log(i); },1000)    
    }
}    
```