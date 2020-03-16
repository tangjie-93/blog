---
title: ES6之模块化详解
date: '2020-03-15'
type: 技术
tags: es6
note: ES6之模块化详解
---

<h4>1、 严格模式</h4>

&#8195;&#8195;ES6 的模块自动采用严格模式，不管你有没有在模块头部加上"use strict";。
严格模式主要有以下限制。
>1、变量必须声明后再使用。  
>2、函数的参数不能有同名属性，否则报错。    
>3、不能使用with语句。  
>4、不能对只读属性赋值，否则报错。  
>5、不能使用前缀 0 表示八进制数，否则报错。     
>6、不能删除不可删除的属性，否则报错。  
>7、不能删除变量delete prop，会报错，只能删除属性delete global[prop]。  
>8、eval不会在它的外层作用域引入变量（没懂）。  
>9、eval和arguments不能被重新赋值。     
>10、arguments不会自动反映函数参数的变化。  
>11、不能使用arguments.callee。（指向用于arguments对象的函数）  
>12、不能使用arguments.caller，值为undefined。（caller属性保存着调动当前函数的函数的引用）      
>13、禁止this指向全局对象。     
>14、不能使用fn.caller和fn.arguments获取函数调用的堆栈。    
>15、增加了保留字（比如protected、static和interface）。


<h4>2、 	export的用法</h4>

&#8195;&#8195;export命令用于**规定模块的对外接口**，import命令用于输入其他模块提供的功能。
&#8195;&#8195;**export写法种类：**
>1、使用大括号指定所要输出的一组变量。`export {firstName, lastName, year};`

>2、直接使用export关键字输出该变量。export var year = 1958;
```js
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1958;
//等同于下面这中写法
var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;
export {firstName, lastName, year};
```       
&#8195;&#8195;通常情况下，export输出的变量就是本来的名字，但是可以使用as关键字重命名。
```js
function v1() { ... }
function v2() { ... }
export {
    v1 as streamV1,
    v2 as streamV2,
    v2 as streamLatestVersion
};
```       
&#8195;&#8195;注意1：export命令规定的是对外的接口，必须与模块内部的变量建立一一对应关系。
```js
// 报错
export 1;
// 报错
var m = 1;
export m;
// 报错
function f() {}
export f;
```       
&#8195;&#8195;注意2：export语句输出的接口，**与其对应的值是动态绑定关系** ，即通过该接口，可以取到模块内部实时的值。 
```js
export var foo = 'bar';
setTimeout(() => foo = 'baz', 500);
```       
&#8195;&#8195;注意3：export命令可以出现在模块的任何位置，只要处于模块顶层就可以。
```js
function foo() {
    export default 'bar' // SyntaxError
}
foo()
```       
<h4>3、	import的用法</h4>

&#8195;&#8195;import命令输入的变量都是只读的，因为它的本质是输入接口。也就是说，**不允许在加载模块的脚本里面，改写接口。**
```js
import {a} from './xxx.js'
a = {}; // Syntax Error : 'a' is read-only;
//但是，如果a是一个对象，改写a的属性是允许的。
import {a} from './xxx.js'
a.foo = 'hello'; // 合法操作
```        
&#8195;&#8195;import后面的from指定模块文件的位置，可以是相对路径，也可以是绝对路径，.js后缀可以省略。如果只是模块名，不带有路径，那么必须有配置文件，告诉 JavaScript 引擎该模块的位置。
```js
import {myMethod} from 'util';
//util是模块文件名，由于不带有路径，必须通过配置，告诉引擎怎么取到这个模块。
```      
&#8195;&#8195;注意，import命令具有提升效果，会提升到整个模块的头部，首先执行。**import是静态执行，所以不能使用表达式和变量** ，这些只有在运行时才能得到结果的语法结构。
```js
// 报错
import { 'f' + 'oo' } from 'my_module';
// 报错
let module = 'my_module';
import { foo } from module;
// 报错
if (x === 1) {
    import { foo } from 'module1';
} else {
    import { foo } from 'module2';
}
```       
&#8195;&#8195;逐一指定要加载的方法：
```js
import { area, circumference } from './circle';
console.log('圆面积：' + area(4));
console.log('圆周长：' + circumference(14));
```       
<h4>4、	模块的整体加载 import *</h4>

