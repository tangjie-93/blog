---
title: jquery之正则表达式详解
date: '2020-10-28'
type: 技术
tags: jquery
note: jquery之正则表达式详解
---
#### 1、非空字符
该正则表达式可以用来分割字符串，比`split`的功能更强大。可以同时按照不同分隔符来分割字符串。
```js
//在中括号中的^表示非的意思,\X20表示空格,/g表示全局搜索,使用match方法时将返回匹配数组
const rnothtmlwhite=/[^\x20\r\n\t\f]+/
//测试
"test".match(rnothtmlwhite);//=>["test"]
"test\rceshi".match(rnothtmlwhite);//["test","ceshi"]
"once memory\r334".match(/[^\x20\t\n\f\r]+/g);//=>["once","memory","334"]
```
下面是该正则表达式在源码中的使用。
```js
/*1、先将字符串转换成数组,
* 2、然后再将数组转换成key数组元素，value为true的对象
*/
function createOptions(options){
    const option={};
    //options.match(rnothtmlwhite)//将字符串转换成数组
    jQuery.each(options.match(rnothtmlwhite)||[],function(_,flag){
        option[flag]=true;
    });
    return option;
}
createOptions("once\tmemory");//{ "once":true,"memory":true }
createOptions("once memory");//{"once":true,"memory":true}
```
#### 2、匹配html的正则表达式
```js
rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
```
分析
1. 通过选择|分割二义,匹配^开头或者$结尾
```js
^(?:\s*(<[\w\W]+>)[^>]*
#([\w-]*))$
```
2. `^(?:\s*(<[\w\W]+>)[^>]*`

+ `(?:pattern)` : 匹配 `pattern` 但不获取匹配结果，也就是说这是一个**非获取匹配**，不进行存储供以后使用。
```js
const a = "123abc456ww";
let pattern = "([0-9]*)([a-z]*)([0-9]*)";
console.log(a.match(pattern));//["123abc456", "123", "abc", "456", index: 0, input: "123abc456ww", groups: undefined]
pattern = "(?:[0-9]*)([a-z]*)([0-9]*)";
console.log(a.match(pattern));//["123abc456", "abc", "456", index: 0, input: "123abc456ww", groups: undefined] 123没有被捕获

```
+ `\s*` : 匹配任何空白字符，包括空格、制表符、换页符等等 零次或多次 等价于{0,}
+ `(pattern)` : 匹配`pattern` 并获取这一匹配。所获取的匹配可以从产生的 `Matches` 集合得到，使用 `$0…$9` 属性
+ [\w\W]+ : 匹配于`[A-Za-z0-9_]`或 `[^A-Za-z0-9_]` 一次或多次， 等价{1,}
+ (<[wW]+>) :这个表示字符串里要包含用<>包含的字符，例如`<p>,<div>`等等都是符合要求的
+ [^>]* : 负值字符集合,字符串尾部是除了>的任意字符或者没有字符,零次或多次等价于{0,},

3. `#([\w-]*))$`
匹配结尾带上#号的任意字符，包括下划线与-
#### 3、匹配一个独立的标签
```js
const rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
rsingleTag.test("<div>");//true
rsingleTag.test("<div/>");//true
const res=rsingleTag.exec("<div/>");
res[1];//=>div
rsingleTag.test("</div>");//false
rsingleTag.test("<div></div>");//true

rsingleTag.test("<div><div>");//false
const parsed=rsingleTag.exec("<div></div>");//parsed[1]=>div
```
+ `^<(\w+)\s*\/?>`  : 以<开头，至少跟着一个字符和任意个空白字符，之后出现0或1次/>
+ `(?:<\/\1>|)$`      : 可以匹配<、一个/或者空白并以之为结尾