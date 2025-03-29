(window.webpackJsonp=window.webpackJsonp||[]).push([[142],{779:function(t,_,r){"use strict";r.r(_);var v=r(41),n=Object(v.a)({},(function(){var t=this,_=t._self._c;return _("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[_("h2",{attrs:{id:"_1、http是如何基于tcp-ip通信的"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#_1、http是如何基于tcp-ip通信的"}},[t._v("#")]),t._v(" 1、HTTP是如何基于TCP/IP通信的？")]),t._v(" "),_("p",[t._v("  为了准确无误地把数据送达目标处，"),_("strong",[t._v("TCP协议采用了三次握手策略")]),t._v("。\n  用TCP协议把数据包送出去后，TCP不会对传送后的情况置之不理，它一定会向对方确认是否成功送达。"),_("strong",[t._v("握手过程中使用了TCP的标志：SYN和ACK。")]),_("br"),t._v("\n  1、发送端首先发送一个带SYN标志的数据包给对方。（"),_("strong",[t._v("发送端发数据包")]),t._v("）"),_("br"),t._v("\n  2、接收端收到后，回传一个带有SYN/ACK标志的数据包以示传达确认信息。("),_("strong",[t._v("接收端表示知道")]),t._v(")"),_("br"),t._v('\n  3、最后，发送端再回传一个带ACK标志的数据包，代表"握手"结束。若在握手过程中某个阶段莫名中断，TCP协议会再次以相同的顺序发送相同的数据包。 ('),_("strong",[t._v("接收端回传数据包")]),t._v(")")]),t._v(" "),_("p",[t._v("  断开一个TCP连接则需要“四次挥手”：")]),t._v(" "),_("p",[t._v("  1、第一次挥手：主动关闭方发送一个FIN，用来关闭主动方到被动关闭方的数据传送，也就是主动关闭方告诉被动关闭方：我已经不会再给你发数据了(当然，在FIN包之前发送出去的数据，如果没有收到对应的ACK确认报文，主动关闭方依然会重发这些数据)，但是，此时主动关闭方还可以接受数据。（"),_("strong",[t._v("主动关闭方将不会发送数据")]),t._v("）"),_("br"),t._v("\n  2、第二次挥手：被动关闭方收到FIN包后，发送一个ACK给对方。("),_("strong",[t._v("被动关闭方知道将不会受到数据")]),t._v(")"),_("br"),t._v("\n  3、第三次挥手：被动关闭方发送一个FIN，用来关闭被动关闭方到主动关闭方的数据传送，也就是告诉主动关闭方，我的数据也发送完了，不会再给你发数据了。("),_("strong",[t._v("被动关闭方将不会发送数据")]),t._v(")"),_("br"),t._v("\n  4、第四次挥手：主动关闭方收到FIN后，发送一个ACK给被动关闭方至此，完成四次挥手。("),_("strong",[t._v("主动关闭方知道将不会受到数据")]),t._v(")")]),t._v(" "),_("h2",{attrs:{id:"_2、tcp与udp的区别"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#_2、tcp与udp的区别"}},[t._v("#")]),t._v(" 2、TCP与UDP的区别?")]),t._v(" "),_("ul",[_("li",[t._v("TCP（Transmission Control Protocol，传输控制协议）是基于连接的协议，也就是说，在正式收发数据前，必须和对方建立可靠的连接。一个TCP连接必须要经过三次“对话”才能建立起来。")]),t._v(" "),_("li",[t._v("UDP（User Data Protocol，用户数据报协议）是与TCP相对应的协议。它是面向非连接的协议，它不与对方建立连接，而是直接就把数据包发送过去。udp实时性比较好，但是质量就不敢保证了。UDP适用于一次只传送少量数据、对可靠性要求不高的应用环境。")])])])}),[],!1,null,null,null);_.default=n.exports}}]);