&#8195;&#8195;整体加载的写法： `import * from "module"`
```js
import * as circle from './circle';
console.log('圆面积：' + circle.area(4));
console.log('圆周长：' + circle.circumference(14));
```        
<h4>5、	export default</h4>

&#8195;&#8195;用到export default命令，为模块指定默认输出。
```js
// export-default.js
export default function () {
    console.log('foo');
}
// import-default.js
import customName from './export-default'; 
//因为是默认输出的，所以这时import命令后面，不使用大括号。并且可以随意取名。
customName(); // 'foo'
```       
&#8195;&#8195;1、下面代码中，foo函数的函数名foo，在模块外部是无效的。加载的时候，视同匿名函数加载。
```js
function foo() {
    console.log('foo');
}
export default foo;
```       
&#8195;&#8195;2、一个模块只能有一个默认输出，因此export default命令只能使用一次。所以，import命令后面才不用加大括号，因为只可能唯一对应export default命令。
**本质上，export default就是输出一个叫做default的变量或方法，然后系统允许你为它取任意名字。但是建议import时还是用default后面的名字。**
```js        
// modules.js
function add(x, y) {
    return x * y;
}
export {add as default};
// 等同于
// export default add;
// app.js
import { default as foo } from 'modules';
// 等同于
// import foo from 'modules';
```       
&#8195;&#8195;3、因为export default命令的本质是将后面的值，赋给default变量，所以可以直接将一个值写在export default之后。
```js
// 正确
export default 42;
// 报错
export 42;
```        
&#8195;&#8195;4、如果想在一条import语句中，同时输入默认方法(default)和其他接口，可以写成下面这样。
```js
import _, { each, forEach } from 'lodash';
```       
&#8195;&#8195;5、	export default也可以用来输出类。
```js
// MyClass.js
export default class { ... }
// main.js
import MyClass from 'MyClass';
let o = new MyClass();
```       
<h4>6、	export和import的复合写法</h4>

```js
export { foo, bar } from 'my_module';
// 可以简单理解为
import { foo, bar } from 'my_module';
export { foo, bar };
```      
&#8195;&#8195;写成一行以后，foo和bar实际上并没有被导入当前模块，只是相当于对外转发了这两个接口，导致当前模块不能直接使用foo和bar。
默认接口的写法如下。
```js
export { default } from 'foo';
```        
&#8195;&#8195;具名接口改为默认接口的写法如下。
```js
export { es6 as default } from './someModule';
// 等同于
import { es6 } from './someModule';
export default es6;
```
&#8195;&#8195;同样地，默认接口也可以改名为具名接口。
```js
export { default as es6 } from './someModule';
```
<h4>7、	模块的继承</h4>

```js
// circleplus.js
export * from 'circle';
export var e = 2.71828182846;
export default function(x) {
    return Math.exp(x);
}
```        
&#8195;&#8195;上面代码中的export*，表示再输出circle模块的所有属性和方法。**注意，export `*` 命令会忽略circle模块的default方法。**
```js
// main.js
import * as math from 'circleplus';//整体加载的写法
import exp from 'circleplus';
console.log(exp(math.e));
import exp 表示，将circleplus模块的默认方法加载为exp方法。
```       
<h4>8、	Import（）</h4>

&#8195;&#8195;可以实现动态加载。运行时执行，也就是说，什么时候运行到这一句，就会加载指定的模块。**import()返回一个 Promise 对象。** 

&#8195;&#8195;注意：import()加载模块成功以后，这个模块会作为一个对象，当作then方法的参数。因此，可以使用对象解构赋值的语法，获取输出接口。
```js
import('./myModule.js')
.then(({export1, export2}) => {
    // ...•
});
```       
&#8195;&#8195;上面代码中，export1和export2都是myModule.js的输出接口，可以解构获得。
如果模块有default输出接口，可以用参数直接获得。
```js
import('./myModule.js')
.then(myModule => {
    console.log(myModule.default);
});
```
&#8195;&#8195;上面的代码也可以使用具名输入的形式。
```js
import('./myModule.js')
.then(({default: theDefault}) => {
    console.log(theDefault);
});
```       
<h4>9、	module的加载实现</h4>

