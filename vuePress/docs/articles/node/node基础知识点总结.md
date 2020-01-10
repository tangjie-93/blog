## **第一节  node概述**
&#8195;&#8195;Node为服务端JavaScript提供了一个事件驱动的、异步的平台。 专为数据密集型实时程序设计的。 node中的模块一旦被加载以后，就会被系统缓存。第二次加载该模块时，是从缓存中加载的。如果希望模块执行多次，则可以让函数返回一个函数，然后多次调用该函数。<br>

​		**node的优势?**
+ 1、对于文件读写，采用的是`非阻塞异步IO`（input、output）。
+ 2、传统IO在读写文件的时候采用CPU处理，代码执行也处于等待中，浪费性能。
+ 3、非阻塞IO将读写操作交给CPU，而代码正常执行，减少等待浪费的性能。
+ 4、事件驱动，用事件驱动来完成服务器的任务调度。
+ 5、跨平台 能够在linux和window平台上有运行。Node是基于`libuv`实现跨平台的。
**node的不足**
+ 1、无法利用多核cpu<br>
    **解决方案**
    + 1、pm2、nodemon等工具都可以实现创建多进程解决多核cpu的利用率问题。
    + 2、在v0.8之前，实现多进程可以使用`child_process`。
    + 3、在v0.8之后，可以使用cluster模块，创建多个工作进程来解决多核CPU的利用率问题。

+ 2、错误会引起整个应用退出无法继续调用异步`I/O`<br>
    **解决方案**
    + 1、Nginx反向代理、负载均衡，开启多个进程，绑定多个端口。
    + 2、pm2、forever等进程管理工具可以实现进程监控，错误自动重启。
    + 3、开多个进程监听同一端口，使用node提供的`cluster`或者`child_process`模块。
    + 4、使用`try catch`,抓取错误。
+ 3、大量计算占用CPU导致无法继续调用异步`I/O`<br>
    **解决方案**
    + 1、将大量的密集计算拆分成多个子进程进行计算。
**应用场景：**
+ 1、实际应用：webpack、gulp、npm、http-server、json-server
+ 2、服务器中负责IO读写的中间层服务器。

**Node特点**
+ 1、移植了`chromeV8`引擎，解析和执行代码机制和浏览器js相同。
+ 2、沿用了js语法，另外扩展了自己需要的功能。
+ 3、nodejs是后台语言，其具备操作文件的能力，可以具备服务器的创建和操作能力。

**1、全局对象**

+ global: `Node所在的全局环境`。
+ process: `该对象表示Node所处的当前进程`.`process.env`是一个对象，可以通过其.属性名l来获取具体的环境变量。`proces.argv`获取命令行参数(`['node绝对路径'，'文件的绝对路径'，'参数1','参数2'，...]`)。
+ console: `输入输出标准`。

**2、全局变量**<br>

+ __filename: `指向当前运行的脚本文件名`。<br>
+ __dirname: `指向当前运行的脚本所在的目录`。



**3、核心模块**
+ http：提供http服务器功能。
+ url：解析url。
+ fs：文本系统交互。
+ querystring：解析URL的查询字符串。
+ child_process：新建子进程。
+ util：提供的一系列使用小工具。
+ path：处理文件路径。
+ crypto：提供加密和解密功能，基本上是对OpenSSL的包装。


**4、异常处理**

&#8195;&#8195;Node有三种方法来传递一个错误。
        1、使用throw语句来抛出一个错误对象。
        2、将错误对象传递给回调函数。
        3、通过EventEmitter接口，来发出一个事件。
+ 1、try...catch:
        无法捕获异步运行的代码抛出的错误。解决方法：将错误捕获代码，也放到异步执行。（如解析JSON.parse）
+ 2、回调函数

&#8195;&#8195;node采用的方法，是将错误对象作为第一个参数传入回调函数。这样能避免捕获代码与发生错误的代码不在同一个时间段的问题。
```javascript
    fs.readFile("/foo.txt",function(err,data){
        
    })
```
+ 3、EventEmitter接口的error事件
```javascript
    var EventEmitter = require('events').EventEmitter;
    var emitter = new EventEmitter();
    //触发error事件
    emitter.emit('error', new Error('something bad happened'));
    //监听error错误
    emitter.on('error', function(err) {
        console.error('出错：' + err.message);
    });
```
&#8195;&#8195;当一个异常违未被捕获，会触发uncaughtException事件。异常的上下文已经丢失，异常可能导致Node不能正常进行内存回收，出现内存泄露并记录错误日志，然后结束node进程。
```javascript
    var logger = require('tracer').console();
    process.on('uncaughtException', function(err) {
        logger.log(err);
        process.exit(1);
    });
```
+ 4、unhandledRejection事件
```javascript
    var promise = new Promise(function(resolve, reject) {
        reject(new Error("Broken."));
    });

    promise.then(function(result) {
        console.log(result);
    })

    //上面的错误抛出后不会有任何反应。通过监听unhandledRejection事件，就能解决这个问题。
    process.on('unhandledRejection', function (err, p) { //err是错误对象，p是产生错误的promise对象。
        console.error(err.stack);
    })
```
## 第二节  Node模块介绍
### **1、assert()**

&#8195;&#8195;主要用于断言。如果表达式不符合预期，就抛出一个错误。
```javascript
    assert()<br>
    assert.ok()<br>
    assert.equal()<br>
    assert.notEqual()<br>
    assert.deepEqual()<br>
    assert.notDeepEqual()<br>
    assert.strictEqual()<br>
    assert.notStrictEqual()<br>
    assert.throws()<br>
    assert.doesNotThrow()<br>
    assert.ifError()<br>
    assert.fail()<br>
```
### **2、Buffer**

&#8195;&#8195;Buffer对象是Node处理二进制数据(如TCP数据流)的一个接口。它是Node原生提供的全局对象，可以直接使用，不需要require('buffer')。它是一个构造函数，生成的实例代表了V8引擎分配的一段内存，是一个类似数组的对象，成员都为0到255的整数值，即一个8位的字节。

**&#8195;2.1、Buffer对象的直接赋值和取值**
```javascript
    // 生成一个256字节的Buffer实例
    var bytes = new Buffer(256);
    // 遍历每个字节，写入内容
    for (var i = 0; i < bytes.length; i++) {
        bytes[i] = i;
    }
    // 生成一个buffer的view
    // 从240字节到256字节
    var end = bytes.slice(240, 256);//slice方法创造原内存的一个视图
    end[0] // 240
    end[0] = 0;
    end[0] // 0
```
**&#8195;2.2、Buffer实例的拷贝生成**
```javascript
    var bytes = new Buffer(8);
    for (var i = 0; i < bytes.length; i++) {
        bytes[i] = i;
    }
    var more = new Buffer(4);
    bytes.copy(more, 0, 4, 8);
    more[0] // 4
    copy方法将bytes实例的4号成员到7号成员的这一段，都拷贝到了more实例从0号成员开始的区域。
```
**&#8195;2.3、Buffer构造函数**

&#8195;&#8195;用new命令生成一个实例，它可以接受多种形式的参数。
```javascript
    // 参数是整数，指定分配多少个字节内存
    var hello = new Buffer(5);

    // 参数是数组，数组成员必须是整数值
    var hello = new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    hello.toString() // 'Hello'

    // 参数是字符串（默认为utf8编码）
    var hello = new Buffer('Hello');
    hello.length // 5
    hello.toString() // "Hello"

    // 参数是字符串（不省略编码）
    var hello = new Buffer('Hello', 'utf8');

    // 参数是另一个Buffer实例，等同于拷贝后者
    var hello1 = new Buffer('Hello');
    var hello2 = new Buffer(hello1);  
```
**&#8195;2.4、Buffer类的方法**
```javascript
    Buffer.isEncoding()：返回一个布尔值，表示Buffer实例是否为指定编码。
    Buffer.isBuffer()：接受一个对象作为参数，返回一个布尔值，表示该对象是否为Buffer实例。
    Buffer.byteLength('Hello', 'utf8') // 5 返回字符串实际占据的字节长度，默认编码方式为utf8。
    Buffer.concat()//将一组Buffer对象合并为一个Buffer对象。
    var i1 = new Buffer('Hello');
    var i2 = new Buffer(' ');
    var i3 = new Buffer('World');
    Buffer.concat([i1, i2, i3], 10).toString()
    // 'Hello Worl'
    //如果Buffer.concat的参数数组只有一个成员，就直接返回该成员。如果有多个成员，就返回一个多个成员合并的新Buffer对象。Buffer.concat方法还可以接受第二个参数，指定合并后Buffer对象的总长度。
```
**&#8195;2.5、实例属性**

 &#8195; &#8195;length：返回Buffer对象所占据的内存长度。注意，这个值与Buffer对象的内容无关。
```javascript
    buf = new Buffer(1234);
    buf.length // 1234
    buf.write("some string", 0, "ascii");
    buf.length // 1234
```
**&#8195;2.6、实例方法**

&#8195;&#8195;write():可以向指定的Buffer对象写入数据。它的第一个参数是所写入的内容，第二个参数（可省略）是所写入的起始位置（默认从0开始），第三个参数（可省略）是编码方式，默认为utf8。<br>
&#8195;&#8195;slice():返回一个按照指定位置、从原对象切割出来的Buffer实例。它的两个参数分别为切割的起始位置和终止位置。<br>
&#8195;&#8195;toString()：将Buffer实例，按照指定编码（默认为utf8）转为字符串。toString方法可以只返回指定位置内存的内容，它的第二个参数表示起始位置，第三个参数表示终止位置，两者都是从0开始计算。
```javascript
    var buf = new Buffer('just some data');
    console.log(buf.toString('ascii', 5, 9));
    // "some"
```
&#8195;&#8195;toJSON():将Buffer实例转为JSON对象。如果JSON.stringify方法调用Buffer实例，默认会先调用toJSON方法。
```javascript
    var buf = new Buffer('test');
    var json = JSON.stringify(buf);
    json // '[116,101,115,116]'

    var copy = new Buffer(JSON.parse(json));
    copy // <Buffer 74 65 73 74>
```
### **3、Child Process模块**
&#8195;&#8195;child_process模块用于新建子进程。子进程的运行结果储存在系统缓存之中（最大200KB），等到子进程运行结束以后，主进程再用回调函数读取子进程的运行结果。<br>

