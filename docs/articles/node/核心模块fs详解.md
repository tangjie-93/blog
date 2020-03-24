---
title: 核心模块fs详解
date: '2020-03-19'
type: 技术
tags: node
note: 核心模块fs详解
---
&#8195;&#8195;文件操作在服务器端开发中是必不可少的。`fs` 模块主要是用于操作文件的一个模块，提供了文件读取、写入、删除、遍历目录等文件系统操作。 `fs` 模块中所有的操作都提供了异步和同步的两个版本。后缀为 `sync` 的为同步方法，具有 `sync` 为异步方法。

### 1、文件的权限位 `mode`

&#8195;&#8195;权限参数 mode 主要针对 Linux 和 Unix 操作系统，Window 的权限默认是可读、可写、不可执行
<table border="1">
    <caption>文件权限表</caption>
	<tr>
	    <th>权限分配</th>
	    <th colspan="3">文件所有者</th>
	    <th colspan="3">文件所属组</th>  
        <th colspan="3">其他用户</th>
	</tr >
	<tr >
	    <td>权限项</td>
	    <td>读</td>
	    <td>写</td>
        <td>执行</td>
        <td>读</td>
	    <td>写</td>
        <td>执行</td>
        <td>读</td>
	    <td>写</td>
        <td>执行</td>
	</tr>
	<tr>
	    <td>字符表示</td>
	    <td>r</td>
        <td>w</td>
        <td>x</td>
        <td>r</td>
        <td>w</td>
        <td>x</td>
        <td>r</td>
        <td>w</td>
        <td>x</td>
	</tr>
	<tr>
	    <td>数字表示</td>
	    <td>4</td>
        <td>2</td>
        <td>1</td>
        <td>4</td>
        <td>2</td>
        <td>1</td>
        <td>4</td>
        <td>2</td>
        <td>1</td>
	</tr>
</table>

&#8195;&#8195;上方表格中，针对三种类型进行权限分配，及文件所有者（自己）、文件所属组（家人）和其他用户(陌生人)。文件操作权限又分为**读、写和执行**。数字是八进制数。具备权限的八进制分别为`4、2、1`,不具备权限为`0`。可以通过`linux`命令`ls -al`来查看文件和文件夹的权限为。
```bash
drwxr-xr-x 1 lenovo 197121     0 3月  19 14:40 ./
drwxr-xr-x 1 lenovo 197121     0 3月  17 18:07 ../
-rw-r--r-- 1 lenovo 197121  1826 3月  19 22:38 核心模块fs详解.md
-rw-r--r-- 1 lenovo 197121   117 3月  19 16:55 核心模块http详解.md
```
&#8195;&#8195;上面的目录信息中，可以看出用户名、创建时间和文件名等信息。
开头第一项（10位的字符）表示的就是权限位。第一位代表是文件还是文件夹， `d` 开头代表文件夹， `-` 开头的代表文件，而后面九位就代表当前用户、用户所属组和其他用户的权限位，按每三位划分，分别代表读（`r`）、写（`w`）和执行（`x`）， `-` 代表没有当前位对应的权限。

### 2、标识符 (`flag`) 

&#8195;&#8195;标识位代表着对文件的操作方式，如可读、可写、即可读又可写等。常见操作方式如下表所示：
| 符号 | 含义 
| :- | :-
r	 | 读取文件，如果文件不存在则抛出异常。
r+	| 读取并写入文件，如果文件不存在则抛出异常。
rs	| 读取并写入文件，指示操作系统绕开本地文件系统缓存。
w	| 写入文件，文件不存在会被创建，存在则清空后写入。
wx	| 写入文件，排它方式打开。
w+	| 读取并写入文件，文件不存在则创建文件，存在则清空后写入。
wx+	| 和 w+ 类似，排他方式打开。
a	| 追加写入，文件不存在则创建文件。
ax	|与 a 类似，排他方式打开。
a+	| 读取并追加写入，不存在则创建。
ax+	| 与 a+ 类似，排他方式打开。|

+ `r`  读取
+ `w` 写入
+ `s` 同步
+ `+` 增加相反操作
+ `x` 其他方式
> **注意** `r+` 和 `w+` 的区别，当文件不存在时，`r+` 不会创建文件，而会抛出异常，但 `w+` 会创建文件；如果文件存在，`r+` 不会自动清空文件，但 `w+` 会自动把已有文件的内容清空。
## 3、`fs` 模块中的文件操作方法
### 3.1 文件读取- `fs.readFile`
`fs.readFile(filename,[,options],[callback(error,data)]`    
`fs.readFileSync(filename[, options])`
+ `filename`表示读取的文件名或文件描述符。
+ `options <Object>|<String>` 是可选的。
    + `encoding <string> | <null>` 默认值: `null`。
    + `flag <string>` 参阅支持的文件系统标志。默认值: 'r'。
