---
title: webpack常见优化手段
date: '2020-01-14'
type: 技术
tags: webpack
note: <该思维导图是根据`<<深入浅出webpack>>`章节大纲总结出来的。通过阅读这本书梳理webpack所包含的知识点，了解了webpack（版本为4.X）的相关配置，以及loader和plugin的原理以及编写。思维导图能够很形象的描述出各知识点之间的关系，同时也能加深知识点在我们心中的印象。画此思维导图的目的也是为了供以后自己复习用的。
---
<image src="../../images/webpack优化.png" alt="暂无图片">
### 4、常见优化手段
**4.1 开发环境下的优化**
+ 1、优化构建速度

&#8195;&#8195;&#8195;1)、缩小文件搜索范围(主要是对配置项中的module和resolve配置项进行优化)
```javascript
    module.exports={
        //1、优化module配置项中的查找范围
        module:{
            //1、忽略对部分没采用模块化的文件的递归解析处理，这样做的好处是能提高构建性能。
            noParse:/jQuery|ChartJS/,
            rules:[
                test: /\.js$/,
                use:["babel-loader"]
                include:path.resolve(__dirname, 'src'),//2、缩小搜索范围
            ]
        },
        //2、缩小resolve模块搜索范围
        resolve: {
            // 1、使用绝对路径指明第三方模块存放的位置，以减少搜索步骤
            // 其中 __dirname 表示当前工作目录，也就是项目根目录
            modules: [path.resolve(__dirname, 'node_modules')],
            //2、在明确第三方模块的入口文件描述字段时。可以只采用 main（单个字段） 字段作为入口文件描述字段，以减少搜索步骤。
            mainFields: ['main'],
            alias:{
                "@":"./src",//3、通过配置别名来跳过耗时的递归解析操作。
            }
            //4、这个列表越长，或者正确的后缀在越后面，就会造成尝试的次数越多
            extensions: ['.js', '.json']
        }, 
        
    }
```
&#8195;&#8195;&#8195;2)、使用动态链接库（DllPlugin）
```javascript
    //新建一个dll.config.js文件,跟平常的配置文件一样
    const DllPlugin = require('webpack/lib/DllPlugin');
    module.export={
        entry:{
            vender:["vue","axios","vue-router","vuex"]
        },
        output:{
            path:resolve(__dirname,"../src/static"),
            filename:"[name].js",
            library:"[name]_library"
        }
        plugins: [
            // 接入 DllPlugin
            new DllPlugin({
              // 动态链接库的全局变量名称，需要和 output.library 中保持一致
              // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
              // 例如 react.manifest.json 中就有 "name": "_dll_react"
              name: '_dll_[name]',
              // 描述动态链接库的 manifest.json 文件输出时的文件名称
              path: path.join(__dirname, 'dist', '[name].manifest.json'),
            }),
        ],
    }
    //在开发或生产环境配置文件中
    const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
    module.exports={
        ...
        plugins:[
            new DllReferencePlugin({
              // 描述 react 动态链接库的文件内容
              manifest: require('./dist/vender.manifest.json'),
            }),
        ]
    }
```
&#8195;&#8195;&#8195;3)、使用HappyPack（并行loader去转换代码）
```javascript
    //它把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程。
    const HappyPack = require('happypack');
    module.exports={
        module:{
            rules:[
                {
                    test: /\.js$/,
                    // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
                    use: ['happypack/loader?id=babel'],
                    // 排除 node_modules 目录下的文件，node_modules 目录下的文件都是采用的 ES5 语法，没必要再通过 Babel 去转换
                    exclude: /node_modules/,
                },{
                     // 把对 .css 文件的处理转交给 id 为 css 的 HappyPack 实例
                    test: /\.css$/,
                    use: ['happypack/loader?id=css'],
                }
            ]
        },
        plugins:[
            new HappyPack({
                // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
                id: 'babel',
                // 如何处理 .js 文件，用法和 Loader 配置中一样
                loaders: ['babel-loader?cacheDirectory'],
                // ... 其它配置项
            }),
            new HappyPack({
                // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
                id: 'css',
                // 如何处理 .js 文件，用法和 Loader 配置中一样
                loaders: ['css-loader'],
                // ... 其它配置项
            }),
            
        ]
    }
```
+ 2、优化用户体验