**&#8195;3.1、主要方法**

+ 1、exec()

&#8195;&#8195;用于执行bash命令，它的参数是一个命令字符串。最多可以接受两个参数，第一个参数是所要执行的shell命令，第二个参数是回调函数，该函数接受三个参数，分别是发生的错误、标准输出的显示结果、标准错误的显示结果。exec方法会直接调用bash（/bin/sh程序）来解释命令，所以如果有用户输入的参数，exec方法是不安全的。
```javascript
    var exec = require('child_process').exec;
    var ls = exec('ls -l', function (error, stdout, stderr) {
    if (error) {
        console.log(error.stack);
        console.log('Error code: ' + error.code);
    }
    console.log('Child Process STDOUT: ' + stdout);
    });
    由于标准输出和标准错误都是流对象（stream），可以监听data事件，因此上面的代码也可以写成下面这样。
    //推荐写法
    var exec = require('child_process').exec;
    var child = exec('ls -l');

    child.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
    });
    child.stderr.on('data', function(data) {
    console.log('stdout: ' + data);
    });
    child.on('close', function(code) {
    console.log('closing code: ' + code);
    });
```
 + 2、execSync()

&#8195;&#8195;是exec的同步执行版本。它可以接受两个参数，第一个参数是所要执行的命令，第二个参数用来配置执行环境。
+ 3、execFile()

&#8195;&#8195;直接执行特定的程序，参数作为数组传入，不会被bash解释，因此具有较高的安全性。
```javascript
    var child_process = require('child_process');
    var path = ".";
    child_process.execFile('/bin/ls', ['-l', path], function (err, result) {
        console.log(result)
    });
```
+ 4、spawn()

&#8195;&#8195;创建一个子进程来执行特定命令，用法与execFile方法类似，但是没有回调函数，只能通过监听事件，来获取运行结果。它属于异步执行，适用于子进程长时间运行的情况。<br>
&#8195;&#8195;spawn方法接受两个参数，第一个是可执行文件，第二个是参数数组。<br>
&#8195;&#8195;spawn对象返回一个对象，代表子进程。该对象部署了EventEmitter接口，它的data事件可以监听，从而得到子进程的输出结果。<br>
&#8195;&#8195;spawn方法与exec方法非常类似，只是使用格式略有区别。
```javascript
    child_process.exec(command, [options], callback)
    child_process.spawn(command, [args], [options])

    var child_process = require('child_process');
    var path = '.';
    var ls = child_process.spawn('/bin/ls', ['-l', path]);
    ls.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    ls.on('close', function (code) {
        console.log('child process exited with code ' + code);
    });
```
+ 5、fork()

&#8195;&#8195;直接创建一个子进程，执行Node脚本，fork('./child.js') 相当于 spawn('node', ['./child.js']) 。与spawn方法不同的是，fork会在父进程与子进程之间，建立一个通信管道，用于进程之间的通信。<br>
&#8195;&#8195;fork方法返回一个代表进程间通信管道的对象，对该对象可以监听message事件，用来获取子进程返回的信息，也可以向子进程发送信息。
```javascript
    var n = child_process.fork('./child.js');
    n.on('message', function(m) {
        console.log('PARENT got message:', m);
    });
    n.send({ hello: 'world' });
    //child.js
    process.on('message', function(m) {
        console.log('CHILD got message:', m);
    });
    process.send({ foo: 'bar' });
```
+ 6、send()

&#8195;&#8195;使用 child_process.fork() 生成新进程之后，就可以用 child.send(message, [sendHandle]) 向新进程发送消息。新进程中通过监听message事件，来获取消息。
    
### **4、cluster**
&#8195;&#8195;集群模块允许设立一个主进程和若干个工人进程，由主进程监控和协调工人进程的运行。worker之间采用进程间通信交换消息，集群模块内置一个负载均衡器，采用循环赛算法协调各个工人进程之间的负载运行。所有新建立的链接都由主进程完成，然后主进程再把TCP连接分配给指定的工人进程。

**&#8195;4.1、worker对象**

&#8195;&#8195;是cluster.fork()的返回值，代表一个worker进程。有如下属性：

&#8195;&#8195;1、workid：是cluster.workers中指向当前进程的索引值。<br>
&#8195;&#8195;2、worker.process：所有的worker进程都是用child_process.fork()生成的。child_process.fork()返回的对象，被保存在work.process之中。通过这个属性，可以获取worker所在的进程对象。<br>
&#8195;&#8195;3、work.send()：用于在主进程中，向子进程发送信息。
```javascript
    if (cluster.isMaster) {
        var worker = cluster.fork();
            worker.send('hi there');
        } else if (cluster.isWorker) {
        //监听主进程的消息。
        process.on('message', function(msg) {
            process.send(msg);//
        });
    }
```
**&#8195;4.2、cluster.workers对象**

&#8195;&#8195;只有主进程才有，包含了所有worker进程。每个成员的键值就是一个worker进程对象，键名就是该worker进程的worker.id属性。

**&#8195;4.3、cluster模块的属性和方法**
+ 1、isWorker、isMaster

&#8195;&#8195;属性由process.env.NODE_UNIQUE_ID决定，如果process.env.NODE_UNIQUE_ID为未定义，就表示该进程是主进程。
+ 2、fork()

&#8195;&#8195;用于创建一个worker进程，上下文都是复制主进程。只有主进程才能调用这个方法。
+ 3、kill()

&#8195;&#8195;终止worker进程。如果当前是主进程，就会终止与worker.process的联络，然后将系统信号法发向worker进程。如果当前是worker进程，就会终止与主进程的通信，然后退出，返回0。
+ 4、listening事件

&#8195;&#8195;worker进程调用listening方法以后，“listening”事件就传向该进程的服务器，然后传向主进程。

&#8195;&#8195;该事件的回调函数接受两个参数，一个是当前worker对象，另一个是地址对象，包含网址、端口、地址类型（IPv4、IPv6、Unix socket、UDP）等信息。这对于那些服务多个网址的Node应用程序非常有用。
```javascript
    cluster.on('listening', function (worker, address) {
        console.log("A worker is now connected to " + address.address + ":" + address.port);
    });
```

**&#8195;4.4、PM2**

&#8195;&#8195;PM2模块是cluster模块的一个包装层。它的作用是尽量将cluster模块抽象掉，让用户像使用单进程一样，部署多进程Node应用。

**&#8195;4.5、nodemon**
&#8195;&#8195;是一个node自动重启工具。通过`nodemon app.js`来启动程序。程序改变后，不用重启程序，直接刷新浏览器就可以看到更新的内容。 
### **5、Event**
&#8195;&#8195;Node 提供 Event Emitter 接口。通过事件，解决多状态异步操作的响应问题。events模块的EventEmitter是一个构造函数，可以用来生成事件发生器的实例emitter。
```javascript
    var EventEmitter = require('events').EventEmitter;
    var emitter = new EventEmitter();
    //然后，事件发生器的实例方法on用来监听事件，实例方法emit用来发出事件。EventEmitter对象的事件触发和监听是同步的，即只有事件的回调函数执行以后，函数f才会继续执行。
    emitter.on('someEvent', function () {
        console.log('event has occured');
    });

    function f() {
        console.log('start');
        emitter.emit('someEvent');
        console.log('end');
    }

    f()
    // start
    // event has occured
    // end
```
&#8195; **1、Event Emitter 接口的部署**

&#8195;&#8195;Event Emitter 接口可以部署在任意对象上，使得这些对象也能订阅和发布消息。
```javascript
    var EventEmitter = require('events').EventEmitter;
    function Dog(name) {
        this.name = name;
    }
    Dog.prototype.__proto__ = EventEmitter.prototype;
    // 另一种写法
    // Dog.prototype = Object.create(EventEmitter.prototype);
    var simon = new Dog('simon');
    simon.on('bark', function () {
    console.log(this.name + ' barked');
    });
    setInterval(function () {
    simon.emit('bark');
    }, 500);
    //使ratio继承EventEmitter
    util.inherits(Radio, EventEmitter);
```
**&#8195;2、Event Emitter 的实例方法**
```javascript
    emitter.on(name, f):对事件name指定监听函数f。

    emitter.addListener(name, f):addListener是on方法的别名。
    emitter.once(name, f):与on方法类似，但是监听函数f是一次性的，使用后自动移除。
    emitter.listeners(name):返回一个数组，成员是事件name所有监听函数
    emitter.removeListener(name, f):移除事件name的监听函数f
    emitter.removeAllListeners(name):移除事件name的所有监听函数
```
+ 2.1、emit()

&#8195;&#8195;EventEmitter实例对象的emit方法，用来触发事件。它的第一个参数是事件名称，其余参数都会依次传入回调函数。
```javascript
    var EventEmitter = require('events').EventEmitter;
    var myEmitter = new EventEmitter();
    var connection = function (id) {
    console.log('client id: ' + id);
    };
    myEmitter.on('connection', connection);
    myEmitter.emit('connection', 6);
    // client id: 6
```
+ 2.2、once()

&#8195;&#8195;该方法类似于on方法，但是回调函数只触发一次。该方法返回一个EventEmitter对象，因此可以链式加载监听函数。 
+ 2.3、removeListener()