&#8195;&#8195;浏览器加载 ES6 模块，也使用script标签，但是要加入type="module"属性。
```js
<script type="module" src="./foo.js"></script>
<!-- 等同于 -->
<script type="module" src="./foo.js" defer></script>
```
&#8195;&#8195;**对于外部的模块脚本（上例是foo.js），有几点需要注意。**

&#8195;&#8195;1、	代码是在模块作用域之中运行，而不是在全局作用域运行。模块内部的顶层变量，外部不可见。  
&#8195;&#8195;2、	模块脚本自动采用严格模式，不管有没有声明use strict。    
&#8195;&#8195;3、   	模块之中，可以使用import命令加载其他模块（.js后缀不可省略，需要提供绝对 URL 或相对 URL），也可以使用export命令输出对外接口。       
&#8195;&#8195;4、   	模块之中，顶层的this关键字返回undefined，而不是指向window。也就是说，在模块顶层使用this关键字，是无意义的。  
&#8195;&#8195;5、	同一个模块如果加载多次，将只执行一次。  
&#8195;&#8195;利用顶层的this等于undefined这个语法点，可以侦测当前代码是否在 ES6 模块之中。
```js
const isNotModuleScript = this !== undefined;
```       
<h4>10、	 ES6 模块与 CommonJS 模块</h4>        
&#8195;&#8195; ES6 模块与 CommonJS 模块完全不同。
它们有两个重大差异。 

>1、CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。 

>2、	CommonJS 模块是运行时加载。 ES6 模块是编译时输出接口 。

&#8195;&#8195;第二个差异是因为 CommonJS 加载的**是一个对象（即module.exports属性）**，该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是**一种静态定义**，在代码静态解析阶段就会生成。  
&#8195;&#8195;第一个差异是因为CommonJS 模块输出的是**值的拷贝**，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。**ES6模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。**
```js
// lib.js
var counter = 3;
function incCounter() {
    counter++;
}
module.exports = {
    counter: counter,
    incCounter: incCounter,
};
// main.js
var mod = require('./lib');
console.log(mod.counter);  // 3
mod.incCounter();
console.log(mod.counter); // 3
```       
&#8195;&#8195;**这是因为mod.counter是一个原始类型的值 ，会被缓存**。除非写成一个函数，才能得到内部变动后的值。
```js
// lib.js
var counter = 3;
function incCounter() {
    counter++;
}
module.exports = {
    get counter() {
        return counter
    },  
    incCounter: incCounter,
};
// main.js
var mod = require('./lib');
console.log(mod.counter);  // 3
mod.incCounter();
console.log(mod.counter); // 4
```        
&#8195;&#8195;**可以对obj添加属性，但是重新赋值就会报错。** 因为变量obj指向的地址是只读的，不能重新赋值，这就好比main.js创造了一个名为obj的const变量。
```js
// lib.js
export let obj = {};
// main.js
import { obj } from './lib';
obj.prop = 123; // OK
obj = {}; // TypeError
```        
&#8195;&#8195;**commonJS和ES6内部变量的区别：**

&#8195;&#8195;1、ES6 模块之中，顶层的this指向undefined；CommonJS 模块的顶层this指向当前模块。    
&#8195;&#8195;2、以下这些顶层变量在 ES6 模块之中都是不存在的。

+	arguments
+	require
+	module
+	exports
+	__filename
+	__dirname

<h4>11、	ES6加载CommonJS模块（整体输入）</h4>

&#8195;&#8195;Node 会自动将module.exports属性，当作模块的默认输出，即等同于export default xxx。
```js
// a.js
module.exports = {
    foo: 'hello',
    bar: 'world'
};
// 等同于
export default {
    foo: 'hello',
    bar: 'world'
};
```
&#8195;&#8195;由于 ES6 模块是编译时确定输出接口，CommonJS 模块是运行时确定输出接口，所以采用import命令加载 CommonJS 模块时，不允许采用下面的写法。
```js
// 不正确
import { readFile } from 'fs';
```       
&#8195;&#8195;因为fs是 CommonJS格式，只有在运行时才能确定readFile接口，而import命令要求编译时就确定这个接口。**解决方法就是改为整体输入。**
```js
// 正确的写法一
import * as express from 'express';
const app = express.default();
// 正确的写法二
import express from 'express';
const app = express();
```       
<h4>12、	CommonJS加载ES6模块（import()函数）</h4>
&#8195;&#8195;CommonJS 模块加载 ES6 模块，**不能使用require命令，而要使用import()函数。ES6 模块的所有输出接口，会成为输入对象的属性。
<h4>13、	CommonJS 模块的加载原理。</h4>

