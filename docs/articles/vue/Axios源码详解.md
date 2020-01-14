> **Axios是前端使用的比较广泛的一个js库。以前一直是只知道使用，但是对于其内部实现一直不太了解，现在花点时间好好来研究源码，了解一下其中的实现过程**

​		对于使用过`Axios`的人应该都知道，它既可以作为函数使用，也可以作为一个对象使用。

> **作为函数使用**

```js
const axiosInstance=axios("/api/gatdata",options);//options是一个可选参数对象
axiosInstance.then(res=>{},err=>{})；
```

> **作为对象使用**

```js
const axiosInstance=axios.craete({options});
axiosInstance({url:"/api/getdata"}).then(res=>{},err=>{});//params是可选对象
```

​		我们看一下[axios](https://github.com/axios/axios)官方库里的`lib\axios.js`就可以知道。通过`module.exports=axios`导出的是一个**函数对象**。同时在该函数对象上添加了`Axios`和`create`属性。通过`axios.create()`方法返回一个函数对象。所以`axios()和axios.create()`实际上调用的是同一个函数——`createInstance()`。

接下里我们将从入口文件`axios\lib\axios.js`文件开始分析。	

### 1、入口文件——axios\lib\axios.js

​		文件地址为[axios](https://github.com/axios/axios/blob/master/lib/axios.js)，大家可以自行去 [github](https://github.com/axios/axios/)上看，也可以`clone`到本地仔细研究。

**1、创建`axios`实例——createInstance()**

```js
function createInstance(defaultConfig) {
  // 创建实例
  var context = new Axios(defaultConfig);
  // 返回 调用Axios.prototype.request，参数为context的新方法
  // instance是一个返回promise的新方法
  var instance = bind(Axios.prototype.request, context);
  // Copy axios.prototype to instance
  // 将 Axios.prototype添加到instance上面
  utils.extend(instance, Axios.prototype, context);
  // Copy context to instance
  utils.extend(instance, context);
  return instance;
}
```

​	该方法主要分为以下几步执行：

+ 第1步，创建一个`Axios`类的实例对象。

  ```js
  var context=new Axios(defaultConfig)
  ```
  
  + 第2步，调用`bind`方法，将`Axios.prototype.request`作为原函数，`Axios`实例对象作为`this`对象传入原函数，并返回一个新函数。后面会重点来讲述`Axios.prototype.request`函数。
  
  ```js
   var instance = bind(Axios.prototype.request, context);
  ```
  
+ 第3步，将`Axios.prototype`对象和`context`对象上的属性都添加到`instance上`。

  ```js
  //将Axios原型对象上的属性添加到instance实例对象上。添加`context`的目的是为了在调用`Axios.prototype`上面的方法时，保证方面里面的`this`对象指向`context`对象。
  utils.extend(instance, Axios.prototype, context);
  // 将context实例对象的私有属性(Axios自身的属性)添加到instance对象上。
  utils.extend(instance, context);
  ```

+ 第4步，返回`instance`实例对象。

**2、创建`axios`对象并导出该对象**

​		通过调用`createInstance`方法创建`axios`对象，并给该对象添加`Axios,create,canCel`等属性。并将`axios`对象以`es6(module.exports.default = axios;)`和`commonjs(module.exports = axios;)`的语法分别导出。

```js
// Create the default instance to be exported
var axios = createInstance(defaults);
// Expose Axios class to allow class inheritance
axios.Axios = Axios;
// Factory for creating new instances
// 工厂模式 创建新的实例 用户可以自定义一些参数
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};
// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');
// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');
//require("axios")
module.exports = axios;
// Allow use of default import syntax in TypeScript
// import axios from 'axios';
module.exports.default = axios;
```

### 2、创建`axios`实例的文件——axios\core\Axios.js

​		文件地址为[Axios](https://github.com/axios/axios/tree/master/lib/core/Axios.js)。接下来我们来看看`lib\core\Axios.js`文件里初始化`Axios`实例的过程。

**1、首先是Axios构造函数的定义**

  ```js
function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    };
}
  ```

**2、原型方法——Axios.prototype.request**

​		其实我们在创建`axios`实例过程中，最终调用的方法还是是`Axios.prototype.request`方法。接下来我们来好好看一下该方法的实现。

+ 第1步，先判断传入的配置文件是字符串还是其他类型(对象类型)。并将默认配置文件和传入的配置文件合并。

  ```js
  if (typeof config === 'string') {
      config = arguments[1] || {};
      config.url = arguments[0];
  } else {
      config = config || {};
  }
  // 合并配置
  config = mergeConfig(this.defaults, config);
  ```

+ 第2步，判断`axios`向后台请求数据的方式，并将请求方式都转换成小写。默认请求方式是`get`方式。

  ```js
  if (config.method) {
      config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
  } else {
      config.method = 'get';
  }
  ```

+ 第3步。这里面的核心方法是`dispatchRequest`，该方法是用于和后台交互用的，在下文会详细说明。

  + 首先新建一个数组（chain），用于存放`promise`实例的`then`方法。

  + 其次创建一个 `promise`实例，目的是为了能够链式处理请求拦截和响应拦截。

  + 然后遍历**请求拦截数组**，并将请求拦截`then`方法(包括`resolve方法和reject方法`) 添加到`chain`数组的最前面；遍历**响应拦截数组**，并将响应拦截`then`方法(包括`resolve方法和reject方法`) 添加到`chain`数组的最后面。

  + 最后使用`while`循环。首先对请求拦截的成功和失败情况进行处理。然后向后台请求数据。最后对响应数据进行预处理。

    ```js
    var chain = [dispatchRequest, undefined];
    var promise = Promise.resolve(config);
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        // 添加到数组最前面
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        // 添加到数组最后面
        chain.push(interceptor.fulfilled, interceptor.rejected);
    });
    
    while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
    }
    ```

+ 第4步，**将经过响应拦截后的`promise`实例返回**。通过调用`then`方法就能对后台返回的数据（在`this.interceptors.response.use`会先进行预处理）进行处理。这也就是为什么我们调用`axios()`和`axios.create()`方法返回的是一个`promise`实例对象了。


**3、原型方法——Axios.prototype.getUri**

​			处理传入的`params`，构造后台需要的`URl`。

```js
Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};
```

**4、原型方法——Axios.prototype.get/post**

​		这也就是为什么可以直接`axios.get()、axios.post()`等方法的原因。但其实本质上调用`get`和`post`方法时，调用的还是`request`方法。相当于给`request`方法设置了别名一样。

```js
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});
```

### 3、拦截器文件——lib\core\InterceptorManager.js

​		主要是通过在初始化`axios`时，调用以下代码来对请求和响应进行拦截处理的。文件地址为[InterceptorManager](https://github.com/axios/axios/blob/master/lib/core/InterceptorManager.js)。该拦截器在如下代码中才会起作用。

```js
const instance=axios.create();
//设置请求拦截
instance.interceptors.request.use(config=>{},err=>{})；
//设置响应拦截
instance.interceptors.response.use(res=>{},err=>{})；
```
 下面我们来看一下`InterceptorManager`类的实现过程。该类中主要有以下添加拦截（`use`）,取消拦截（`reject`）和

**1、原型方法——InterceptorManager.prototype.use**

​		该方法的主要作用是将拦截操作添加到数组中。并返回添加到数组中的索引值。

```js
// Add a new interceptor to the stack
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};
```

**2、原型方法——InterceptorManager.prototype.reject**

​		该方法的主要作用是将拦截操作从拦截数组中删除。将该拦截操作的索引值置空。

```js
//Remove an interceptor from the stack
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};
```

**3、原型方法——InterceptorManager.prototype.forEach**

​		遍历拦截数组，进行拦截操作。

```js
//Iterate over all the registered interceptors
InterceptorManager.prototype.forEach = function forEach(fn) {
utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};
```

### 4、后台请求操作文件——lib\core\dispatchRequest.js

​		该方法主要用于向后台请求数据。

+ 如果已经取消，则 `throw` 原因报错，使`Promise`走向`rejected`。
+ 确保 `config.header` 存在。
+ 利用用户设置的和默认的请求转换器转换数据。
+ 拍平 `config.header`。
+ 删除一些 `config.header`。
+ 返回适配器`adapter`（`Promise`实例）执行后 `then`执行后的 `Promise`实例。返回结果传递给响应拦截器处理。

该文件中的核心代码如下所示。

```js
// Dispatch a request to the server using the configured adapter.
module.exports = function dispatchRequest(config) {
  ...//为了更好的布局，将一些代码省略了
  var adapter = config.adapter || defaults.adapter;
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);
      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }
    return Promise.reject(reason);
  });
};
```

### 5、请求取消操作文件

​		取消操作的文件主要存在于`lib\cancel`文件夹。

**1、判断是否取消**

​		该文件地址为[isCancel](https://github.com/axios/axios/blob/master/lib/cancel/isCancel.js)，通过调用`axios.isCancel(new Cancel())`来决定是否取消操作。

```js
module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};
```

**2、在取消时给用户的提示信息**

​			该文件地址为[Cancel](https://github.com/axios/axios/blob/master/lib/cancel/Cancel.js)，在调动该函数时传递提示信息，并重写`toString`方法。

```js
function Cancel(message) {
  this.message = message;
}
Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};
Cancel.prototype.__CANCEL__ = true;
```

**3、取消操作的逻辑处理**

```js
var Cancel = require('./Cancel');
/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}
/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};
/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;//is a function
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};
```

<Valine></Valine>