&#8195;&#8195;该方法用于移除回调函数。它接受两个参数，第一个是事件名称，第二个是回调函数名称。这就是说，不能用于移除匿名函数。
+ 2.4、setMaxListeners()

&#8195;&#8195;Node默认允许同一个事件最多可以指定10个回调函数。
+ 2.5、removeAllListeners()

&#8195;&#8195;该方法用于移除某个事件的所有回调函数。

+ 2.6、listeners()

&#8195;&#8195;listeners方法接受一个事件名称作为参数，返回该事件所有回调函数组成的数组。
+ 2.7、事件捕获

&#8195;&#8195;事件处理过程中抛出的错误，可以使用try...catch捕获。监听函数抛出的错误被try...catch代码块捕获了。一旦被捕获，该事件后面的监听函数都不会再执行了。
&#8195;&#8195;如果不使用try...catch，可以让进程监听uncaughtException事件。     
+ 2.8、默认事件

&#8195;&#8195;Events模块默认支持两个事件。
            newListener事件：添加新的回调函数时触发。
            removeListener事件：移除回调时触发。

### **6、express**

&#8195;&#8195;Express是目前最流行的基于Node.js的Web开发框架，可以快速地搭建一个完整功能的网站。

**&#8195;1、运行原理**

+ **1.1、底层:http模块**

&#8195;&#8195;Express框架建立在node.js内置的http模块上。http模块生成服务器的原始代码如下。
```javascript
    var http = require("http");
    var app = http.createServer(function(request, response) {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("Hello world!");
    });
    app.listen(3000, "localhost");
    //Express框架的核心是对http模块的再包装。Express框架等于在http模块之上，加了一个中间层。
    var express = require('express');
    var app = express();
    app.get('/', function (req, res) {
    res.send('Hello world!');
    });
    app.listen(3000);
```
+ 1.2、中间件

&#8195;&#8195;中间件（middleware）就是处理HTTP请求的函数。它最大的特点就是，一个中间件处理完，再传递给下一个中间件。
&#8195;&#8195;每个中间件可以接收三个参数，依次为request对象（代表HTTP请求）、response对象（代表HTTP回应），next回调函数（代表下一个中间件）。每个中间件都可以对HTTP请求（request对象）进行加工，并且决定是否调用next方法，将request对象再传给下一个中间件。中间件可以分为:

+ 1)应用中间件
+ 2)路由中间件
```javascript
    使用步骤：
    1、获取路由中间件对象 `let router=express.Router()`。
    2、配置路由规则  `router.请求方式(url,(req,res,next)=>{})`。
    3、将router加入到应用 `app.use(router)`
```

+ 3)内置中间件
+ 4)第三方中间件
```javascript
    const body-parser=require(" body-parser")
    app.use(body-parser())

```

+ 5)错误处理中间件

&#8195;&#8195;一个不进行任何操作、只传递request对象的中间件，就是下面这样。
```javascript
    function uselessMiddleware(req, res, next) {
        next();
    }
```
+ 1.3、use()

&#8195;&#8195;`use是express注册中间件的方法，它返回一个函数`。
```javascript
    var express = require("express");
    var http = require("http");
    var app = express();
    app.use(function(request, response, next) {
        console.log("In comes a " + request.method + " to " + request.url);
        next();
    });
    app.use(function(request, response) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("Hello world!\n");
    });
    http.createServer(app).listen(1337);
    //上面代码使用app.use方法，注册了两个中间件。收到HTTP请求后，先调用第一个中间件，在控制台输出一行信息，然后通过next方法，将执行权传给第二个中间件，输出HTTP回应。由于第二个中间件没有调用next方法，所以request对象就不再向后传递了。

    1)use方法内部可以对访问路径进行判断，据此就能实现简单的路由，根据不同的请求网址，返回不同的网页内容。

    var express = require("express");
    var http = require("http");
    var app = express();
    app.use(function(request, response, next) {
        if (request.url == "/") {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end("Welcome to the homepage!\n");
        } else {
            next();
        }
    });
     2)use方法也允许将请求网址写在第一个参数。这代表，只有请求路径匹配这个参数，后面的中间件才会生效。
    app.use('/path', someMiddleware);
```
**&#8195;2、Express的方法**
+ 2.1、all方法和HTTP动词方法

&#8195;&#8195;针对不同的请求，Express提供了use方法的一些别名。比如，上面代码也可以用别名的形式来写。
```javascript
    var express = require("express");
    var http = require("http");
    var app = express();
    //所有请求都必须通过该中间件，参数中的“*”表示对所有路径有效。主要是拦截404
    app.all("*", function(request, response, next) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        next();
    });
    //除了get方法以外，Express还提供post、put、delete方法，即HTTP动词都是Express的方法。
    app.get("/", function(request, response) {
        response.end("Welcome to the homepage!");
    });
    app.get("/about", function(request, response) {
        response.end("Welcome to the about page!");
    });
    app.get("*", function(request, response) {
        response.end("404!");
    });
    http.createServer(app).listen(1337);
    //这些方法的第一个参数，都是请求的路径。除了绝对匹配以外，Express允许模式匹配。
    app.get("/hello/:who", function(req, res) {
        res.end("Hello, " + req.params.who + ".");
        //res.end()只能响应string||读文件中的data Buffer
    });
    // 匹配/commits/71dbb9c
    // 或/commits/71dbb9c..4c084f9这样的git格式的网址
    app.get(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function(req, res){
        var from = req.params[0];
        var to = req.params[1] || 'HEAD';
        //默认是utf-8
        res.send('commit range ' + from + '..' + to);
    });
```
 + 2.2、set()
 ```javascript
    set方法用于指定变量的值。
    app.set("views", __dirname + "/views");
    app.set("view engine", "jade");
    //使用get()方法获取
    app.get("views");
 ```
+ 2.3、response对象<br>

    1）Response.Redirect方法<br>
        Response.Redirect的方法允许网址的重定向。<br>

    2)response.sendFile方法<br>
        response.sendFile方法用于发送文件。<br>

    3)response.render方法<br>
         response.render方法用于渲染网页模板。

    4)response.end方法<br>
         response.end方法用于将数据返回给客户端。

    5)response.json<br>
         response.json方法用于将接送数据返回给客户端。

    6)response.jsonp<br>
         response.jsonp方法用于跨域。

    7)response.download<br>
         response.download方法用于将下载。

    8)response.setHeader("a","234");<br>
          用于写头。

    9)response.write("a","234");<br>
         response.write方法用于将数据返回给客户端。
```javascript
   
    app.get("/", function(request, response) {
        response.render("index", { message: "Hello World" });
    });
```
+ 2.4、request对象<br>
    1）request.ip:
        request.ip属性用于获得HTTP请求的IP地址。<br>
    2）request.files:
        request.files用于获取上传的文件。

**&#8195;3、配置路由**

&#8195;&#8195;所谓“路由”，就是指为不同的访问路径，指定不同的处理方法。
+ 3.1、指定根路径
```javascript
    app.get('/', function(req, res) {
        res.send('Hello World');//send方法，表示向浏览器发送一个字符串
    });
    //回调函数的req参数表示客户端发来的HTTP请求，res参数代表发向客户端的HTTP回应，这两个参数都是对象。
    //如果需要指定HTTP头信息，回调函数就必须换一种写法，要使用setHeader方法与end方法。
    app.get('/', function(req, res){
        var body = 'Hello World';
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });
```
+ 3.2、指定特定路径
```javascript
    app.get('/api', function(request, response) {
        response.send({name:"张三",age:40});
        //res.json(200, {name:"张三",age:40});
    });
```
+ 3.3、静态网页模板

&#8195;&#8195;sendfile()专门用于发送文件。
            在项目目录之中，建立一个子目录views，用于存放网页模板。
```javascript
    var express = require('express');
    var app = express();
    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/views/index.html');
    });
    app.get('/about', (req, res) => {
        res.sendFile(__dirname + '/views/about.html');
    });
    app.get('/article', (req, res) => {
        res.sendFile(__dirname + '/views/article.html');
    });
    app.listen(3000);
```
+ 3.4、动态网页模板

```javascript
    //安装模板引擎
    npm install hbs --save-dev
    //使用模板引擎
    //render方法的参数就是模板的文件名，默认放在子目录views之中，后缀名已经在前面指定为html，
    app.set('view engine', 'html');
    app.engine('html', hbs.__express);
    //中间件
    app.use(express.bodyParser());
    app.get('/', function(req, res) {
        res.render('index',{title:"最近文章", entries:blogEngine.getBlogEntries()});
    });
    app.get('/about', function(req, res) {
        res.render('about', {title:"自我介绍"});
    });

    app.get('/article/:id', function(req, res) {
        var entry = blogEngine.getBlogEntry(req.params.id);
        res.render('article',{title:entry.title, blog:entry});
    });
```
+ 3.5、指定静态文件目录
```javascript
    app.use(express.static('public'));
    //使用public指代public目录下的文件
    app.use("public",express.static('public'));
```
**&#8195;4、Express.Router用法**

+ 4.1、基本用法

&#8195;&#8195;Express.Router是一个构造函数，调用后返回一个路由器实例。然后，使用该实例的HTTP动词方法，为不同的访问路径，指定回调函数；最后，挂载到某个路径。
```javascript
    var router = express.Router();
    //为不同的路径，指定回调函数
    router.get('/', function(req, res) {
        res.send('首页');
    });

    router.get('/about', function(req, res) {
        res.send('关于');
    });
    //将路由挂载到某个路径
    app.use('/app', router);
```
+ 4.2、router.route方法

