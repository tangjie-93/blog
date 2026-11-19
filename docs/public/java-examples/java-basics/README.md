# Java基础学习项目

这是一个面向前端开发者的Java基础学习项目，包含了Java语言基础阶段的所有核心知识点。

## 📚 项目结构

```
java-basics/
├── pom.xml                                    # Maven配置文件
└── src/main/java/learn/
    ├── JavaBasicsApplication.java            # 主入口类
    ├── syntax/                               # 基础语法
    │   ├── DataTypesDemo.java               # 数据类型
    │   ├── OperatorsDemo.java               # 运算符
    │   ├── ControlFlowDemo.java             # 流程控制
    │   └── ArraysDemo.java                  # 数组
    ├── oop/                                  # 面向对象
    │   ├── ClassDemo.java                   # 类与对象
    │   ├── EncapsulationDemo.java           # 封装
    │   ├── InheritanceDemo.java             # 继承
    │   ├── PolymorphismDemo.java            # 多态
    │   └── InterfaceDemo.java               # 接口
    ├── exception/                            # 异常处理
    │   └── ExceptionDemo.java               # 异常处理
    ├── collection/                           # 集合框架
    │   └── CollectionDemo.java              # 集合框架
    ├── generic/                              # 泛型
    │   └── GenericDemo.java                 # 泛型
    ├── io/                                   # IO流
    │   └── IODemo.java                      # IO流
    ├── reflect/                              # 反射和注解
    │   └── ReflectionDemo.java              # 反射和注解
    ├── lambda/                               # Lambda和Stream
    │   └── LambdaStreamDemo.java            # Lambda和Stream API
    └── concurrent/                           # 并发编程
        └── ConcurrencyDemo.java             # 并发编程
```

##  快速开始

### 前置要求

1. **JDK 17+** - 推荐使用LTS版本
   - 下载地址：https://adoptium.net/
   - 验证安装：`java -version`

2. **Maven 3.6+** - 构建工具
   - 下载地址：https://maven.apache.org/download.cgi
   - 验证安装：`mvn -version`

3. **IDE** - 推荐使用IntelliJ IDEA
   - 下载地址：https://www.jetbrains.com/idea/download/
   - 也可以使用VSCode + Java扩展包

### 运行方式

#### 方式1：使用Maven命令行

```bash
# 编译项目
mvn clean compile

# 运行主程序（交互式菜单）
mvn exec:java

# 运行单个Demo（示例）
mvn exec:java -Dexec.mainClass="learn.syntax.DataTypesDemo"
```

#### 方式2：使用IDE

1. 用IntelliJ IDEA打开项目（File -> Open -> 选择java-basics目录）
2. 等待Maven自动下载依赖
3. 找到任意Demo文件的`main`方法
4. 右键点击 -> Run 'ClassName.main()'

#### 方式3：运行主入口类

运行`JavaBasicsApplication.java`，会出现交互式菜单，可以选择运行不同的Demo。

## 📖 学习路线

### 第1周：基础语法

1. **数据类型** (`DataTypesDemo.java`)
   - 基本数据类型（8种）
   - 引用数据类型
   - 类型转换
   - 包装类
   - 前端对比：JS的弱类型 vs Java的强类型

2. **运算符** (`OperatorsDemo.java`)
   - 算术运算符
   - 关系运算符
   - 逻辑运算符
   - 位运算符
   - 前端对比：JS的=== vs Java的==

3. **流程控制** (`ControlFlowDemo.java`)
   - if-else
   - switch（包括JDK 14+的新语法）
   - for循环（包括增强for）
   - while循环
   - break和continue

4. **数组** (`ArraysDemo.java`)
   - 数组声明和初始化
   - 数组遍历
   - 多维数组
   - Arrays工具类
   - 前端对比：JS的Array vs Java的数组

### 第2周：面向对象

5. **类与对象** (`ClassDemo.java`)
   - 类的定义
   - 构造方法
   - this关键字
   - 方法重载
   - static关键字
   - 访问控制

6. **封装** (`EncapsulationDemo.java`)
   - getter和setter
   - 私有方法
   - 访问控制修饰符
   - 前端对比：JS的#私有字段

7. **继承** (`InheritanceDemo.java`)
   - extends关键字
   - super关键字
   - 方法重写
   - 抽象类
   - final关键字

8. **多态** (`PolymorphismDemo.java`)
   - 向上转型和向下转型
   - instanceof
   - 多态数组
   - 多态参数

9. **接口** (`InterfaceDemo.java`)
   - interface定义
   - 默认方法
   - 静态方法
   - 函数式接口
   - 接口 vs 抽象类