+  `callback`是回调函数，用于接收文件的内容。说明：如果不指定 `encoding` ，则 `callback` 就是第二个参数。回调函数提供两个参数 `err` 和 `data` ， `err` 表示有没有错误发生，`data` 是文件内容。如果指定 `encoding` ， `data` 是一个解析后的字符串，否则将会以 `Buffer` 形式表示的二进制数据。
```js
const fs = require("fs");
//异步读取文件，fs.readFile() 函数会缓冲整个文件。 为了最小化内存成本，尽可能通过 fs.createReadStream() 进行流式传输。
fs.readFile("./copy.js", "utf-8", (err, data) => {
    console.log(data);
})
//同步读取文件
const data=fs.readFile("./copy.js", "utf-8");
```
### 3.2 文件写入- `fs.writeFile`

`fs.writeFile(filename,data,[options],callback(err))`   
`fs.writeFileSync(file, data[, options])`
+ `filename`, 表示读取的文件名或文件描述符。
+ `data` , 要写的数据。
+ `options <Object>|<String>`。
    + `encoding <string> | <null>` 默认值: `'utf8'`。
    + `mode <integer>` 默认值: `0o666`。
    + `flag <string>` 参阅支持的文件系统标志。默认值: `'w'`。

 **注意：** 
> 1、当 `file` 是一个文件名时，异步地将数据写入到一个文件，如果文件已存在则覆盖该文件。 `data` 可以是字符串或 `buffer`。   

> 2、如果 `data` 是一个 `buffer`，则 `encoding` 选项会被忽略。

> 3、**在同一个文件上多次使用 `fs.writeFile()` 且不等待回调是不安全的。 对于这种情况，建议使用 `fs.createWriteStream()`。**

```js
fs.writeFile('./index.txt', "这是测试数据", (err) => {
    if (err) {
        throw err;
    }
    fs.readFile('./index.txt', "utf-8", (err, data) => {
        console.log(data);
    })
})
//同步写入数据
fs.writeFileSync('./index.txt', "这是测试数据");
```
### 3.3 文件追加- `fs.appendFile`

`fs.appendFile(path, data[, options], callback)`    
`fs.appendFileSync(path, data[, options])`
+   `path <string> | <Buffer> | <URL> | <number>` 文件名或文件描述符。
+   `data <string> | <Buffer>`
+   `options <Object> | <string>`
    + `encoding <string> | <null>` 默认值: 'utf8'。
    + `mode <integer>` 默认值: 0o666。
    + `flag <string>` 参阅支持的文件系统标志。默认值: 'a'。
+   `callback <Function>`
    + `err <Error>`
```js
fs.appendFile('message.txt', '追加的数据', (err) => {
  if (err) throw err;
  console.log('数据已追加到文件');
});
```
`path` 可以指定为已打开用于追加（使用 `fs.open()` 或 `fs.openSync()`）的数字型文件描述符。 文件描述符不会自动关闭。
```js
fs.open('message.txt', 'a', (err, fd) => {
  if (err) throw err;
  fs.appendFile(fd, '追加的数据', 'utf8', (err) => {
    fs.close(fd, (err) => {
      if (err) throw err;
    });
    if (err) throw err;
  });
});
```
### 3.3 获取文件信息=`fs.stat`
`fs.stat(path, callback)`
+ `path` - 文件路径。
+ `callback` - 回调函数，带有两个参数如：`(err, stats), stats` 是 `fs.Stats` 对象。

`stats`类中的方法有以下：
方法 |	描述
-- | --
stats.isFile() |	如果是文件返回 true，否则返回 false。
stats.isDirectory() |	如果是目录返回 true，否则返回 false。
stats.isBlockDevice()|	如果是块设备返回 true，否则返回 false。
stats.isCharacterDevice()|	如果是字符设备返回 true，否则返回 false。
stats.isSymbolicLink()|	如果是软链接返回 true，否则返回 false。
stats.isFIFO()|	如果是FIFO，返回true，否则返回 false。FIFO是UNIX中的一种特殊类型的命令管道。
stats.isSocket()|	如果是 Socket 返回 true，否则返回 false。

### 3.4 在特定文件中进行读写操作
> 1、打开文件——`fs.open(path,flags[,mode],callback(err,fd))`
+ path - 文件的路径。
+ flags - 文件打开的行为。具体值详见下文。
+ mode - 设置文件模式(权限)，文件创建默认权限为 0666(可读，可写)。
+ callback - 回调函数，带有两个参数如：callback(err, fd)。

> 2、读取文件——`fs.read(fd,buffer/string,offset,length,position,callback)` 该方法使用了文件描述符来读取文件。一般在`fs.open()方法里面运行`。
+ fd - 通过 `fs.open()`方法返回的文件描述符。
+ buffer - 数据写入的缓冲区。
+ offset - 缓冲区写入的写入偏移量。
+ length - 要从文件中读取的字节数。
+ position - 文件读取的起始位置，如果 `position` 的值为 `null`，则会从当前文件指针的位置读取。
+ callback - 回调函数，有三个参数`err, bytesRead, buffer，err` 为错误信，`bytesRead` 表示读取的字节数，`buffer` 为缓冲区对象。
> 3、写入文件 ——`fs.write(fd, buffer[, offset[, length[, position]]], callback)`
将 `string/buffer` 写入到 `fd` 指定的文件。 