&#8195;&#8195;router实例对象的route方法，可以接受访问路径作为参数。
```javascript
    var router = express.Router();
    router.route('/api')
        .post(function(req, res) {
            // ...
        })
        .get(function(req, res) {
            Bear.find(function(err, bears) {
                if (err) res.send(err);
                res.json(bears);
            });
        });

    app.use('/', router);
```
+ 4.3、router中间件

&#8195;&#8195;use方法为router对象指定中间件，即在数据正式发给用户之前，对数据进行处理。下面就是一个中间件的例子。
```javascript
    router.use(function(req, res, next) {
        console.log(req.method, req.url);
        next();
    });
    //函数体中的next()，表示将数据传递给下一个中间件。
    //注意，中间件的放置顺序很重要，等同于执行顺序。而且，中间件必须放在HTTP动词方法之前，否则不会执行。
```
+ 4.4、对路径参数的处理

&#8195;&#8195;router对象的param方法用于路径参数的处理
```javascript
    router.param('name', function(req, res, next, name) {
        // 对name进行验证或其他处理……
        console.log(name);
        req.name = name;
        next();
    });

    router.get('/hello/:name', function(req, res) {
        res.send('hello ' + req.name + '!');
    });
    注意，param方法必须放在HTTP动词方法之前。
```
+ 4.5、app.route

&#8195;&#8195;app.route实际上是express.Router()的缩写形式，除了直接挂载到根路径。因此，对同一个路径指定get和post方法的回调函数，可以写成链式形式。
```javascript
    app.route('/login')
    .get(function(req, res) {
        res.send('this is the login form');
    })
    .post(function(req, res) {
        console.log('processing');
        res.send('processing the login form!');
    });
```
### **7、koa**

&#8195;&#8195;Koa是一个类似于Express的Web开发框架，创始人也是同一个人。它的主要特点是，使用了ES6的Generator函数，进行了架构的重新设计。也就是说，Koa的原理和内部结构很像Express，但是语法和内部结构进行了升级。

**&#8195;1、一个Koa应用就是一个对象，包含了一个middleware数组，这个数组由一组Generator函数组成**。这些函数负责对HTTP请求进行各种加工，比如生成缓存、指定代理、请求重定向等等。
```javascript
    var koa = require('koa');
    var app = koa();
    app.use(function *(){
        this.body = 'Hello World';
    });
    app.listen(3000);
    //app.use方法用于向middleware数组添加Generator函数。
    listen方法指定监听端口，并启动当前应用。
```
**&#8195;2、中间件**

&#8195;&#8195;是对HTTP请求进行处理的函数，但是必须是一个Generator函数。而且，Koa的中间件是一个级联式（Cascading）的结构，也就是说，属于是层层调用，第一个中间件调用第二个中间件，第二个调用第三个，以此类推。上游的中间件必须等到下游的中间件返回结果，才会继续执行，这点很像递归。
        中间件通过当前应用的use方法注册。
        多个中间件的合并。
```javascript
        function *random(next) {
            if ('/random' == this.path) {
                this.body = Math.floor(Math.random()*10);
            } else {
                yield next;
            }
        };

        function *backwards(next) {
            if ('/backwards' == this.path) {
                this.body = 'sdrawkcab';
            } else {
                yield next;
            }
        }

        function *pi(next) {
            if ('/pi' == this.path) {
                this.body = String(Math.PI);
            } else {
                yield next;
            }
        }

        function *all(next) {
            yield random.call(this, backwards.call(this, pi.call(this, next)));
        }

        app.use(all);
```
**&#8195;3、路由**

+ 1、可以通过this.path属性，判断用户请求的路径，从而起到路由作用。
```javascript
    let koa = require('koa')
    let app = koa()
    // normal route
    app.use(function* (next) {
        if (this.path !== '/') {
            return yield next
        }
        this.body = 'hello world'
    });
```
+ 2、复杂的路由需要安装`koa-router`插件。
```javascript
    var app = require('koa')();
    var Router = require('koa-router');
    var myRouter = new Router();
        myRouter.get('/', function *(next) {
        this.response.body = 'Hello World!';
    });
    app.use(myRouter.routes());
    app.listen(3000);
```
+ 3、Koa-router实例提供一系列动词方法，即一种HTTP动词对应一种方法。
```javascript
    1)router.get()
    2)router.post()
    3)router.put()
    4)router.del()
    5)router.patch()
```
+ 4、有些路径模式比较复杂，Koa-router允许为路径模式起别名。起名时，别名要添加为动词方法的第一个参数，这时动词方法变成接受三个参数。
```javascript
    router.get('user', '/users/:id', function *(next) {
    // ...
    });
    上面代码中，路径模式\users\:id的名字就是user。
```
+ 5、Koa-router允许为路径统一添加前缀。
```javascript
    var router = new Router({
        prefix: '/users'
    });
    router.get('/', ...); // 等同于"/users"
    router.get('/:id', ...); // 等同于"/users/:id"
```
+ 6、路径的参数通过this.params属性获取，该属性返回一个对象，所有路径参数都是该对象的成员。

```javascript
    // 访问 /programming/how-to-node
    router.get('/:category/:title', function *(next) {
        console.log(this.params);
        // => { category: 'programming', title: 'how-to-node' }
    });
```
+ 7、param方法可以针对命名参数，设置验证条件。
```javascript
    router.get('/users/:user', function *(next) {
        this.body = this.user;
    }).param('user', function *(id, next) {
        var users = [ '0号用户', '1号用户', '2号用户'];
        this.user = users[id];
        if (!this.user) return this.status = 404;
        yield next;
    })
```
+ **8、redirect** 方法会将某个路径的请求，重定向到另一个路径，并返回301状态码。
```javascript
    router.redirect('/login', 'sign-in');
    // 等同于
    router.all('/login', function *() {
        this.redirect('/sign-in');
        this.status = 301;
    });
```
+ **9、context对象**

&#8195;&#8195;`中间件当中的this表示上下文对象context，代表一次HTTP请求和回应，即一次访问/回应的所有信息，都可以从上下文对象获得。context对象封装了request和response对象，并且提供了一些辅助方法。每次HTTP请求，就会创建一个新的context对象。`
```javascript
    context对象的全局属性。
        request：指向Request对象
        
        response：指向Response对象
            1、response.set(key,val);//设置响应头
            2、response.status=200;//设置状态码
            3、response.body="cee";//响应体
            //context也可以直接使用respanse以及request的api
            1、ctx.set(key,value);
            2、ctx.status=200;
            3、ctx.body="cee"

        req：指向Node的request对象
        res：指向Node的response对象
        app：指向App对象
        state：用于在中间件传递信息。
    context对象的全局方法。
        throw()：抛出错误，直接决定了HTTP回应的状态码。
        assert()：如果一个表达式为false，则抛出一个错误。
```
**&#8195;4、Koa提供内置的错误处理机制，任何中间件抛出的错误都会被捕捉到，引发向客户端返回一个500错误，而不会导致进程停止，因此也就不需要forever这样的模块重启进程。**

        this.throw方法的两个参数，一个是错误码，另一个是报错信息。如果省略状态码，默认是500错误。
        this.assert方法用于在中间件之中断言，用法类似于Node的assert模块。
**&#8195;5、cookie**
```javascript
    this.cookies.get('view');
    this.cookies.set('view', n);
    get和set方法都可以接受第三个参数，表示配置参数。其中的signed参数，用于指定cookie是否加密。如果指定加密的话，必须用app.keys指定加密短语。
    this.cookie的配置对象的属性如下。
        signed：cookie是否加密。
        expires：cookie何时过期
        path：cookie的路径，默认是“/”。
        domain：cookie的域名。
        secure：cookie是否只有https请求下才发送。
        httpOnly：是否只有服务器可以取到cookie，默认为true。
```
**&#8195;6、Request对象**     
**&#8195;7、Response对象**


### **8、path模块**
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
### **9、os模块**

&#8195;&#8195;os模块提供与操作系统相关的方法。

**&#8195;9.1、os.EOL**

&#8195;&#8195;该属性是一个常量，返回当前操作系统的换行符（Windows系统是\r\n，其他系统是\n）

**&#8195;9.2、os.arch()**

&#8195;&#8195;os.arch方法返回当前计算机的架构。
```javascript
    require(`os`).arch()
    // "x64"
```
**&#8195;9.3、os.tmpdir()**

&#8195;&#8195;os.tmpdir方法返回操作系统默认的临时文件目录。

### **10、process对象**
&#8195;&#8195;process对象是 Node 的一个全局对象，提供当前 Node 进程的信息。它可以在脚本的任意位置使用，不必通过require命令加载。该对象部署了EventEmitter接口。

**&#8195;10.1、属性**
+ 1、process.argv：返回一个数组，成员是当前进程的所有命令行参数。
+ 2、process.env：返回一个对象，成员为当前Shell的环境变量，比如process.env.HOME。
+ 3、process.installPrefix：返回一个字符串，表示 Node 安装路径的前缀，比如/usr/local。相应地，Node 的执行文件目录为/usr/local/bin/node。
+ 4、process.pid：返回一个数字，表示当前进程的进程号。
+ 5、process.platform：返回一个字符串，表示当前的操作系统，比如Linux。
+ 6、process.title：返回一个字符串，默认值为node，可以自定义该值。
+ 7、process.version：返回一个字符串，表示当前使用的 Node 版本，比如v7.10.0。

**&#8195;10.2、process对象还有一些属性，用来指向 Shell 提供的接口**。

+ **1、process.stdout**

&#8195;&#8195;返回一个对象，表示标准输出。该对象的write方法等同于console.log，可用在标准输出向用户显示内容。
```javascript
    console.log = function(d) {
        process.stdout.write(d + '\n');
    };
```
+ **2、process.stdin**

