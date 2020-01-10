(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{141:function(_,v,t){_.exports=t.p+"assets/img/browserExe.2a42b56e.jpg"},154:function(_,v,t){"use strict";t.r(v);var e=t(0),s=Object(e.a)({},(function(){var _=this,v=_.$createElement,e=_._self._c||v;return e("ContentSlotsDistributor",{attrs:{"slot-key":_.$parent.slotKey}},[e("p",[e("strong",[_._v("输入url后，总的来说经历了如下几个过程")])]),_._v(" "),e("ul",[e("li",[_._v("1、DNS解析（将域名解析成IP地址）")]),_._v(" "),e("li",[_._v("2、TCP连接（TCP三次握手）")]),_._v(" "),e("li",[_._v("3、发送HTTP请求")]),_._v(" "),e("li",[_._v("4、服务器处理HTTP请求，并返回请求报文")]),_._v(" "),e("li",[_._v("5、浏览器渲染解析界面")]),_._v(" "),e("li",[_._v("6、断开TCP连接（TCP四次挥手）")])]),_._v(" "),e("h3",{attrs:{id:"_1、dns解析"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_1、dns解析"}},[_._v("#")]),_._v(" "),e("strong",[_._v("1、DNS解析")])]),_._v(" "),e("p",[_._v(" 浏览器通过向"),e("code",[_._v("DNS服务器")]),_._v("发送域名，DNS服务器查询到与域名相应的IP地址，然后返回给浏览器。浏览器再将ip地址打在协议上，同时请求参数也会在协议上搭载，然后一并发送给对应的服务器。")]),_._v(" "),e("p",[e("strong",[_._v("DNS的详细解析过程")])]),_._v(" "),e("ul",[e("li",[_._v("1、浏览器缓存：浏览器会按照一定的频率缓存DNS记录，所以一开始浏览器会搜索自身的DNS缓存。")]),_._v(" "),e("li",[_._v("2、操作系统缓存：如果浏览器中找不到需要的DNS记录，那就去操作系统中找。")]),_._v(" "),e("li",[_._v("3、本地hosts文件：如果操作系统中的缓存也没有找到或失效，浏览器就就会去读取本地的hosts文件。")]),_._v(" "),e("li",[_._v("4、ISP的DNS服务器：ISP是互联网服务供应商(Internet Service Provider)的简称，ISP有专门的DNS服务器应对DNS查询请求。")]),_._v(" "),e("li",[_._v("5、根服务器：ISP的DNS服务器还找不到的话，它就会向根服务器发出请求，进行递归查询（如www.baidu.com。DNS服务器先根据域名服务器.com域名服务器的IP地址，然后再问.baidu域名服务器，一次类推）")])]),_._v(" "),e("h3",{attrs:{id:"_2、tcp连接"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_2、tcp连接"}},[_._v("#")]),_._v(" "),e("strong",[_._v("2、TCP连接")])]),_._v(" "),e("p",[_._v(" 客户端和服务端建立TCP连接需要三次握手。过程如下：")]),_._v(" "),e("ul",[e("li",[_._v("1、客户端发送一个带SYN=1，Seq=X的数据包到服务端。（第一次握手由浏览器发起，告诉服务器自己要发送请求了）")]),_._v(" "),e("li",[_._v("2、服务器接收到数据包后，发送一个SYN=1，ACK=X+1，Seq=Y的数据包到服务器端口（第一次握手，由服务器发起，告诉浏览器自己顺北接受数据了）")]),_._v(" "),e("li",[_._v("3、客户端再回传一个带ACK=Y+1，Seq=Z的数据包，代表握手结束。（第三次握手，由浏览器发送，告诉服务器，自己要发送数据了）")])]),_._v(" "),e("p",[e("strong",[_._v("三次握手的目的：为了防止已经失效的连接请求报文段突然又传送到了服务器端，从而产生错误。")])]),_._v(" "),e("h3",{attrs:{id:"_3、发送http请求"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_3、发送http请求"}},[_._v("#")]),_._v(" "),e("strong",[_._v("3、发送HTTP请求")])]),_._v(" "),e("p",[_._v("  请求报文由请求行、请求头和请求体三部分组成。")]),_._v(" "),e("ul",[e("li",[_._v("1、请求行包含请求方法、url和协议版本。")]),_._v(" "),e("li",[_._v('2、请求头包含请求的附加信息，由键值对组成。如Host:github.com、User-Agent：""、Connection:keep-alive以及Cookie。')]),_._v(" "),e("li",[_._v("3、请求体主要是请求参数（Query String Parameters）。")])]),_._v(" "),e("p",[e("strong",[_._v("注意：在发送HTTP请求的过程中，要先考虑浏览器缓存情况。缓存又分为"),e("code",[_._v("强制缓存和协商缓存")]),_._v("。")])]),_._v(" "),e("ul",[e("li",[e("strong",[_._v("强制缓存:")]),_._v(" 当本地缓存中含有请求的数据且（"),e("code",[_._v("缓存时间还未过期")]),_._v("）时，客户端直接从本地缓存中获取数据。当本地缓存中没有请求的数据时，客户端才会从不服务器获取数据。对于强制缓存，服务器响应的headrest中会用两个字段来表明——"),e("code",[_._v("expires和cache-control")]),_._v("。")])]),_._v(" "),e("p",[e("strong",[_._v("1、expires")])]),_._v(" "),e("p",[_._v("  expires的值作为服务器返回的数据到期时间。当再次请求的请求时间小于返回的此时间，则直接使用缓存数据。"),e("strong",[_._v("不足：")]),_._v(" 由于服务段时间和客户端时间可能有误差，会导致缓存命中的误差；另一方面，expires是HTTP1.0的产物，股现在大多数使用cache-control来替代。")]),_._v(" "),e("p",[e("strong",[_._v("2、cache-control")])]),_._v(" "),e("p",[_._v("  cache-control 有许多属性，不同的属性代表不同的意义。")]),_._v(" "),e("div",{staticClass:"language- line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[_._v("    private:客户端可以缓存。\n    public：客户端和代理服务器可以缓存。\n    max-age=t:缓存内容将在t秒后失效。\n    no-cache：需要使用协商缓存来验证缓存数据。\n    no-store:所有内容都不会缓存。\n    must-revalidate:缓存内容在考虑使用一个陈旧的资源时，必须先验证它的状态，已过期的缓存将不被使用。\n")])]),_._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[_._v("1")]),e("br"),e("span",{staticClass:"line-number"},[_._v("2")]),e("br"),e("span",{staticClass:"line-number"},[_._v("3")]),e("br"),e("span",{staticClass:"line-number"},[_._v("4")]),e("br"),e("span",{staticClass:"line-number"},[_._v("5")]),e("br"),e("span",{staticClass:"line-number"},[_._v("6")]),e("br")])]),e("ul",[e("li",[e("strong",[_._v("协商缓存：")]),_._v(" 又称对比缓存，客户端会先从本地缓存中获取到一个缓存数据的标识（ETag），然后服务器检查该ETag是否失效，如果没有失效，服务器会返回304，此时客户端直接从缓存中获取数据。协商缓存又分为两种情况。\n  "),e("h4",[_._v("情况1：根据Last-modified进行协商缓存。")]),_._v(" "),e("strong",[_._v("Last-Modified：")]),_._v(" 服务器在响应请求时，会告诉浏览器资源的"),e("code",[_._v("最后修改时间")]),_._v("。"),e("br"),_._v(" "),e("strong",[_._v("if-Modified-Since：")]),_._v(" 浏览器再次请求服务器的时候，请求头会包含此字段，后面跟着在缓存中获取的最后修改时间，服务器收到此请求头发现有"),e("code",[_._v("if-Modified-Since")]),_._v(",则与被请求资源的最后修改时间进行对比，如果一致则返回304和响应报文头，浏览器只需要从缓存中国获取信息就可以了。从字面上的意思看，这个字段表示从某个时间点算起，看文件是否被修改了。,"),e("br"),_._v("\n  1、如果没有被修改，那么只需要传输响应header，服务器返回304（Not Modified）。"),e("br"),_._v("\n  2、如果被修改了。那么开始传输响应一个整体，服务器返回200(OK)。"),e("br"),_._v(" "),e("strong",[_._v("Last-Modified也有不足之处，如果实在服务器上，一个资源被修改了，但其实际内容并没有发生改变，会因为Last-Modified时间匹配不上而返回整个实体给客户端（即使客户端缓存里有一个一模一样的资源。为了解决这个问题，所以HTTP1.1推出了ETag）。")]),_._v(" "),e("h4",[_._v("情况2：根据ETag来进行协商缓存")]),_._v(" "),e("strong",[_._v("Etag：")]),_._v(" ETag 是URL的Entity Tag，用于标识URL对象是否改变，区分不同预研和Session等等。具体内部含义是服务器控制的，就像cookie那样。ETag由服务器生成，然后通过响应头发送给客户端。然后客户端将ETag的值保存到缓存里。客户端再次发起请求时，使用"),e("strong",[_._v("If-Match/If-None-Match，该值就是保存到缓存里的ETag值")]),_._v(" 这个条件判断请求来验证资源是否修改。具体验证过程如下。"),e("br"),_._v(" "),e("strong",[_._v("如果是第一次请求")]),e("br"),_._v("\n  1、客户端发起HTTP GET请求一个文件。"),e("br"),_._v('\n  2、服务器处理请求，返回文件内容（响应体）和一对Header。Header中包括ETag(例如2e681a-6-5d044840")(假设服务器支持ETag生成和已经开启了ETag)，状态码200(OK)。 '),e("br"),_._v(" "),e("strong",[_._v("如果不是第一次请求")]),e("br"),_._v("\n  客户端发起 HTTP GET 请求一个文件，注意这个时候客户端同时发送一个If-None-Match头，这个头的内容就是第一次请求时服务器返回的Etag：2e681a-6-5d0448402。"),e("br"),_._v("\n  服务器检查该ETag，并判断出该页面自上次客户端请求之后是否被修改，因此If-None-Match为False，即没有被修改，则响应header和空的body，浏览器直接从缓存中获取数据信息。返回状态码304。如果ETag被修改了，说明资源被改动过，则响应整个资源内容，返回状态码200。")])]),_._v(" "),e("h3",{attrs:{id:"_4、服务器处理http请求，并返回请求报文"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_4、服务器处理http请求，并返回请求报文"}},[_._v("#")]),_._v(" "),e("strong",[_._v("4、服务器处理HTTP请求，并返回请求报文")])]),_._v(" "),e("p",[_._v("响应报文由响应行、响应头部以及响应体三个部分组成。")]),_._v(" "),e("h3",{attrs:{id:"_5、浏览器渲染解析界面"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_5、浏览器渲染解析界面"}},[_._v("#")]),_._v(" "),e("strong",[_._v("5、浏览器渲染解析界面")])]),_._v(" "),e("p",[_._v("整个渲染过程可以用如下一张图片来展示。\n"),e("img",{attrs:{src:t(141),alt:"暂无图片"}}),_._v("\n具体渲染过程如下：")]),_._v(" "),e("ul",[e("li",[_._v("1、HTML解析，处理HTML标记并构建DOM树。解析过程分为两个阶段——"),e("code",[_._v("标记化阶段和树构建阶段")]),_._v("。标记化阶段属于此法分析阶段，将输入内容解析成多个标记。包括开始标记、结束标记、属性名和属性值。树构建阶段属于语法分析阶段，标记识别器识别标记，并传递给树构造器，最终生成vnode。")]),_._v(" "),e("li",[_._v("2、CSS解析，处理CSS标记并构建CSSOM树.将css文件解析成StyleSheet对象，该对象包含着css规则，css规则对象包含着选择器及声明对象；")]),_._v(" "),e("li",[_._v("3、将DOM树和CSSOM合并称render tree(渲染树)。将每条css规则按照【从右至左】的方式在dom树上进行逆向匹配，然后生成具有样式规则描述的渲染树。")]),_._v(" "),e("li",[_._v("4、渲染树布局，计算每个节点的集合信息。包括"),e("code",[_._v("repaint和reflow")]),_._v("。reflow在节点的几何大小变化时发生，会从该节点向下递归，依次计算所有元素的几何大小和位置。而repaint是在节点的几何大小没有变，只是背景灯其他样式变了，或者样式visibility改为hidden时发生。")]),_._v(" "),e("li",[_._v("5、渲染树绘制，将每个节点绘制到屏幕上。"),e("br")])]),_._v(" "),e("h3",{attrs:{id:"_6、断开tcp连接（tcp四次挥手）"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_6、断开tcp连接（tcp四次挥手）"}},[_._v("#")]),_._v(" "),e("strong",[_._v("6、断开TCP连接（TCP四次挥手）")])]),_._v(" "),e("p",[_._v("断开一个tcp连接时，需要4次挥手。")]),_._v(" "),e("ul",[e("li",[_._v("1、第一次挥手。主动关闭方发送一个FIN包，用来关闭主动方到被动关闭方的数据传输。就是主动关闭方告诉被动关闭方不会再发送数据了（当然在FIN包之前发送出去的数据，如果没有收到 ACK确认报文，主动关闭方依然会重新发送这些数据），但是此时主动关闭方还是可以接受数据。（主动关闭方将不会发送数据）")]),_._v(" "),e("li",[_._v("2、第二次挥手。被动关闭方收到FIN包后，发送一个ACK包给对方。（被动关闭方知道将不会收到数据）。")]),_._v(" "),e("li",[_._v("3、第三次挥手：被动关闭方发送一个FIN包，用来关闭被动关闭方到主动关闭方的数据传送，也就是告诉主动关闭方，我的数据也发送完了。（被动关闭方将不会发送数据）")]),_._v(" "),e("li",[_._v("4、第四次握手：主动关闭方手袋FIN包后，发送一个ACK给被动关闭方，完成呢四次握手。（主动关闭方知道将不会收到数据）")])])])}),[],!1,null,null,null);v.default=s.exports}}]);