### 第3周：核心特性

10. **异常处理** (`ExceptionDemo.java`)
    - try-catch-finally
    - 自定义异常
    - throws和throw
    - 异常链
    - try-with-resources

11. **集合框架** (`CollectionDemo.java`)
    - List（ArrayList、LinkedList）
    - Set（HashSet、TreeSet）
    - Map（HashMap、TreeMap）
    - Collections工具类
    - 前端对比：JS的Array/Object/Map/Set

12. **泛型** (`GenericDemo.java`)
    - 泛型类
    - 泛型方法
    - 泛型接口
    - 类型限定
    - 通配符

13. **IO流** (`IODemo.java`)
    - 字节流和字符流
    - 缓冲流
    - NIO（Files、Path）
    - 对象序列化

14. **反射和注解** (`ReflectionDemo.java`)
    - 获取Class对象
    - 动态创建对象
    - 动态访问字段和方法
    - 自定义注解
    - 注解处理

15. **Lambda和Stream API** (`LambdaStreamDemo.java`)
    - Lambda表达式
    - 方法引用
    - Stream创建和操作
    - Optional
    - 函数式接口
    - 前端对比：JS的Array方法 vs Java Stream

16. **并发编程** (`ConcurrencyDemo.java`)
    - 创建线程
    - 线程安全
    - synchronized和Lock
    - 线程池
    - CompletableFuture
    - 并发集合
    - 前端对比：JS的单线程 vs Java的多线程

## 💡 学习建议

### 1. 对比学习法

每个Demo都包含了与JavaScript/TypeScript的对比，利用你的前端经验加速理解：

| 前端概念 | Java对应 |
|---------|---------|
| `let`/`const` | 变量声明（必须指定类型） |
| `Array` | `ArrayList` |
| `Object` | `HashMap` |
| `Promise` | `CompletableFuture` |
| `async/await` | `Future.get()` |
| `.then()` | `.thenApply()` |
| `class` | `class`（但更严格） |
| `interface` | `interface`（更强大） |

### 2. 动手实践

- **不要只看代码**：每个Demo都要亲手运行
- **修改代码**：尝试修改参数，观察输出变化
- **写小练习**：学完一个知识点后，自己写一个小例子

### 3. 理解差异

重点关注Java与JavaScript的核心差异：

- **类型系统**：强类型 vs 弱类型
- **编译执行**：先编译后执行 vs 解释执行
- **并发模型**：多线程 vs 单线程+事件循环
- **内存管理**：JVM vs V8引擎

### 4. 循序渐进

按照以下顺序学习：

1. 基础语法（第1周）→ 理解Java的基本写法
2. 面向对象（第2周）→ 掌握Java的核心思想
3. 核心特性（第3周）→ 熟练使用Java的各种工具

### 5. 常见问题

**Q: 为什么要学Java？**
A: Java是后端开发的主流语言，生态完善，就业面广。

**Q: Java和JavaScript有什么关系？**
A: 除了名字相似，几乎没有关系。语法、设计理念都不同。

**Q: 需要学多久？**
A: 作为前端开发者，有编程基础，认真学2-3周可以掌握基础。

**Q: 学完这些能做什么？**
A: 可以开始学习Spring Boot，开发Web后端应用。

## 🔧 故障排查

### 问题1：编译失败

```bash
# 清理并重新编译
mvn clean compile
```

### 问题2：找不到主类

确保JDK版本是17+：
```bash
java -version
```

### 问题3：IDE无法识别项目

IntelliJ IDEA：
1. File -> Invalidate Caches / Restart
2. 重新导入Maven项目

VSCode：
1. 安装Java Extension Pack
2. 重新加载窗口

## 📝 下一步

完成本阶段学习后，可以继续学习：

1. **阶段二：数据库与持久层**
   - MySQL
   - JDBC
   - MyBatis

2. **阶段三：Web开发基础**
   - Servlet
   - Spring Framework
   - Spring MVC

3. **阶段四：Spring Boot**
   - 自动配置
   - RESTful API
   - Spring Security

## 📚 参考资源

- [Java官方文档](https://docs.oracle.com/en/java/)
- [Spring官方文档](https://spring.io/projects)
- [Baeldung教程](https://www.baeldung.com/)
- [JavaGuide](https://javaguide.cn/)

## 🤝 贡献

如果你发现任何错误或有任何改进建议，欢迎提出Issue或Pull Request。

---

**祝你学习愉快！从前端到后端，开启新的技术旅程！** 🚀