> 4、关闭文件——`fs.close(fs,callback)`
+ fd - 通过 `fs.open()` 方法返回的文件描述符。
+ callback - 回调函数，没有参数。

> 5、截取文件——`fs.ftruncate(fd, len, callback)`
```js
var fs = require("fs");
var buf = new Buffer.alloc(1024);
console.log("准备打开已存在的文件！");
fs.open('./index.txt', 'r+', function(err, fd) {
   if (err) {
       return console.error(err);
   }
   // 截取文件
   fs.ftruncate(fd, 10, function(err){
      if (err){
         console.log(err);
      } 
      console.log("文件截取成功。");
      console.log("读取相同的文件"); 
      fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
         if (err){
            console.log(err);
         }

         // 仅输出读取的字节
         if(bytes > 0){
            console.log(buf.slice(0, bytes).toString());
         }

         // 关闭文件
         fs.close(fd, function(err){
            if (err){
               console.log(err);
            } 
            console.log("文件关闭成功！");
         });
      });
   });
});
```

### 3.5 删除文件-`fs.unlink`
`fs.unlink(filename,callback)`  
`fs.unlinkSync(path)`
+ `path <string> | <Buffer> | <URL>`
+ `callback <Function>`
    + `err <Error>`
```js
fs.unlink('./file.txt', (err) => {
  if (err) throw err;
  console.log('文件已删除');
});
```
### 3.6 目录操作
> 1、新建目录——`fs.mkdir(path[, options], callback)`
+ `path <string> | <Buffer> | <URL>`
+ `options <Object> | <integer>`
    + `recursive <boolean>`默认值: `false`。
    + `mode <string> | <integer> Windows` 上不支持。默认值: 0o777。
+ `callback <Function>`
    + `err <Error>`
> 2、删除目录——`fs.rmdir(path[, options], callback)`

> 3、打开目录——`fs.opendir()`

> 4、读取目录——`fs.readdir(path,[options],callback(err,data))`
```js
//读取当前文件所在文件夹的所有数据
fs.readdir("./",(err,data)=>{
    if(err) throw err;
    console.log(data)//data是当前文件夹的所有文件名称的集合
})
```
### 3.7 监听文件——`fs.watch()`
`fs.watch(filename[, options][, listener])`
+ `filename <string> | <Buffer> | <URL>`:`filename` 是文件或目录。
+ `options <string> | <Object>`
    + `persistent <boolean>` 指示如果文件已正被监视，进程是否应继续运行。默认值: `true`。
    + `recursive <boolean>` 指示应该监视所有子目录，还是仅监视当前目录。这适用于监视目录时，并且仅适用于受支持的平台（参阅注意事项）。默认值: `false`。
    + `encoding <string>` 指定用于传给监听器的文件名的字符编码。默认值: `'utf8'`。
+ `listener <Function> | <undefined>` 默认值: `undefined`。
    + `eventType <string>`:`eventType ` 是 `'rename' 或 'change'`
    + `filename <string> | <Buffer>`: 触发事件的文件的名称。
+ 返回: `<fs.FSWatcher>`
使用 `fs.watch()` 比 `fs.watchFile()` 和 `fs.unwatchFile()` 更高效。 成功调用 `fs.watch()` 方法将会返回一个新的 `fs.FSWatcher` 对象。继承了 `<EventEmitter>` 类。

```js
fs.copyFile("./fs.js", "copy-file.js", (err) => {
    if (err) throw err;
    console.log("拷贝成功")
})
fs.watch('./', (eventType, filename) => {
    console.log(eventType)
    if (filename) {
        console.log(`提供的文件名: ${filename.toString()}`);
    } else {
        console.log('文件名未提供');
    }
});
//输出
// change
// 提供的文件名: copy-file.js
// 拷贝成功
// change
// 提供的文件名: copy-file.js
```
### 3.8 拷贝文件——`fs.copyFile`
`fs.copyFile(src, dest[, flags], callback)`
+ `src <string> | <Buffer> | <URL>` 要拷贝的源文件名。
+ `dest <string> | <Buffer> | <URL>` 拷贝操作的目标文件名。
+ `flags <number>` 用于拷贝操作的修饰符。默认值: 0。
+ `callback <Function>`
```js
//文件拷贝
fs.copyFile("./fs.js", "copy-file.js", (err) => {
    if (err) throw err;
    console.log("拷贝成功")
})
```
也可以利用 `fs.createReadStream(filename)`和`fs.createWriteStream(process.argv[3])`来实现文件拷贝。
```js
var fs = require('fs');
console.log(process.argv[2], '->', process.argv[3]);

var readStream = fs.createReadStream(process.argv[2]);
var writeStream = fs.createWriteStream(process.argv[3]);
/* readStream.on('readable', function () {
    readStream.pipe(writeStream);
    console.log("读取数据");
}); */

readStream.on('data', function (data) {
    // readStream.pipe(writeStream);
    console.log("读取数据");
    writeStream.write(data);
});
//读取数据
/* readStream.on('open', function () {
  readStream.pipe(writeStream);
  console.log("读取数据");
}); */
readStream.on('end', function () {
    writeStream.end();
    console.log("读取完毕");
});
```