&#8195;&#8195;require命令第一次加载该脚本，就会执行整个脚本，然后在内存生成一个对象。
```js
{
    id: '...',
    exports: { ... },
    loaded: true,
    ...
}
```
&#8195;&#8195;该对象的id属性是模块名，exports属性是模块输出的各个接口，loaded属性是一个布尔值，表示该模块的脚本是否执行完毕。其他还有很多属性，这里都省略了。以后需要用到这个模块的时候，就会到exports属性上面取值。即使再次执行require命令，也不会再次执行该模块，而是到缓存之中取值。**也就是说，CommonJS 模块无论加载多少次，都只会在第一次加载时运行一次，以后再加载，就返回第一次运行的结果，除非手动清除系统缓存。**

<h4>14、	CommonJS的循环加载</h4>

&#8195;&#8195;一旦出现某个模块被"循环加载"，就只输出已经执行的部分，还未执行的部分不会输出。
```js
//a.js
exports.done = false;
var b = require('./b.js');
console.log('在 a.js 之中，b.done = %j', b.done);
exports.done = true;
console.log('a.js 执行完毕');
//b.js
exports.done = false;
var a = require('./a.js');
console.log('在 b.js 之中，a.done = %j', a.done);
exports.done = true;
console.log('b.js 执行完毕');
//main.js
var a = require('./a.js');
var b = require('./b.js');
console.log('在 main.js 之中, a.done=%j, b.done=%j', a.done, b.done);
$ node main.js
```
执行结果如下：

![](https://user-gold-cdn.xitu.io/2019/4/13/16a172d64e1c8bd7?w=485&h=126&f=png&s=13654)

&#8195;&#8195;在main.js中的详细执行过程如下：

&#8195;&#8195;a.js脚本先输出一个done变量，然后加载另一个脚本文件b.js。**注意，此时a.js代码就停在这里，等待b.js执行完毕，再往下执行。** b.js执行到第二行，就会去加载a.js，这时，就发生了“循环加载”。系统会去a.js模块对应对象的exports属性取值，可是因为a.js还没有执行完，从exports属性只能取回已经执行的部分，而不是最后的值。（a.js已经执行的部分，只有一行。）然后，b.js接着往下执行，等到全部执行完毕，再把执行权交还给a.js。于是，a.js接着往下执行，直到执行完毕。
	
<h4>15、	ES6模块的循环加载</h4>

&#8195;&#8195;ES6 模块是动态引用，如果使用import从一个模块加载变量（即import foo from 'foo'），那些变量不会被缓存，而是成为一个指向被加载模块的引用
```js	
// a.mjs
import {bar} from './b';
console.log('a.mjs');
console.log(bar);
export let foo = 'foo';
//function foo() { return 'foo' }
//export {foo};
// b.mjs
import {foo} from './a';
console.log('b.mjs');
console.log(foo);
export let bar = 'bar';
//function bar() { return 'bar' }
//export {bar};

$ node --experimental-modules a.mjs
b.mjs
ReferenceError: foo is not defined
```
&#8195;&#8195;上述代码的详细执行过程如下：

&#8195;&#8195;首先，执行a.mjs以后，引擎发现它加载了b.mjs，因此会优先执行b.mjs，然后再执行a.mjs。接着，执行b.mjs的时候，已知它从a.mjs输入了foo接口，这时不会去执行a.mjs，而是认为这个接口已经存在了，继续往下执行。执行到第三行console.log(foo)的时候，才发现这个接口根本没定义，因此报错。这可以通过将foo写成函数来解决这个问题。
这是因为函数具有提升作用（提升到顶部），在执行import {bar} from './b'时，函数foo就已经有定义了，所以b.mjs加载的时候不会报错。这也意味着，如果把函数foo改写成函数表达式，也会报错。