&#8195;&#8195;&#8195;1)、使用自动刷新
```javascript
    文件监听:在发现源码文件发生变化时，自动重新构建出新的输出文件。是 webpack 模块提供的。
    文件监听原理：Webpack 中监听一个文件发生变化的原理是定时的去获取这个文件的最后编辑时间，每次都存下最新的最后编辑时间，如果发现当前获取的和最后一次保存的最后编辑时间不一致，就认为该文件发生了变化。
    自动刷新的原理：webpack 模块负责监听文件，webpack-dev-server 模块则负责刷新浏览器。 在使用 webpack-dev-server 模块去启动 webpack 模块时，webpack 模块的监听模式默认会被开启。
    控制浏览器刷新有三种方法：
    1、借助浏览器扩展去通过浏览器提供的接口刷新，WebStorm IDE 的 LiveEdit 功能就是这样实现的。
    2、往要开发的网页中注入代理客户端代码，通过代理客户端去刷新整个页面。(DevServer默认采用的，为输出的每个chunk注入代理客户端，是通过inline属性来控制的。)
    3、把要开发的网页装进一个 iframe 中，通过刷新 iframe 去看到最新效果。
    module.exports = {
      // 只有在开启监听模式时，watchOptions 才有意义
      // 默认为 false，也就是不开启
      watch: true,
      // 监听模式运行时的参数
      // 在开启监听模式时，才有意义
      watchOptions: {
        // 不监听的文件或文件夹，支持正则匹配
        // 默认为空
        ignored: /node_modules/,
        // 监听到变化发生后会等300ms再去执行动作，防止文件更新太快导致重新编译频率太高
        // 默认为 300ms
        //值越大性能越好，因为这能降低重新构建的频率。
        aggregateTimeout: 300,
        // 判断文件是否发生变化是通过不停的去询问系统指定文件有没有变化实现的
        // 默认每隔1000毫秒询问一次
        //值越大越好，因为这能降低检查的频率。
        poll: 1000,
      }
    }
```
&#8195;&#8195;&#8195;2)、开启模块热加载
```javascript
    模块热加载原理:当一个源码发生变化时，只重新编译发生变化的模块，再用新输出的模块替换掉浏览器中对应的老模块。
    优点：
    1、实时预览反应更快，等待时间更短。
    2、不刷新浏览器，而且能保留当前网页的运行状态。
    module.exports={
        devServer:{
            hot:true,
        }
    }
    
    当子模块发生更新时，更新事件会一层层往上传递，直到有某层的文件接受了当前变化的模块，如果事件一直往上抛到最外层都没有文件接受它，就会直接刷新网页。
    优化模块热更新：在main.js中注入如下代码。
    if (module.hot) {
        module.hot.accept(['./AppComponent'], callback);
        //'./AppComponent':表示监听的模块；callback表示回调。
    }
    module.exports = {
      plugins: [
        // 显示出被替换模块的名称
        new NamedModulesPlugin(),
      ],
    };
    注意：
    1、关闭默认的 inline 模式手动注入代理客户端的优化方法不能用于在使用模块热替换的情况下。
    2、监听更少的文件，忽略掉 node_modules 目录下的文件。 
```

**4.2 生产环境下的优化**

+ 1、缩短首屏加载时间