&#8195;&#8195;返回一个对象，表示标准输入。
```javascript
    process.stdin.pipe(process.stdout)//将标准输入导向标准输出。
    //stdin和stdout都部署了stream接口，所以可以使用stream接口的方法。
    process.stdin.setEncoding('utf8');

    process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        process.stdout.write('data: ' + chunk);
    }
    });

    process.stdin.on('end', function() {
    process.stdout.write('end');
    });
```
+ **3、stderr**

&#8195;&#8195;process.stderr属性指向标准错误。

+ **4、process.argv，process.execPath，process.execArgv**
+ 1）process.argv属性返回一个数组，由命令行执行脚本时的各个参数组成。它的第一个成员总是node，第二个成员是脚本文件名，其余成员是脚本文件的参数。
```javascript
    //node.js
    console.log("argv: ", process.argv);
    var myArgs = process.argv.slice(2);
    console.log(myArgs);
    //在git bash中运行
    $ node argv.js a b c
    [ 'node', '/path/to/argv.js', 'a', 'b', 'c' ]
```
+ 2）process.execPath属性返回执行当前脚本的Node二进制文件的绝对路径。
+ 3）process.execArgv属性返回一个数组，成员是命令行下执行脚本时，在 Node 可执行文件与脚本文件之间的命令行参数。

+ **5、process.env**

&#8195;&#8195;process.env属性返回一个对象，包含了当前Shell的所有环境变量。比如，process.env.HOME返回用户的主目录。
&#8195;&#8195;通常的做法是，新建一个环境变量NODE_ENV，用它确定当前所处的开发阶段，生产阶段设为production，开发阶段设为develop或staging，然后在脚本中读取process.env.NODE_ENV即可。
&#8195;&#8195;运行脚本时，改变环境变量，可以采用下面的写法。
```javascript
    $ export NODE_ENV=production && node app.js
    # 或者
    $ NODE_ENV=production node app.js
```
**&#8195;10.3、方法**
```javascript
    process.chdir()：切换工作目录到指定目录。
    process.cwd()：返回运行当前脚本的工作目录的路径（绝对路径）。
    process.exit()：立刻退出当前进程。
    process.getgid()：返回当前进程的组ID（数值）。
    process.getuid()：返回当前进程的用户ID（数值）。
    process.nextTick()：指定回调函数在当前执行栈的尾部、下一次Event Loop之前执行。
    process.on()：监听事件。
    process.setgid()：指定当前进程的组，可以使用数字ID，也可以使用字符串ID。
    process.setuid()：指定当前进程的用户，可以使用数字ID，也可以使用字符串ID。
```
+ **1、process.cwd()与__dirname的区别。**

&#8195;&#8195;前者进程发起时的位置，后者是脚本的位置，两者可能是不一致的。比如，node ./code/program.js，对于process.cwd()来说，返回的是当前目录（.）；对于__dirname来说，返回是脚本所在目录，即./code/program.js。

+ **2、process.nextTick()**

&#8195;&#8195;process.nextTick将任务放到当前一轮事件循环（Event Loop）的尾部。
```javascript
    process.nextTick(function () {
        console.log('下一次Event Loop即将开始!');
    });
    //上面代码可以用setTimeout(f,0)改写，效果接近，但是原理不同。
    setTimeout(f,0)是将任务放到下一轮事件循环的头部，因此nextTick会比它先执行。另外，nextTick的效率更高，因为不用检查是否到了指定时间。
```
+ **3、process.exit()**

&#8195;&#8195;process.exit方法用来退出当前进程。它可以接受一个数值参数，如果参数大于0，表示执行失败；如果等于0表示执行成功。
```javascript
    if (err) {
        process.exit(1);
    } else {
        process.exit(0);
    }
    //如果不带有参数，exit方法的参数默认为0。
    更安全的方法是使用exitcode属性，指定退出状态，然后再抛出一个错误。
    process.exitCode = 1;
    throw new Error("xx condition failed");
```
+ **4、process.on()**

&#8195;&#8195;process对象部署了EventEmitter接口，可以使用on方法监听各种事件，并指定回调函数。

&#8195;&#8195;process支持的事件还有下面这些。
+ 1）uncaughtException：当前进程抛出一个没有被捕捉的错误时，会触发uncaughtException事件。。
+ 2）data事件：数据输出输入时触发
+ 3）SIGINT事件：接收到系统信号SIGINT时触发，主要是用户按Ctrl + c时触发。
+ 4）SIGTERM事件：系统发出进程终止信号SIGTERM时触发
+ 5）exit事件：进程退出前触发

+ **5、process.kill()**

&#8195;&#8195;process.kill方法用来对指定ID的线程发送信号，默认为SIGINT信号。

&#8195;&#8195;process.kill(process.pid, 'SIGTERM');
            上面代码用于杀死当前进程。

+ **6、beforeExit事件**

&#8195;&#8195;beforeExit事件在Node清空了Event Loop以后，再没有任何待处理的任务时触发。正常情况下，如果没有任何待处理的任务，Node进程会自动退出，设置beforeExit事件的监听函数以后，就可以提供一个机会，再部署一些任务，使得Node进程不退出。<br>
&#8195;&#8195;beforeExit事件与exit事件的主要区别是，beforeExit的监听函数可以部署异步任务，而exit不行。

+ **7、信号事件**

&#8195;&#8195;主要对SIGTERM和SIGINT信号部署监听函数，这两个信号在非Windows平台会导致进程退出，但是只要部署了监听函数，Node进程收到信号后就不会退出。
+ **8、进程的退出码**
```javascript
    0，正常退出
    1，发生未捕获错误
    5，V8执行错误
    8，不正确的参数
    128 + 信号值，如果Node接受到退出信号（比如SIGKILL或SIGHUP），它的退出码就是128加上信号值。由于128的二进制形式是10000000, 所以退出码的后七位就是信号值。
```
### **11、url**
&#8195;&#8195;url模块用于生成和解析URL。该模块使用前，必须加载。

**&#8195;11.1、url.resolve(from, to)**
```javascript
    url.resolve方法用于生成URL。它的第一个参数是基准URL，其余参数依次根据基准URL，生成对应的位置。
    url.resolve('/one/two/three', 'four')
    // '/one/two/four'
    url.resolve('http://example.com/', '/one')
    // 'http://example.com/one'

    url.resolve('http://example.com/one/', 'two')
    // 'http://example.com/one/two'

    url.resolve('http://example.com/one', '/two')
    // 'http://example.com/two'
```
### **12、querystring**
&#8195;&#8195;querystring模块主要用来解析查询字符串。

**&#8195;1、querystring.parse()**

&#8195;&#8195;用于将一个查询字符串解析为 JavaScript 对象。
```javascript
    parse方法一共可以接受四个参数。
    str：需要解析的查询字符串
    sep：多个键值对之间的分隔符，默认为&
    eq：键名与键值之间的分隔符，默认为=
    options：配置对象，它有两个属性，decodeURIComponent属性是一个函数，用来将编码后的字符串还原，默认是querystring.unescape()，maxKeys属性指定最多解析多少个属性，默认是1000，如果设为0就表示不限制属性的最大数量。
parse方法也可以用来解析一般的字符串。
    var str = 'name:Sophie;shape:fox;condition:new';
    querystring.parse(str, ';', ':')
    // {
    //   name: 'Sophie',
    //   shape: 'fox',
    //   condition: 'new',
    // }
```
### **13、stream**
**&#8195;1、概念**

&#8195;&#8195;"数据流"（stream）是处理系统缓存的一种方式。操作系统采用数据块（chunk）的方式读取数据，每收到一次数据，就存入缓存。Node应用程序有两种缓存的处理方式，第一种是等到所有数据接收完毕，一次性从缓存读取，这就是传统的读取文件的方式；第二种是采用"数据流"的方式，收到一块数据，就读取一块，即在数据还没有接收完成时，就开始处理它。<br>
&#8195;&#8195;第一种方式先将数据全部读入内存，然后处理，优点是符合直觉，流程非常自然，缺点是如果遇到大文件，要花很长时间，才能进入数据处理的步骤。第二种方式每次只读入数据的一小块，像"流水"一样，每当系统读入了一小块数据，就会触发一个事件，发出"新数据块"的信号。应用程序只要监听这个事件，就能掌握数据读取的进展，做出相应处理，这样就提高了程序的性能。

&#8195;&#8195;**数据流接口最大特点就是通过事件通信**，具有readable、writable、drain、data、end、close等事件，既可以读取数据，也可以写入数据。读写数据时，每读入（或写入）一段数据，就会触发一次data事件，全部读取（或写入）完毕，触发end事件。如果发生错误，则触发error事件。

**&#8195;2、可读数据流**

&#8195;&#8195;"可读数据流"用来产生数据。它表示数据的来源，只要一个对象提供"可读数据流"，就表示你可以从其中读取数据。
```javascript
    var Readable = require('stream').Readable;
    var rs = new Readable();
    rs.push('beep ');
    rs.push('boop\n');
    rs.push(null);
    //rs.push(null)中的null，用来告诉rs，数据输入完毕。
    rs.pipe(process.stdout);
```
&#8195;&#8195;"可读数据流"有两种状态：**流动态和暂停态**。处于流动态时，数据会尽快地从数据源导向用户的程序；处于暂停态时，必须显式调用stream.read()等指令，"可读数据流"才会释放数据。刚刚新建的时候，"可读数据流"处于暂停态。

&#8195;&#8195;三种方法可以让暂停态转为流动态。
+ 1、添加data事件的监听函数
+ 2、调用resume方法
+ 3、调用pipe方法将数据送往一个可写数据流。

&#8195;&#8195;如果转为流动态时，没有data事件的监听函数，也没有pipe方法的目的地，那么数据将遗失。

