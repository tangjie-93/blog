(window.webpackJsonp=window.webpackJsonp||[]).push([[81],{516:function(s,t,a){s.exports=a.p+"assets/img/load-script.5f236cae.png"},820:function(s,t,a){"use strict";a.r(t);var n=a(41),e=Object(n.a)({},(function(){var s=this,t=s._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h2",{attrs:{id:"_1、css资源的加载-异步加载的"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_1、css资源的加载-异步加载的"}},[s._v("#")]),s._v(" 1、CSS资源的加载(异步加载的)")]),s._v(" "),t("ul",[t("li",[s._v("遇到 "),t("code",[s._v("style")]),s._v(' 内联样式，"同步"交给'),t("code",[s._v("GUI")]),s._v(" 渲染线程解析。")]),s._v(" "),t("li",[s._v("遇到 "),t("code",[s._v("link")]),s._v(" 标签。\n"),t("ul",[t("li",[s._v('"异步" 开辟一个新的 '),t("code",[s._v("HTTP")]),s._v("网络请求线程。")]),s._v(" "),t("li",[s._v("不等待资源信息请求回来，"),t("code",[s._v("GUI")]),s._v(" 渲染线程继续向下渲染。")]),s._v(" "),t("li",[t("code",[s._v("GUI")]),s._v(" 渲染线程同步操作都处理完后，再把基于"),t("code",[s._v("HTTP")]),s._v(" 网络线程请求回来的资源文件进行解析渲染。")])])]),s._v(" "),t("li",[s._v("遇到 "),t("code",[s._v("@import")]),s._v(" 导入样式。同步开辟一个新的 "),t("code",[s._v("HTTP")]),s._v("网络请求线程 去请求资源文件。在资源文件没有请求回来之前，"),t("code",[s._v("GUI")]),s._v(' 渲染线程会被"阻塞",不允许其继续向下渲染。')])]),s._v(" "),t("h2",{attrs:{id:"_2、script-资源的加载-默认是同步加载的"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_2、script-资源的加载-默认是同步加载的"}},[s._v("#")]),s._v(" 2、script 资源的加载(默认是同步加载的)")]),s._v(" "),t("ul",[t("li",[s._v('默认是"同步"的：必须基于'),t("code",[s._v("HTTP")]),s._v(" 网络线程，把资源请求回来之后，并且交给"),t("code",[s._v("js")]),s._v(" 渲染线程解析完成后，"),t("code",[s._v("GUI")]),s._v(" 渲染线程才能继续向下渲染。"),t("code",[s._v("script")]),s._v("默认是阻碍"),t("code",[s._v("GUI")]),s._v("渲染的。")]),s._v(" "),t("li",[t("code",[s._v("async")]),s._v("属性：遇到 "),t("code",[s._v("<script async>")]),s._v("时，首先也是开辟一个"),t("code",[s._v("HTTP")]),s._v("网络线程去请求加载资源文件，与此同时"),t("code",[s._v("GUI")]),s._v('渲染线程继续向下渲染（吧默认的同步改为"异步"）,但是一旦资源请求回来后，会中断'),t("code",[s._v("GUI")]),s._v("的渲染，先把请求回来的"),t("code",[s._v("js")]),s._v("进行渲染解析。才会渲染解析请求回来的"),t("code",[s._v("js")]),s._v(" 代码。\n"),t("img",{attrs:{src:a(516),title:"暂无图片"}})])]),s._v(" "),t("h2",{attrs:{id:"_3、图片或者音频、视频资源"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_3、图片或者音频、视频资源"}},[s._v("#")]),s._v(" 3、图片或者音频、视频资源")]),s._v(" "),t("p",[s._v("  会发起新的"),t("code",[s._v("HTTP")]),s._v("网络请求，请求加载的资源文件，不会阻碍"),t("code",[s._v("GUI")]),s._v('的渲染("异步")。当'),t("code",[s._v("GUI")]),s._v(" 渲染完成后，才会把请求回来的资源信息进行渲染解析。")]),s._v(" "),t("h2",{attrs:{id:"_4、页面渲染的步骤"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_4、页面渲染的步骤"}},[s._v("#")]),s._v(" 4、页面渲染的步骤")]),s._v(" "),t("ul",[t("li",[s._v("生成"),t("code",[s._v("DOM TREE")]),s._v("("),t("code",[s._v("DOM")]),s._v("树)：自上而下渲染页面，整理好整个页面的"),t("code",[s._v("DOM")]),s._v("结构关系。")]),s._v(" "),t("li",[s._v("生成"),t("code",[s._v("CSSOM TREE")]),s._v("(样式树)：当把所有的样式资源请求加载回来后，按照引入"),t("code",[s._v("CSS")]),s._v("的顺序，依次渲染样式代码，生成样式树。")]),s._v(" "),t("li",[t("code",[s._v("RENDER TREE")]),s._v("(渲染树)：将"),t("code",[s._v("DOM TREE")]),s._v("和 "),t("code",[s._v("CSSOM TREE")]),s._v(" 合成渲染树（"),t("code",[s._v("display")]),s._v("为"),t("code",[s._v("none")]),s._v("的不会去渲染）。")]),s._v(" "),t("li",[t("code",[s._v("Layout")]),s._v(" 布局/回流/重绘：计算它们在设备视口("),t("code",[s._v("viewport")]),s._v(")内的确切位置和大小。")]),s._v(" "),t("li",[s._v("分层处理：按照层级定位分层处理，每一个层级都会详细规划处具体的绘制步骤。")]),s._v(" "),t("li",[t("code",[s._v("Painting")]),s._v(":按照每一个层级计算绘制的绘制步骤，开始绘制页面。")])]),s._v(" "),t("h2",{attrs:{id:"_5、前端性能优化-crp"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_5、前端性能优化-crp"}},[s._v("#")]),s._v(" 5、前端性能优化（CRP:")]),s._v(" "),t("ul",[t("li",[s._v("生成 "),t("code",[s._v("DOM TREE")]),s._v("阶段\n"),t("ul",[t("li",[s._v("减少"),t("code",[s._v("dom")]),s._v("层级嵌套")]),s._v(" "),t("li",[s._v("不要使用非标准标签。")])])]),s._v(" "),t("li",[s._v("生成 "),t("code",[s._v("CSSOM")]),s._v(" 树\n"),t("ul",[t("li",[s._v("尽可能不要使用"),t("code",[s._v("@import")]),s._v("（阻塞"),t("code",[s._v("GUI")]),s._v("渲染）")]),s._v(" "),t("li",[s._v("如果"),t("code",[s._v("CSS")]),s._v("代码较少，尽可能使用"),t("code",[s._v("style")]),s._v("内联样式")]),s._v(" "),t("li",[s._v("如果使用 "),t("code",[s._v("link")]),s._v("，尽可能把所有的样式资源合并成一个 "),t("code",[s._v("CSS")]),s._v("，且压缩(减少"),t("code",[s._v("HTTP")]),s._v(" 请求数量，同时在渲染 "),t("code",[s._v("CSS")]),s._v("的时候，也不需要在计算依赖关系)")]),s._v(" "),t("li",[t("code",[s._v("CSS")]),s._v("选择器链短一些("),t("code",[s._v("CSS")]),s._v("选择器渲染时从右到左的)")]),s._v(" "),t("li",[s._v("将"),t("code",[s._v("link")]),s._v("等导入"),t("code",[s._v("CSS")]),s._v("的操作放在"),t("code",[s._v("HEAD")]),s._v("中。")])])]),s._v(" "),t("li",[t("code",[s._v("script")]),s._v("资源的优化\n"),t("ul",[t("li",[t("code",[s._v("script")]),s._v("标签。尽量放在页面的底部。")]),s._v(" "),t("li",[s._v("使用"),t("code",[s._v("async")]),s._v("时，哪一个资源先获取到，就把这个资源代码渲染执行。")]),s._v(" "),t("li",[s._v("使用"),t("code",[s._v("defer")]),s._v("时，和"),t("code",[s._v("link")]),s._v("一样，等所有"),t("code",[s._v("<script defer>")]),s._v("都请求回来后，按照导入顺序/依赖关系依次先后渲染。")])])]),s._v(" "),t("li",[t("code",[s._v("img")]),s._v("资源的优化\n"),t("ul",[t("li",[s._v("懒加载：第一次加载页面的时候不要加载请求图片，哪怕是异步的，也会占据"),t("code",[s._v("HTTP")]),s._v("并发的数量,导致其他资源后加载。")]),s._v(" "),t("li",[s._v("图片的"),t("code",[s._v("BASE64")]),s._v("：不用去请求图片，"),t("code",[s._v("BASE64")]),s._v("码基本上代表的就是图片,而且页面渲染图片的时候速度很快(但是要慎用（编码后的代码量太大）,在"),t("code",[s._v("webpack")]),s._v("工程化中可以使用,因为它基于"),t("code",[s._v("file-loader")]),s._v("，可以自动"),t("code",[s._v("base64")]),s._v(")")])])]),s._v(" "),t("li",[t("code",[s._v("Layout/Painting")]),s._v(":减少"),t("code",[s._v("DOM")]),s._v('的"回流/重排"和重绘。 触发回流，必然会触发重绘；单纯的重绘，并不会引发回流。\n'),t("ul",[t("li",[t("p",[s._v("引发回流的操作：")]),s._v(" "),t("ul",[t("li",[s._v("元素在视口中的大小或者位置发生变化")]),s._v(" "),t("li",[s._v("元素的删减或者新增(或者基于"),t("code",[s._v("display")]),s._v("控制显示隐藏)。")]),s._v(" "),t("li",[s._v("浏览器视口发生变化。")]),s._v(" "),t("li",[s._v("内容发生变化(比如文本变化或者图片被另一个不同尺寸的图片所替代)")])])]),s._v(" "),t("li",[t("p",[s._v("避免"),t("code",[s._v("DOM")]),s._v("的回流的操作：")]),s._v(" "),t("ul",[t("li",[s._v("样式集中改变")]),s._v(" "),t("li",[s._v("分离读写操作")]),s._v(" "),t("li",[s._v("缓存布局信息")])]),s._v(" "),t("div",{staticClass:"language-js line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-js"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//触发两次回流 两次样式读")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("width"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("box"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("offsetWidth"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"px"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("height"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("box"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("offsetHeight"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"px"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//修改为")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" w"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("box"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("offsetWidth"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("h"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("box"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("offsetHeight"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("width"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("w"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'px'")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("height"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("h"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'px'")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br")])]),t("ul",[t("li",[s._v("元素批量修改("),t("code",[s._v("createDocumentFragment")]),s._v(",模板字符串拼接)")]),s._v(" "),t("li",[s._v("动画效果等频繁样式修改的操作，应用到"),t("code",[s._v("position")]),s._v("属性为"),t("code",[s._v("absolute")]),s._v("或者"),t("code",[s._v("fixed")]),s._v("的元素上(脱离文档流,单独一层)。利用分层机制，如果只改变一个层面上的位置大小等消息，浏览器回流和重绘的速度会加快很多。")]),s._v(" "),t("li",[t("code",[s._v("CSS3")]),s._v("硬件加速("),t("code",[s._v("GPU")]),s._v("加速)。"),t("code",[s._v("transform、opacity、filters...")]),s._v("等属性会触发硬件加速，不会引发回流。但是过量使用会占用大量内存、性能消耗严重，有时候会导致字体模糊等。")]),s._v(" "),t("li",[s._v("避免"),t("code",[s._v("table")]),s._v("布局和使用"),t("code",[s._v("css")]),s._v("的"),t("code",[s._v("javascript")]),s._v("表达式。")])])]),s._v(" "),t("li",[t("p",[s._v("重绘：元素的颜色、透明度等不影响元素的大小及在视口中的位置的操作。("),t("code",[s._v("outline、visibility、background-color")]),s._v(")")])])])])]),s._v(" "),t("h2",{attrs:{id:"_6、当代浏览器的渲染队列机制"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_6、当代浏览器的渲染队列机制"}},[s._v("#")]),s._v(" 6、当代浏览器的渲染队列机制")]),s._v(" "),t("p",[s._v('  在当前上下文操作当中，遇到一行修改样式的代码，并没有立即通知浏览器渲染，而是把其放置在渲染队列中，接下来看是否还有修改样式的代码，如果有继续放在渲染队列中...一直到再也没有修改样式的代码或者"遇到一行获取样式的操作"，这样都会刷新浏览器的渲染队列机制(也就是把现在队列中修改样式的操作，统一告诉浏览器渲染，这样只会引发一次回流。)。优化方式就是**分离读写。**或者样式集中修改'),t("code",[s._v('box.cssText="...."')]),s._v("。")]),s._v(" "),t("ul",[t("li",[s._v("分离读写的方式1")])]),s._v(" "),t("div",{staticClass:"language-js line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-js"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//分离样式读和写")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//这种写法这会引发两次回流")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("width"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"100px"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//样式写")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("height"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'200px'")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//样式写")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("offsetHeight"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//样式读")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("top"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"100px"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//样式写")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//改为")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("width"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"100px"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//样式写")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("height"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'200px'")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//样式写")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("top"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"100px"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//样式写")]),s._v("\nbox"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("offsetHeight"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//样式读")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br")])]),t("ul",[t("li",[s._v("分离读写的方式2\n"),t("code",[s._v('box.style.cssText="width:100px;height:200px"')]),s._v(" "),t("strong",[s._v("注意")]),s._v(":有些操作可以利用样式的回流来实现一些想要的操作。")])]),s._v(" "),t("div",{staticClass:"language-js line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-js"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("setTimeout")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 立即回到left:0的位置")]),s._v("\n    box"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("transitionDuration "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'0s'")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    box"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("left "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 刷新渲染队列（会增加一次回流）")]),s._v("\n    box"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("offsetLeft"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 回到开始位置后，再次运动到left:200位置(有动画)")]),s._v("\n    box"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("transitionDuration "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'0.5s'")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    box"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("style"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("left "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'200px'")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1000")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br")])])])}),[],!1,null,null,null);t.default=e.exports}}]);