&#8195;&#8195;&#8195;1)、区分环境<br>
&#8195;&#8195;&#8195;2)、压缩代码
```javascript
    1、这里压缩的是ES6代码。
    const UglifyESPlugin = require('uglifyjs-webpack-plugin')
    module.exports = {
      plugins: [
        new UglifyESPlugin({
          // 多嵌套了一层，用于压缩ES6代码
          uglifyOptions: {
            compress: {
              // 在UglifyJs删除没有用到的代码时不输出警告
              warnings: false,
              // 删除所有的 `console` 语句，可以兼容ie浏览器
              drop_console: true,
              // 内嵌定义了但是只用到一次的变量
              collapse_vars: true,
              // 提取出出现多次但是没有定义成变量去引用的静态值
              reduce_vars: true,
            },
            output: {
              // 最紧凑的输出
              beautify: false,
              // 删除所有的注释
              comments: false,
            }
          }
        })
      ]
    }
    2、压缩css代码
    const path = require('path');
    const ExtractTextPlugin = require('extract-text-webpack-plugin');
    module.exports = {
      module: {
        rules: [
          {
            test: /\.css$/,// 增加对 CSS 文件的支持
            // 提取出 Chunk 中的 CSS 代码到单独的文件中
            use: ExtractTextPlugin.extract({
              // 通过 minimize 选项压缩 CSS 代码
              use: ['css-loader?minimize']
            }),
          },
        ]
      },
      plugins: [
        new ExtractTextPlugin({
          filename: `[name]_[contenthash:8].css`,// 给输出的 CSS 文件名称加上 Hash 值
        }),
      ],
    };
```
&#8195;&#8195;&#8195;3)、使用CDN进行加速<br>
```javascript
        CDN 又叫内容分发网络，通过把资源部署到世界各地，用户在访问时按照就近原则从离用户最近的服务器获取资源，从而加速资源的获取速度。
        
        使用CDN要注意的问题：
        1、针对 HTML 文件：不开启缓存，把 HTML 放到自己的服务器上，而不是 CDN 服务上，同时关闭自己服务器上的缓存。
        2、针对静态的 JavaScript、CSS、图片等文件：开启 CDN 和缓存，上传到 CDN 服务上去，同时给每个文件名带上由文件内容算出的 Hash 值。带上 Hash 值的原因是文件名会随着文件内容而变化，只要文件发生变化其对应的 URL 就会变化，它就会被重新下载，无论缓存时间有多长。
        
        Webpack 实现 CDN 的接入要注意一下几点：
        1、静态资源的导入 URL 需要变成指向 CDN 服务的绝对路径的 URL 而不是相对于 HTML 文件的 URL。
        2、静态资源的文件名称需要带上有文件内容算出来的 Hash 值，以防止被缓存。
        3、不同类型的资源放到不同域名的 CDN 服务上去，以防止资源的并行加载被阻塞。
        
        在webpack中的基本配置如下：
        const path = require('path');
        const ExtractTextPlugin = require('extract-text-webpack-plugin');
        const htmlWebpackPlugin = require('html-webpack-plugin');
        module.exports = {
          // 省略 entry 配置...
          output: {
            // 给输出的 JavaScript 文件名称加上 Hash 值
            filename: '[name]_[chunkhash:8].js',
            path: path.resolve(__dirname, './dist'),
            // 指定存放 JavaScript 文件的 CDN 目录 URL
            publicPath: '//js.cdn.com/id/',
          },
          module: {
            rules: [
              {
                // 增加对 CSS 文件的支持
                test: /\.css$/,
                // 提取出 Chunk 中的 CSS 代码到单独的文件中
                use: ExtractTextPlugin.extract({
                  // 压缩 CSS 代码
                  use: ['css-loader?minimize'],
                  // 指定存放 CSS 中导入的资源（例如图片）的 CDN 目录 URL
                  publicPath: '//img.cdn.com/id/'
                }),
              },
            ]
          },
          plugins: [
            // 使用 WebPlugin 自动生成 HTML
            new htmlWebpackPlugin({
              // HTML 模版文件所在的文件路径
              template: './template.html',
              // 输出的 HTML 的文件名称
              filename: 'index.html',
              // 指定存放 CSS 文件的 CDN 目录 URL
              stylePublicPath: '//css.cdn.com/id/',
            }),
            new ExtractTextPlugin({
              // 给输出的 CSS 文件名称加上 Hash 值
              filename: `[name]_[contenthash:8].css`,
            }),
            // 省略代码压缩插件配置...
          ],
        };
```
&#8195;&#8195;&#8195;4)、使用Tree-Shaking删除无用的代码
```javascript
    Tree Shaking 可以用来剔除 JavaScript 中用不上的死代码。它依赖静态的 ES6 模块化语法。
    
    Tree Shaking的局限性在于：
    1、不会对entry入口文件做 Tree Shaking。
    2、不会对异步分割出去的代码做 Tree Shaking。
    
    想要是Tree Shaking起作用，需要做到这几步。
    1、修改.babelrc 文件
    {
      "presets": [
        [
          "env",
          {
            "modules": false
          }
        ]
      ]
    }
    2、使用代码压缩(在命令行中加上--optimize-minimize)
    module.exports={
         resolve: {
            // 针对 Npm 中的第三方模块优先采用 jsnext:main 中指向的 ES6 模块化语法的文件（Tree Shaking只对ES6模块化语法的文件起作用，所以需要如下配置。）
            mainFields: ['jsnext:main', 'browser', 'main']
         },
        plugins:[
            new UglifyJSPlugin()
        ]
    }
```
&#8195;&#8195;&#8195;5)、进行按需加载（使用import()）<br>
&#8195;&#8195;&#8195;6)、提取公共代码
```javascript
    module.exports={
        ...
        optimization:{
            splitChunks: {
    	     	cacheGroups:{ 					// 这里开始设置缓存的
    	         	vendor: { 					// key 为entry中定义的 入口名称
    	         		priority: 1, 			// 缓存组优先级
    	             	chunks: "all",
    	             	test: /[\\/]node_modules[\\/]babel-runtime/,
    	             	name: 'babel-runtime',
    	         	}
    	     	}
    		},
        }
    }
```
+ 2、提升代码性能（流畅度）

&#8195;&#8195;&#8195;1)、开启 Scope Hoisting（减少函数声明语句）
```javascript
    Scope Hoisting 可以让 Webpack 打包出来的代码文件更小、运行的更快， 它又译作 "作用域提升"。Scope Hoisting 的实现原理其实很简单：分析出模块之间的依赖关系，尽可能的把打散的模块合并到一个函数中去，但前提是不能造成代码冗余。 因此只有那些被引用了一次的模块才能被合并。因此源码必须采用 ES6 模块化语句，不然它将无法生效。 
    
    使用Scope Hoisting的好处：
    1、代码体积更小，因为函数声明语句会产生大量代码；
    2、代码在运行时因为创建的函数作用域更少了，内存开销也随之变小。
    
    const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

    module.exports = {
      resolve: {
        // 针对 Npm 中的第三方模块优先采用 jsnext:main 中指向的 ES6 模块化语法的文件
        mainFields: ['jsnext:main', 'browser', 'main']
      },
      plugins: [
        // 开启 Scope Hoisting
        new ModuleConcatenationPlugin(),
      ],
    };
    
```
&#8195;&#8195;这片文档主要是对webpack的配置及优化做了一些总结。资料来源主要是 `《升入浅出webpack》`和 `webpack` 的官网。