&#8195;&#8195;以下两种方法可以让流动态转为暂停态。
+ 1、不存在pipe方法的目的地时，调用pause方法
+ 2、存在pipe方法的目的地时，移除所有data事件的监听函数，并且调用unpipe方法，移除所有pipe方法的目的地。

&#8195;&#8195;注意，只移除data事件的监听函数，并不会自动引发数据流进入"暂停态"。另外，存在pipe方法的目的地时，调用pause方法，并不能保证数据流总是处于暂停态，一旦那些目的地发出数据请求，数据流有可能会继续提供数据。每当系统有新的数据，该接口可以监听到data事件，从而回调函数。
```javascript
    var fs = require('fs');
    var readableStream = fs.createReadStream('file.txt');
    var data = '';

    readableStream.setEncoding('utf8');

    readableStream.on('data', function(chunk) {
        data+=chunk;
    });

    readableStream.on('end', function() {
        console.log(data);
    });
```
&#8195;&#8195;监听readable事件，也可以读到数据。
```javascript
    var fs = require('fs');
    var readableStream = fs.createReadStream('file.txt');
    var data = '';
    var chunk;
    readableStream.setEncoding('utf8');
    readableStream.on('readable', function() {
        while ((chunk=readableStream.read()) !== null) {
            data += chunk;
        }
    });

    readableStream.on('end', function() {
        console.log(data)
    });
```
&#8195;&#8195;readable事件表示系统缓冲之中有可读的数据，使用read方法去读出数据。如果没有数据可读，read方法会返回null。
&#8195;&#8195;"可读数据流"除了read方法，还有以下方法。
+ 1、Readable.pause() ：暂停数据流。已经存在的数据，也不再触发data事件，数据将保留在缓存之中，此时的数据流称为静态数据流。如果对静态数据流再次调用pause方法，数据流将重新开始流动，但是缓存中现有的数据，不会再触发data事件。
+ 2、Readable.resume()：恢复暂停的数据流。
+ 3、readable.unpipe()：从管道中移除目的地数据流。如果该方法使用时带有参数，会阻止“可读数据流”进入某个特定的目的地数据流。如果使用时不带有参数，则会移除所有的目的地数据流。

+ **2、1 readable 属性**

&#8195;&#8195;一个数据流的readable属性返回一个布尔值。如果数据流是一个仍然打开的可读数据流，就返回true，否则返回false。

+ **2、2 read()**

&#8195;&#8195;read方法从系统缓存读取并返回数据。如果读不到数据，则返回null。该方法可以接受一个整数作为参数，表示所要读取数据的数量，然后会返回该数量的数据。如果读不到足够数量的数据，返回null。如果不提供这个参数，默认返回系统缓存之中的所有数据。
```javascript
    var readable = getReadableStreamSomehow();
    readable.on('readable', function() {
        var chunk;
        while (null !== (chunk = readable.read())) {
            console.log('got %d bytes of data', chunk.length);
        }
    });
    //如果该方法返回一个数据块，那么它就触发了data事件。
```
+ **2、3 _read()**

&#8195;&#8195;可读数据流的_read方法，可以将数据放入可读数据流。
```javascript
    var Readable = require('stream').Readable;
    var rs = Readable();
    var c = 97;
    rs._read = function () {
        rs.push(String.fromCharCode(c++));
        if (c > 'z'.charCodeAt(0)) 
        rs.push(null);
    };
    rs.pipe(process.stdout);
```
+ **2、4 setEncoding()**

&#8195;&#8195;调用该方法，会使得数据流返回指定编码的字符串，而不是缓存之中的二进制对象。比如，调用setEncoding('utf8')，数据流会返回UTF-8字符串。

+ **2、5 resume()**

&#8195;&#8195;resume方法会使得“可读数据流”继续释放data事件，即转为流动态。

+ **2、6 pause()**

&#8195;&#8195;pause方法使得流动态的数据流，停止释放data事件，转而进入暂停态。任何此时已经可以读到的数据，都将停留在系统缓存。

+ **2、7 isPaused()**

&#8195;&#8195;该方法返回一个布尔值，表示"可读数据流"被客户端手动暂停（即调用了pause方法），目前还没有调用resume方法。
```javascript
    var Readable = require('stream').Readable;
    var readable = Readable();

    readable.isPaused() // === false
    readable.pause()
    readable.isPaused() // === true
    readable.resume()
    readable.isPaused() // === false
```
+ **2、8 pipe()**

&#8195;&#8195;pipe方法是自动传送数据的机制，就像管道一样。它从"可读数据流"读出所有数据，将其写出到指定的目的地。整个过程是自动的。
```javascript
    src.pipe(dst)
    //pipe方法必须在可读数据流上调用，它的参数必须是可写数据流。
    var fs = require('fs');
    var readableStream = fs.createReadStream('node.md');
    var writableStream = fs.createWriteStream('file2.doc');
    readableStream.pipe(writableStream);
    //pipe方法返回目的地的数据流，因此可以使用链式写法，将多个数据流操作连在一起。
    a.pipe(b).pipe(c).pipe(d)
    // 等同于
    a.pipe(b);
    b.pipe(c);
    c.pipe(d);
    //当来源地的数据流读取完成，默认会调用目的地的end方法，就不再能够写入。对pipe方法传入第二个参数{ end: false }，可以让目的地的数据流保持打开。
    reader.pipe(writer, { end: false });
    reader.on('end', function() {
        writer.end('Goodbye\n');
    });
    //上面代码中，目的地数据流默认不会调用end方法，只能手动调用，因此“Goodbye”会被写入。
    //test.js
    process.stdin.pipe(process.stdout);
    node test.js //將在cmd中輸入什麼，就將輸出什麼
```
+ **2、9 unpipe()**

&#8195;&#8195;该方法移除pipe方法指定的数据流目的地。如果没有参数，则移除所有的pipe方法目的地。如果有参数，则移除该参数指定的目的地。如果没有匹配参数的目的地，则不会产生任何效果。
```javascript
    var fs = require('fs');
    var readable = fs.createReadStream('file.txt');
    var writable = fs.createWriteStream('file1.txt');
    readable.pipe(writable);
    setTimeout(function() {
        console.log('停止写入file.txt');
        readable.unpipe(writable);
        console.log('手动关闭file.txt的写入数据流');
        writable.end();
    }, 1000);
```
+ **2、10 事件**
+ 1)readable事件

&#8195;&#8195; readable事件在数据流能够向外提供数据时触发。
```javascript
    var readable = getReadableStreamSomehow();
    readable.on('readable', function() {
        // there is some data to read now
    });
    //将标准输入的数据读出。
    process.stdin.on('readable', function () {
        var buf = process.stdin.read();
        console.dir(buf);
    });
```
+ 2)data事件

&#8195;&#8195;对于那些没有显式暂停的数据流，添加data事件监听函数，会将数据流切换到流动态，尽快向外提供数据。
+ 3)end事件

&#8195;&#8195;无法再读取到数据时，会触发end事件。也就是说，只有当前数据被完全读取完，才会触发end事件，比如不停地调用read方法。
+ 4)close

&#8195;&#8195;数据源关闭时，close事件被触发。并不是所有的数据流都支持这个事件。

+ 5)error

&#8195;&#8195;当读取数据发生错误时，error事件被触发。

**&#8195;3、继承可读数据流接口**

&#8195;&#8195;可读数据流又分成两种，一种是 pull 模式，自己拉数据，就好像用吸管吸水，只有你吸了，水才会上来；另一种是 push 模式，数据自动推送给你，就好像水从水龙头自动涌出来。如果监听data事件，那么自动激活 push 模式；如果自己从数据流读取数据，那就是在使用 pull 模式。<br>
&#8195;&#8195;注意，**数据流新建以后，默认状态是暂停，只有指定了data事件的回调函数，或者调用了resume方法，数据才会开发发送。**
```javascript
    var fs = require('fs');
    var stream = fs.createReadStream('readme.txt');
    stream.setEncoding('utf8'); 
    stream.pause();
    //显式调用pause方法，会使得readable事件释放一个data事件，否则data监听无效
    var pulledData = '';
    var pushedData = '';
    stream.on('readable', function() {
    var chunk;
    while(chunk = stream.read()) {
            pulledData += chunk;
        }
    });

    stream.on('data', function(chunk) {
        pushedData += chunk;
    });  
```
**&#8195;4、可写数据流**

&#8195;&#8195;"可读数据流"用来对外释放数据，"可写数据流"则是用来接收数据。它允许你将数据写入某个目的地。它是数据写入的一种抽象，不同的数据目的地部署了这个接口以后，就可以用统一的方法写入。

&#8195;&#8195;以下是部署了可写数据流的一些场合。
```javascript
    1、客户端的http requests
    2、服务器的http responses
    3、fs write streams
    4、zlib streams
    5、crypto streams
    6、tcp sockets
    7、child process stdin
    8、process.stdout, process.stderr
```
&#8195;&#8195;部署"可写数据流"，必须继承stream.Writable，以及实现stream._write方法。下面是一个例子，数据库的写入接口部署“可写数据流”接口。
```javascript
    var Writable = require('stream').Writable;
    var util = require('util');

    module.exports = DatabaseWriteStream;

    function DatabaseWriteStream(options) {
        if (! (this instanceof DatabaseWriteStream))
            return new DatabaseWriteStream(options);
        if (! options) options = {};
            options.objectMode = true;
            Writable.call(this, options);
    }
    //继承
    util.inherits(DatabaseWriteStream, Writable);

    DatabaseWriteStream.prototype._write = function write(doc, encoding, callback) {
        insertIntoDatabase(JSON.stringify(doc), callback);
    };
```
&#8195;&#8195;下面是fs模块的可写数据流的例子。
```javascript
    var fs = require('fs');
    var readableStream = fs.createReadStream('file1.txt');
    var writableStream = fs.createWriteStream('file2.txt');
    readableStream.setEncoding('utf8');
    readableStream.on('data', function(chunk) {
        writableStream.write(chunk);
    });
```
+ **4.1、 writable属性**

