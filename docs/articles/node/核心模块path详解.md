---
title: 核心模块path详解
date: '2020-03-19'
type: 技术
tags: node
note: 核心模块path详解
---
## **8、path模块**
**&#8195;8.1、path.join()**

&#8195;&#8195;path.join方法用于`连接路径`。该方法的主要用途在于，会正确使用当前系统的路径分隔符，Unix系统是"/"，Windows系统是"\"。

**&#8195;8.2、path.resolve()**

&#8195;&#8195;path.resolve方法用于`将相对路径转为绝对路径`。它可以接受多个参数，依次表示所要进入的路径，直到将最后一个参数转为绝对路径。如果根据参数无法得到绝对路径，就以当前所在路径作为基准。除了根目录，该方法的返回值都不带尾部的斜杠。
```javascript
    // 格式
    path.resolve([from ...], to)
    // 实例
    path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile')
    //得到结果E:\tmp\subfile
    //上面代码的实例，执行效果类似下面的命令。
    $ cd foo/bar
    $ cd /tmp/file/
    $ cd ..
    $ cd a/../subfile
    $ pwd
```
**&#8195;8.3、accessSync()**
```javascript
    //accessSync方法用于同步读取一个路径。
    function exists(pth, mode) {
        try {
            fs.accessSync(pth, mode);
            return true;
        } catch (e) {
            return false;
        }
    }
```
**&#8195;8.4、path.relative()**

&#8195;&#8195;path.relative方法接受两个参数，这两个参数都应该是绝对路径。该方法返回第二个路径相对于第一个路径的那个相对路径。
```javascript
    path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')
    // '../../impl/bbb'
```
**&#8195;8.5、path.parse()**
```javascript
    //path.parse()方法可以返回路径各部分的信息。
    var myFilePath = '/someDir/someFile.json';
    path.parse(myFilePath).base
    // "someFile.json"
    path.parse(myFilePath).name
    // "someFile"
    path.parse(myFilePath).ext
    // ".json"
```