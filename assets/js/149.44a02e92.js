(window.webpackJsonp=window.webpackJsonp||[]).push([[149],{788:function(s,t,a){"use strict";a.r(t);var n=a(41),e=Object(n.a)({},(function(){var s=this,t=s._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h3",{attrs:{id:"_1、class声明会提升-但不会初始化值-类似于let、const声明变量一样。"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_1、class声明会提升-但不会初始化值-类似于let、const声明变量一样。"}},[s._v("#")]),s._v(" 1、"),t("code",[s._v("class")]),s._v("声明会提升，但不会初始化值,类似于"),t("code",[s._v("let、const")]),s._v("声明变量一样。")]),s._v(" "),t("h3",{attrs:{id:"_2、class声明内部会启用严格模式。"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_2、class声明内部会启用严格模式。"}},[s._v("#")]),s._v(" 2、"),t("code",[s._v("class")]),s._v("声明内部会启用严格模式。")]),s._v(" "),t("h3",{attrs:{id:"_3、class的所有方法-包括静态和实例方法-都是不可枚举的。"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_3、class的所有方法-包括静态和实例方法-都是不可枚举的。"}},[s._v("#")]),s._v(" 3、"),t("code",[s._v("class")]),s._v("的所有方法（包括静态和实例方法）都是不可枚举的。")]),s._v(" "),t("h3",{attrs:{id:"_4、class的所有方法-包括静态和实例方法-都没有原型对象prototype-不能用new来调用。"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_4、class的所有方法-包括静态和实例方法-都没有原型对象prototype-不能用new来调用。"}},[s._v("#")]),s._v(" 4、"),t("code",[s._v("class")]),s._v("的所有方法(包括静态和实例方法)都没有原型对象"),t("code",[s._v("prototype")]),s._v(",不能用"),t("code",[s._v("new")]),s._v("来调用。")]),s._v(" "),t("h3",{attrs:{id:"_5、必须使用new来调用class。"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_5、必须使用new来调用class。"}},[s._v("#")]),s._v(" 5、必须使用"),t("code",[s._v("new")]),s._v("来调用"),t("code",[s._v("class")]),s._v("。")]),s._v(" "),t("h3",{attrs:{id:"_6、class内部无法重写类名。"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_6、class内部无法重写类名。"}},[s._v("#")]),s._v(" 6、"),t("code",[s._v("class")]),s._v("内部无法重写类名。")]),s._v(" "),t("h3",{attrs:{id:"_7、es6子类可以直接通过-proto-寻址到父类。"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_7、es6子类可以直接通过-proto-寻址到父类。"}},[s._v("#")]),s._v(" 7、ES6子类可以直接通过"),t("code",[s._v("__proto__")]),s._v("寻址到父类。")]),s._v(" "),t("div",{staticClass:"language-js line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-js"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//ES6")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Super")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Sub")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("extends")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Super")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" sub "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Sub")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\nsub"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("__proto__ "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("===")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Sub")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("prototype"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//true")]),s._v("\nSub"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("__proto__ "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("===")]),s._v(" Super"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//true")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Sub")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("prototype"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("__proto__"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("===")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Super")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("prototype"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// true")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//ES5")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("function")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("Super")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("function")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("Sub")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Sub")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("prototype "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Super")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Sub")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("prototype"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("constructor "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" Sub"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("var")]),s._v(" sub "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Sub")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\nSub"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("__proto__ "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("===")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Function")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("prototype"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//true")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br"),t("span",{staticClass:"line-number"},[s._v("16")]),t("br"),t("span",{staticClass:"line-number"},[s._v("17")]),t("br"),t("span",{staticClass:"line-number"},[s._v("18")]),t("br"),t("span",{staticClass:"line-number"},[s._v("19")]),t("br")])]),t("h3",{attrs:{id:"_8、es6和es5子类this生成顺序不同。es5的继承是先生成子类实例-再调用父类的构造函数修饰子类实例-es6的继承是先生成父类实例-再调用子类的构造函数修饰父类实例。"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_8、es6和es5子类this生成顺序不同。es5的继承是先生成子类实例-再调用父类的构造函数修饰子类实例-es6的继承是先生成父类实例-再调用子类的构造函数修饰父类实例。"}},[s._v("#")]),s._v(" 8、ES6和ES5子类"),t("code",[s._v("this")]),s._v("生成顺序不同。ES5的继承是先生成子类实例，再调用父类的构造函数修饰子类实例；ES6的继承是先生成父类实例，再调用子类的构造函数修饰父类实例。")]),s._v(" "),t("h3",{attrs:{id:"_9、es5的继承是通过call或者apply回调方法调用父类。es6是通过super-来调用父类。"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_9、es5的继承是通过call或者apply回调方法调用父类。es6是通过super-来调用父类。"}},[s._v("#")]),s._v(" 9、ES5的继承是通过"),t("code",[s._v("call")]),s._v("或者"),t("code",[s._v("apply")]),s._v("回调方法调用父类。ES6是通过super()来调用父类。")])])}),[],!1,null,null,null);t.default=e.exports}}]);