&#8195;&#8195;writable属性返回一个布尔值。如果数据流仍然打开，并且可写，就返回true，否则返回false。

+ **4.2、 write()**

&#8195;&#8195;write方法用于向"可写数据流"写入数据。它接受两个参数，一个是写入的内容，可以是字符串，也可以是一个stream对象（比如可读数据流）或buffer对象（表示二进制数据），另一个是写入完成后的回调函数，它是可选的。
```javascript
    s.write(buffer);          // 写入二进制数据
    s.write(string, encoding) // 写入字符串，编码默认为utf-8  
```
&#8195;&#8195;write方法返回一个布尔值，表示本次数据是否处理完成。如果返回true，就表示可以写入新的数据了。如果等待写入的数据被缓存了，就返回false，表示此时不能立刻写入新的数据。不过，返回false的情况下，也可以继续传入新的数据等待写入。只是这时，新的数据不会真的写入，只会缓存在内存中。为了避免内存消耗，比较好的做法还是等待该方法返回true，然后再写入。

+ **4.3、 cork()，uncork()**

&#8195;&#8195;cork方法可以强制等待写入的数据进入缓存。当调用uncork方法或end方法时，缓存的数据就会吐出。

+ **4.4、 setDefaultEncoding()**

&#8195;&#8195;setDefaultEncoding方法用于将写入的数据编码成新的格式。它返回一个布尔值，表示编码是否成功，如果返回false就表示编码失败。

+ **4.5、end()**

&#8195;&#8195;end方法用于终止"可写数据流"。该方法可以接受三个参数，全部都是可选参数。第一个参数是最后所要写入的数据，可以是字符串，也可以是stream对象或buffer对象；第二个参数是写入编码；第三个参数是一个回调函数，finish事件发生时，会触发这个回调函数。
            调用end方法之后，再写入数据会报错。

+ **4.6、事件**
+ 1）drain事件

&#8195;&#8195;writable.write(chunk)返回false以后，当缓存数据全部写入完成，可以继续写入时，会触发drain事件，表示缓存空了。

+ 2） finish事件

&#8195;&#8195;调用end方法时，所有缓存的数据释放，触发finish事件。该事件的回调函数没有参数。
```javascript
    var fs=require("fs");
    var writer = fs.createWriteStream('example.txt');
    for (var i = 0; i < 100; i ++) {
        writer.write('hello, #' + i + '!\n');
    }
    writer.end('this is the end\n');
    writer.on('finish', function() {
    console.error('all writes are now complete.');
    });
```
+ 3） pip事件

&#8195;&#8195;"可读数据流"调用pipe方法，将可读数据流写入目的地时，触发该事件。该事件的回调函数，接受发出该事件的"可读数据流"对象作为参数。
```javascript
    var writer = getWritableStreamSomehow();
    var reader = getReadableStreamSomehow();
    writer.on('pipe', function(src) {
        console.error('something is piping into the writer');
        assert.equal(src, reader);
    });
    reader.pipe(writer);
```
+ 4)unpipe事件

&#8195;&#8195;"可读数据流"调用unpipe方法，将可写数据流移出写入目的地时，触发该事件。
该事件的回调函数，接受发出该事件的"可读数据流"对象作为参数。
+ 5)error事件

&#8195;&#8195;如果写入数据或pipe数据时发生错误，就会触发该事件。该事件的回调函数，接受一个Error对象作为参数。

+ **4.7、错误处理**
```javascript
    var http=require("http"); 
    var onFinished = require('on-finished')
    http.createServer(function (req, res) {
        // set the content headers
        fs.createReadStream('filename.txt')
        .on('error', onerror)
        .pipe(zlib.createGzip())
        .on('error', onerror)
        .pipe(res)

        function onerror(err) {
            console.error(err.stack)
        }
        onFinished(res, function () {
            // make sure the stream is always destroyed
            stream.destroy()
        })
    })  
```
### **14、Net模块和DNS模块**
&#8195;&#8195;net模块用于底层的网络通信。
    下面是一段简单的监听2000端口的代码。
```javascript
    var net = require('net');
    var server = net.createServer();
        server.listen(2000, function () { 
            console.log('Listening on port 2000'); 
        });
        server.on('connection', function (stream) {
            console.log('Accepting connection from', stream.remoteAddress);
            stream.on('data', function (data) { 
                stream.write(data); 
            });
            stream.on('end', function (data) { 
                console.log('Connection closed');
            });
    });
```
**&#8195;1、isIP()**

&#8195;&#8195;isIP方法用于判断某个字符串是否为IP地址。

**&#8195;2、DNS模块用于解析域名**

&#8195;&#8195;resolve4方法用于IPv4环境，resolve6方法用于IPv6环境，lookup方法在以上两种环境都可以使用，返回IP地址（address）和当前环境（IPv4或IPv6）
    
### **15、CommonJS规范**
**&#8195;1、概述**

&#8195;&#8195;Node 应用由模块组成，采用 CommonJS 模块规范。
        **每个文件就是一个模块，有自己的作用域。在一个文件里面定义的变量、函数、类，都是私有的，对其他文件不可见。**
        CommonJS规范规定，每个模块内部，**module变量代表当前模块**。这个变量是一个对象，它的exports属性（即module.exports）是对外的接口。加载某个模块，其实是加载该模块的module.exports属性。
```javascript
    var x = 5;
    var addX = function (value) {
    return value + x;
    };
    module.exports.x = x;
    module.exports.addX = addX;
```
        CommonJS模块的特点如下。
            1、所有代码都运行在模块作用域，不会污染全局作用域。
            2、模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。
            3、模块加载的顺序，按照其在代码中出现的顺序。
**&#8195;2、module对象**

&#8195;&#8195;Node内部提供一个Module构建函数。所有模块都是Module的实例。每个模块内部，都有一个module对象，代表当前模块。它有以下属性。
+ 1)module.id 模块的识别符，通常是带有绝对路径的模块文件名。
+ 2)module.filename 模块的文件名，带有绝对路径。
+ 3)module.loaded 返回一个布尔值，表示模块是否已经完成加载。
+ 4)module.parent 返回一个对象，表示调用该模块的模块。module.parent就是调用它的父模块。利用这一点，可以判断当前模块是否为入口脚本。
+ 5)module.children 返回一个数组，表示该模块要用到的其他模块。
+ 6)module.exports 表示模块对外输出的值。
  
+ **2、1 module.exports属性**

&#8195;&#8195;module.exports属性表示当前模块对外输出的接口，其他文件加载该模块，实际上就是读取module.exports变量。

+ **2、2 exports变量**

&#8195;&#8195;Node为每个模块提供一个exports变量，指向module.exports。这等同在每个模块头部，有一行这样的命令。
```javascript
    var exports = module.exports;
```
&#8195;&#8195;注意，**不能直接将exports变量指向一个值，因为这样等于切断了exports与module.exports的联系。**
            如果一个模块的对外接口，就是一个单一的值，不能使用exports输出，只能使用module.exports输出。
```javascript
    module.exports = function (x){ console.log(x);};
```
**&#8195;3、AMD规范与CommonJS规范的兼容性**

&#8195;&#8195;CommonJS规范加载模块是同步的，也就是说，只有加载完成，才能执行后面的操作。AMD规范则是非同步加载模块，允许指定回调函数。由于Node.js主要用于服务器编程，模块文件一般都已经存在于本地硬盘，所以加载起来比较快，不用考虑非同步加载的方式，所以CommonJS规范比较适用。但是，如果是浏览器环境，要从服务器端加载模块，这时就必须采用非同步模式，因此浏览器端一般采用AMD规范。
### **16、npm包管理器**
**&#8195;1、npm安装模块时，对应的版本可以加上各种限定，主要有以下几种：**
+ 1)指定版本：比如1.2.2，遵循“大版本.次要版本.小版本”的格式规定，安装时只安装指定版本。
+ 2)波浪号（tilde）+指定版本：比如~1.2.2，表示安装1.2.x的最新版本（不低于1.2.2），但是不安装1.3.x，也就是说安装时不改变大版本号和次要版本号。
+ 3)插入号（caret）+指定版本：比如ˆ1.2.2，表示安装1.x.x的最新版本（不低于1.2.2），但是不安装2.x.x，也就是说安装时不改变大版本号。需要注意的是，如果大版本号为0，则插入号的行为与波浪号相同，这是因为此时处于开发阶段，即使是次要版本号变动，也可能带来程序的不兼容。
+ 4)latest：安装最新版本。  

**&#8195;2、npm安装：**
```javascript
    $ npm install npm@latest -g
```
**&#8195;3、npm init**
```javascript
    npm init用来初始化生成一个新的package.json文件。
```
**&#8195;4、npm set**
```javascript
    npm set用来设置环境变量。
    $ npm set init-author-name 'Your name'
    $ npm set init-author-email 'Your email'
    $ npm set init-author-url 'http://yourdomain.com'
    $ npm set init-license 'MIT'
    
    $ npm set save-exact true
    上面命令设置加入模块时，package.json将记录模块的确切版本，而不是一个可选的版本范围。
```
**&#8195;5、npm config**
```javascript
    npm config set prefix $dir
    //上面的命令将指定的$dir目录，设为模块的全局安装目录。
    npm config set save-prefix ~
    //上面的命令使得npm install --save和npm install --save-dev安装新模块时，允许的版本范围从克拉符号（^）改成波浪号（~），即从允许小版本升级，变成只允许补丁包的升级。
    $ npm config set init.author.name $name
    $ npm config set init.author.email $email
    //上面命令指定使用npm init时，生成的package.json文件的字段默认值。
```
**&#8195;6、npm info**
```javascript
    //npm info命令可以查看每个模块的具体信息。比如，查看underscore模块的信息。
    npm info underscore
    //上面命令返回一个JavaScript对象，包含了underscore模块的详细信息。这个对象的每个成员，都可以直接从info命令查询。
    npm info underscore description
```
**&#8195;7、npm search**
```javascript
    npm search命令用于搜索npm仓库，它后面可以跟字符串，也可以跟正则表达式。
    npm search webpack
```
**&#8195;8、npm list**
```javascript
    npm list命令以树型结构列出当前项目安装的所有模块，以及它们依赖的模块。
    加上global参数，会列出全局安装的模块。
    npm list -global
```
**&#8195;9、npm install**
```javascript
    //npm install也支持直接输入Github代码库地址。
    $ npm install git://github.com/package/path.git
    $ npm install git://github.com/package/path.git#0.1.0
//如果你希望，一个模块不管是否安装过，npm 都要强制重新安装，可以使用-f或--force参数。
    $ npm install <packageName> --force
```
+ 1)install命令总是安装模块的最新版本，如果要安装模块的特定版本，可以在模块名后面加上@和版本号。

```javascript
    $ npm install sax@latest
    $ npm install sax@0.1.1
    $ npm install sax@">=0.1.0 <0.2.0"
```
+ 2)如果使用--save-exact参数，会在package.json文件指定安装模块的确切版本。
```javascript
    $ npm install readable-stream --save --save-exact
```
+ 3)npm install默认会安装dependencies字段和devDependencies字段中的所有模块，如果使用--production参数，可以只安装dependencies字段的模块。
```javascript
                $ npm install --production
                # 或者
                $ NODE_ENV=production npm install
```
**&#8195;10、npm run** 
+ 1)npm run命令会自动在环境变量$PATH添加node_modules/.bin目录，所以scripts字段里面调用命令时不用加上路径，这就避免了全局安装NPM模块。
+ 2)npm run如果不加任何参数，直接运行，会列出package.json里面所有可以执行的脚本命令。
```javascript
    "build": "npm run build-js && npm run build-css"
    //上面的写法是先运行npm run build-js，然后再运行npm run build-css，两个命令中间用&&连接。如果希望两个命令同时平行执行，它们中间可以用&连接。
```
&#8195;&#8195;1）参数
```javascript
    "scripts": {
        "test": "mocha test/"
    }
    //上面代码指定npm test，实际运行mocha test/。如果要通过npm test命令，将参数传到mocha，则参数之前要加上两个连词线。
    $ npm run test -- anothertest.js
    # 等同于
    $ mocha test/ anothertest.js
    //上面命令表示，mocha要运行所有test子目录的测试脚本，以及另外一个测试脚本anothertest.js。
    //npm run本身有一个参数-s，表示关闭npm本身的输出，只输出脚本产生的结果。
    // 输出npm命令头
    $ npm run test
    // 不输出npm命令头
    $ npm run -s test
```
&#8195;&#8195;2) npm-run-all
```javascript
    $ npm install npm-run-all --save-dev
    //继发执行
    $ npm-run-all build:html build:js
    //等同于
    $ npm run build:html && npm run build:js

    //并行执行
    $ npm-run-all --parallel watch:html watch:js
    //等同于
    $ npm run watch:html & npm run watch:js

    //混合执行
    $ npm-run-all clean lint --parallel watch:html watch:js
    //等同于
    $ npm-run-all clean lint
    $ npm-run-all --parallel watch:html watch:js

    //通配符
    $ npm-run-all --parallel watch:*
```
+ 3)start命令
&#8195;&#8195;如果start脚本没有配置，npm start命令默认执行下面的脚本，前提是模块的根目录存在一个server.js文件。
                $ node server.js
+ 4)dev脚本命令
&#8195;&#8195;规定开发阶段所要做的处理，比如构建网页资源。
+ 5)serve脚本命令用于启动服务。
```javascript
    "serve": "live-server dist/ --port=9090"
    //上面命令启动服务，用的是live-server模块，将服务启动在9090端口，展示dist子目录。

    live-server模块有三个功能。
        1)启动一个HTTP服务器，展示指定目录的index.html文件，通过该文件加载各种网络资源，这是file://协议做不到的。
        2)添加自动刷新功能。只要指定目录之中，文件有任何变化，它就会刷新页面。
        3)npm run serve命令执行以后，自动打开浏览器。
```
+ 6)pre- 和 post- 脚本

&#8195;&#8195; 以npm run lint为例，执行这条命令之前，npm会先查看有没有定义prelint和postlint两个钩子，如果有的话，就会先执行npm run prelint，然后执行npm run lint，最后执行npm run postlint。

**&#8195;11、内部变量**

&#8195;&#8195;scripts字段可以使用一些内部变量，主要是package.json的各种字段。
            比如，package.json的内容是{"name":"foo", "version":"1.2.5"}，那么变量npm_package_name的值是foo，变量npm_package_version的值是1.2.5。
```javascript
    {
    "scripts":{
        "bundle": "mkdir -p build/$npm_package_version/"
        }
    }
    //-p 确保目录名称存在，如果目录不存在的就新创建一个。
    //config字段也可以用于设置内部字段。
    "name": "fooproject",
    "config": {
        "reporter": "xunit"
    },
    "scripts": {
        "test": "mocha test/ --reporter $npm_package_config_reporter"
    }
```
+ 1)通配符
```javascript
    * 匹配0个或多个字符
    ? 匹配1个字符
    [...] 匹配某个范围的字符。如果该范围的第一个字符是!或^，则匹配不在该范围的字符。
    !(pattern|pattern|pattern) 匹配任何不符合给定的模式
    ?(pattern|pattern|pattern) 匹配0个或1个给定的模式
    +(pattern|pattern|pattern) 匹配1个或多个给定的模式
    *(a|b|c) 匹配0个或多个给定的模式
    @(pattern|pat*|pat?erN) 只匹配给定模式之一
    ** 如果出现在路径部分，表示0个或多个子目录。
```
**&#8195;12、npm link**

&#8195;&#8195;npm link就能起到这个作用，会自动建立这个符号链接。
```javascript 
    1、在模块目录（src/myModule）下运行npm link命令。
        npm link 
    //会在NPM的全局模块目录内，生成一个符号链接文件，该文件的名字就是package.json文件中指定的模块名。
    //这个时候，已经可以全局调用myModule模块了。但是，如果我们要让这个模块安装在项目内，还要进行下面的步骤。
    2、切换到项目目录，再次运行npm link命令，并指定模块名。
        npm link studynotes
    3、然后，就可以在你的项目中，加载该模块了。
        var myModule = require('studynotes');
    4、如果你的项目不再需要该模块，可以在项目目录内使用
    npm unlink命令，删除符号链接。
        npm unlink studynotes//删除固定模块的符号链接
        npm unlink 删除全局符号链接
```
**&#8195;13、npm bin**

&#8195;&#8195;npm bin命令显示相对于当前目录的，Node模块的可执行脚本所在的目录（即.bin目录）。

**&#8195;14、npm adduser**

&#8195;&#8195;npm adduser用于在npmjs.com注册一个用户。

**&#8195;15、npm publish**

&#8195;&#8195;npm publish用于将当前模块发布到npmjs.com。执行之前，需要向npmjs.com申请用户名。
```javascript
    $ npm adduser
```
&#8195;&#8195;如果已经注册过，就使用下面的命令登录。
```javascript
    $ npm login
```
&#8195;&#8195;登录以后，就可以使用npm publish命令发布。
```javascript
    $ npm publish
```
&#8195;&#8195;如果当前模块是一个beta版，比如1.3.1-beta.3，那么发布的时候需要使用tag参数，将其发布到指定标签，默认的发布标签是latest。
```javascript
    $ npm publish --tag beta
```
&#8195;&#8195;如果你的模块是用ES6写的，那么发布的时候，最好转成ES5。首先，需要安装Babel。
```javascript
    npm install --save-dev babel-cli@6 babel-preset-es2015@6
    "scripts": {
        "build": "babel source --presets babel-preset-es2015 --out-dir distribution",
        "prepublish": "npm run build"
    } 
```
&#8195;&#8195;运行上面的脚本，会将source目录里面的ES6源码文件，转为distribution目录里面的ES5源码文件。然后，在项目根目录下面创建两个文件.npmignore和.gitignore，分别写入以下内容。
```javascript
    // .npmignore
    source
    // .gitignore
    node_modules
    distribution 
```
**&#8195;16、npm deprecate**

&#8195;&#8195;废弃某个版本的模块。
```javascript
    $ npm deprecate my-thing@"< 0.2.3" "critical bug fixed in v0.2.3"
    //运行上面的命令以后，小于0.2.3版本的模块的package.json都会写入一行警告，用户安装这些版本时，这行警告就会在命令行显示。
```
**&#8195;17、npm owner**

&#8195;&#8195;模块的维护者可以发布新版本。npm owner命令用于管理模块的维护者。
```javascript
    //列出指定模块的维护者
    $ npm owner ls <package name>
    //新增维护者
    $ npm owner add <user> <package name>
    //删除维护者
    $ npm owner rm <user> <package name>
```
**&#8195;18、npm outdated**

&#8195;&#8195;npm outdated命令检查当前项目所依赖的模块，是否已经有新版本。
            它会输出当前版本（current version）、应当安装的版本（wanted version）和最新发布的版本（latest version）。


## **其他**

**nrm:镜像源管理工具工具** 
+ 1、nrm ls 查看当前镜像源列表。
+ 2、nrm add key value 添加镜像源 
+ 3、nrm use key 选择使用镜像源

**多文件上传——formidable**
```javascript
    const form=require("formidable")
```

