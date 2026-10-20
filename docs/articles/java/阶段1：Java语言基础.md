---
title: 阶段一：Java 语言基础
date: '2026-10-19'
type: 技术
tags: Java|基础
note: Java 语言、面向对象、集合、异常和并发基础。
---

# 阶段一：Java语言基础（2-3周）

> 作为资深前端开发者，你已经具备编程思维和工程经验。本阶段重点是掌握Java与JavaScript的核心差异，建立Java编程思维。

---

## 1.1 开发环境搭建（第1-2天）

### 1.1.1 JDK安装与配置

**推荐版本：JDK 17 LTS（长期支持版）**

#### Windows环境配置
1. 下载JDK 17：[Oracle官网](https://www.oracle.com/java/technologies/downloads/) 或 [Adoptium](https://adoptium.net/)
2. 安装到指定目录，如 `C:\Program Files\Java\jdk-17`
3. 配置环境变量：
   - `JAVA_HOME` = `C:\Program Files\Java\jdk-17`
   - `Path` 添加 `%JAVA_HOME%\bin`
4. 验证安装：
```bash
java -version
javac -version
```

#### 理解Java编译运行机制
```
源代码 (.java) → 编译器 (javac) → 字节码 (.class) → JVM执行
```

**与前端对比：**
| 前端 | Java |
|------|------|
| JS解释执行 | Java先编译后执行 |
| 浏览器/Node.js | JVM |
| npm/yarn | Maven/Gradle |
| package.json | pom.xml / build.gradle |

### 1.1.2 IDE选择与配置

**推荐：IntelliJ IDEA**

#### 版本选择
- **Community版**：免费，适合入门学习
- **Ultimate版**：付费，支持Spring、数据库等高级功能

#### 必备插件
- Lombok：简化代码
- Maven Helper：依赖分析
- .ignore：Git忽略文件生成
- Rainbow Brackets：彩色括号
- Translation：翻译插件

#### IDEA常用快捷键（对比VSCode）
| 功能 | VSCode | IDEA |
|------|--------|------|
| 搜索文件 | Ctrl+P | Ctrl+Shift+N |
| 全局搜索 | Ctrl+Shift+F | Ctrl+Shift+F |
| 格式化代码 | Alt+Shift+F | Ctrl+Alt+L |
| 快速修复 | Ctrl+. | Alt+Enter |
| 运行 | F5 | Shift+F10 |
| 调试 | F5 | Shift+F9 |

### 1.1.3 Maven构建工具

#### 什么是Maven
Maven是Java项目的构建和依赖管理工具，类比前端的npm。

#### 安装与配置
1. 下载：[Maven官网](https://maven.apache.org/download.cgi)
2. 解压到指定目录
3. 配置环境变量：
   - `MAVEN_HOME` = Maven安装目录
   - `Path` 添加 `%MAVEN_HOME%\bin`
4. 配置本地仓库（settings.xml）：
```xml
<localRepository>D:\maven-repo</localRepository>

<!-- 配置阿里云镜像加速 -->
<mirrors>
  <mirror>
    <id>aliyun</id>
    <mirrorOf>central</mirrorOf>
    <url>https://maven.aliyun.com/repository/public</url>
  </mirror>
</mirrors>
```

#### Maven项目结构
```
my-project/
├── pom.xml                 # 项目配置（类比package.json）
├── src/
│   ├── main/
│   │   ├── java/          # Java源代码
│   │   └── resources/     # 配置文件
│   └── test/
│       └── java/          # 测试代码
└── target/                # 编译输出（类比dist）
```

#### pom.xml核心配置
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- 项目坐标（类比npm的name+version） -->
    <groupId>com.example</groupId>
    <artifactId>my-project</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <!-- 属性配置 -->
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <!-- 依赖管理（类比dependencies） -->
    <dependencies>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
    </dependencies>
</project>
```

#### Maven常用命令
```bash
mvn clean              # 清理target目录
mvn compile            # 编译主代码
mvn test               # 运行测试
mvn package            # 打包（jar/war）
mvn install            # 安装到本地仓库
mvn dependency:tree    # 查看依赖树（类比npm ls）
```

### 1.1.4 Gradle（了解）

Gradle是更现代的构建工具，使用Groovy/Kotlin DSL，Spring Boot官方推荐。

#### build.gradle.kts示例
```kotlin
plugins {
    java
}

group = "com.example"
version = "1.0.0"

java {
    sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("mysql:mysql-connector-java:8.0.33")
    testImplementation("org.junit.jupiter:junit-jupiter:5.9.0")
}
```

---

## 1.2 Java基础语法（第3-7天）

### 1.2.1 数据类型

#### 基本数据类型（8种）

```java
// 整数类型
byte b = 127;              // 1字节，-128~127
short s = 32767;           // 2字节
int i = 2147483647;        // 4字节（最常用）
long l = 9223372036854775807L;  // 8字节

// 浮点类型
float f = 3.14f;           // 4字节
double d = 3.141592653589793;  // 8字节（最常用）

// 字符类型
char c = 'A';              // 2字节，Unicode编码

// 布尔类型
boolean flag = true;       // true/false
```

**与JS对比：**
| JS | Java |
|----|------|
| number（统一） | byte/short/int/long/float/double |
| string | String（引用类型） |
| boolean | boolean |
| 无 | char |

#### 引用数据类型

```java
// 字符串（不是基本类型！）
String str = "Hello Java";
String str2 = new String("Hello Java");

// 数组
int[] arr = {1, 2, 3, 4, 5};
String[] names = new String[10];

// 类、接口等
Object obj = new Object();
```

### 1.2.2 变量与常量

```java
// 变量声明（必须指定类型，强类型）
int age = 25;
String name = "张三";
final double PI = 3.14159;  // 常量，不可修改

// 类型推断（JDK 10+，类似JS的let）
var list = new ArrayList<String>();  // 自动推断为ArrayList<String>
var message = "Hello";  // 自动推断为String
```

### 1.2.3 类型转换

```java
// 自动类型转换（小→大）
int i = 100;
long l = i;      // int自动转为long
double d = i;    // int自动转为double

// 强制类型转换（大→小，可能丢失精度）
double d2 = 3.14;
int i2 = (int) d2;  // 强制转换，i2 = 3

// 字符串与其他类型转换
String numStr = "123";
int num = Integer.parseInt(numStr);  // 字符串→int
String str = String.valueOf(num);    // int→字符串
String str2 = num + "";              // 另一种方式
```

### 1.2.4 运算符

```java
// 算术运算符（与JS基本一致）
int a = 10, b = 3;
System.out.println(a + b);   // 13
System.out.println(a - b);   // 7
System.out.println(a * b);   // 30
System.out.println(a / b);   // 3（整数除法，截断小数）
System.out.println(a % b);   // 1（取余）

// 关系运算符
System.out.println(a > b);   // true
System.out.println(a == b);  // false
System.out.println(a != b);  // true

// 逻辑运算符
boolean x = true, y = false;
System.out.println(x && y);  // false（短路与）
System.out.println(x || y);  // true（短路或）
System.out.println(!x);      // false（非）

// 三元运算符
int max = (a > b) ? a : b;

// 注意：Java没有===，==比较的是值（基本类型）或引用（引用类型）
String s1 = new String("hello");
String s2 = new String("hello");
System.out.println(s1 == s2);      // false（引用不同）
System.out.println(s1.equals(s2)); // true（值相等）
```

### 1.2.5 流程控制

```java
// if-else（与JS一致）
int score = 85;
if (score >= 90) {
    System.out.println("优秀");
} else if (score >= 80) {
    System.out.println("良好");
} else {
    System.out.println("一般");
}

// switch（JDK 14+增强版）
String day = "MONDAY";
String type = switch (day) {
    case "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY" -> "工作日";
    case "SATURDAY", "SUNDAY" -> "周末";
    default -> "未知";
};

// for循环
for (int i = 0; i < 10; i++) {
    System.out.println(i);
}

// 增强for循环（类似JS的for...of）
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}

// while循环
int count = 0;
while (count < 5) {
    System.out.println(count);
    count++;
}

// do-while循环
int n = 0;
do {
    System.out.println(n);
    n++;
} while (n < 5);
```

### 1.2.6 数组

```java
// 一维数组
int[] arr1 = {1, 2, 3, 4, 5};           // 静态初始化
int[] arr2 = new int[10];               // 动态初始化，默认值为0
int[] arr3 = new int[]{1, 2, 3};        // 匿名数组

// 访问数组
System.out.println(arr1[0]);            // 1
System.out.println(arr1.length);        // 5（数组长度，不是length()）

// 二维数组
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
System.out.println(matrix[1][2]);       // 6

// 数组常用操作
import java.util.Arrays;

int[] arr = {5, 2, 8, 1, 9};
Arrays.sort(arr);                       // 排序
System.out.println(Arrays.toString(arr)); // [1, 2, 5, 8, 9]

int index = Arrays.binarySearch(arr, 5); // 二分查找
int[] copy = Arrays.copyOf(arr, 10);     // 复制数组
```

**与JS数组对比：**
| JS | Java |
|----|------|
| `arr.length` | `arr.length`（属性不是方法） |
| `arr.push()` | 不支持动态扩容，需用ArrayList |
| `arr.map()` | Stream API |
| `arr.filter()` | Stream API |
| `arr.find()` | Stream API |

---

## 1.3 面向对象编程（第8-12天）

### 1.3.1 类与对象

```java
// 定义类
public class Person {
    // 属性（成员变量）
    private String name;
    private int age;
    
    // 构造方法（与类名同名，无返回类型）
    public Person() {
        // 无参构造
    }
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // 方法
    public void sayHello() {
        System.out.println("Hello, I'm " + name);
    }
    
    // Getter和Setter（封装）
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public int getAge() {
        return age;
    }
    
    public void setAge(int age) {
        if (age > 0 && age < 150) {
            this.age = age;
        }
    }
    
    // toString方法（类似JS的toString）
    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
}

// 使用类
Person person = new Person("张三", 25);
person.sayHello();
System.out.println(person.getName());
```

### 1.3.2 封装

```java
public class BankAccount {
    private String accountNo;    // 私有属性
    private double balance;
    
    public BankAccount(String accountNo, double initialBalance) {
        this.accountNo = accountNo;
        if (initialBalance >= 0) {
            this.balance = initialBalance;
        }
    }
    
    // 公共方法控制访问
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("存款成功，余额：" + balance);
        }
    }
    
    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("取款成功，余额：" + balance);
        } else {
            System.out.println("取款失败，余额不足");
        }
    }
    
    public double getBalance() {
        return balance;
    }
}
```

### 1.3.3 继承

```java
// 父类
public class Animal {
    protected String name;  // protected可被子类访问
    
    public Animal(String name) {
        this.name = name;
    }
    
    public void eat() {
        System.out.println(name + "正在吃东西");
    }
    
    public void sleep() {
        System.out.println(name + "正在睡觉");
    }
}

// 子类继承父类
public class Dog extends Animal {
    private String breed;
    
    public Dog(String name, String breed) {
        super(name);  // 调用父类构造方法
        this.breed = breed;
    }
    
    // 子类特有方法
    public void bark() {
        System.out.println(name + "在汪汪叫");
    }
    
    // 方法重写（Override）
    @Override
    public void eat() {
        System.out.println(name + "正在啃骨头");
    }
    
    @Override
    public String toString() {
        return "Dog{name='" + name + "', breed='" + breed + "'}";
    }
}

// 使用
Dog dog = new Dog("旺财", "中华田园犬");
dog.eat();    // 调用重写后的方法
dog.bark();   // 调用子类特有方法
```

### 1.3.4 多态

```java
public class PolymorphismDemo {
    public static void main(String[] args) {
        // 父类引用指向子类对象
        Animal animal1 = new Dog("旺财", "田园犬");
        Animal animal2 = new Cat("咪咪", "波斯猫");
        
        // 多态：同一方法，不同表现
        animal1.eat();  // 旺财正在啃骨头
        animal2.eat();  // 咪咪正在吃鱼
        
        //  instanceof 判断类型
        if (animal1 instanceof Dog) {
            Dog dog = (Dog) animal1;  // 向下转型
            dog.bark();
        }
        
        // JDK 16+ 模式匹配
        if (animal1 instanceof Dog dog) {
            dog.bark();  // 自动转型
        }
    }
    
    // 多态作为方法参数
    public static void makeAnimalEat(Animal animal) {
        animal.eat();
    }
}
```

### 1.3.5 抽象类

```java
// 抽象类
public abstract class Shape {
    protected String color;
    
    public Shape(String color) {
        this.color = color;
    }
    
    // 抽象方法：只有声明，没有实现
    public abstract double getArea();
    public abstract double getPerimeter();
    
    // 普通方法
    public void display() {
        System.out.println("颜色：" + color + ", 面积：" + getArea());
    }
}

// 子类必须实现抽象方法
public class Circle extends Shape {
    private double radius;
    
    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }
    
    @Override
    public double getArea() {
        return Math.PI * radius * radius;
    }
    
    @Override
    public double getPerimeter() {
        return 2 * Math.PI * radius;
    }
}

public class Rectangle extends Shape {
    private double width;
    private double height;
    
    public Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }
    
    @Override
    public double getArea() {
        return width * height;
    }
    
    @Override
    public double getPerimeter() {
        return 2 * (width + height);
    }
}
```

### 1.3.6 接口

```java
// 定义接口（JDK 8+）
public interface Flyable {
    // 抽象方法（默认public abstract）
    void fly();
    
    // 默认方法（JDK 8+）
    default void land() {
        System.out.println("正在降落");
    }
    
    // 静态方法
    static void checkWeather() {
        System.out.println("检查天气是否适合飞行");
    }
}

public interface Swimmable {
    void swim();
}

// 类可以实现多个接口（弥补单继承的不足）
public class Duck extends Animal implements Flyable, Swimmable {
    public Duck(String name) {
        super(name);
    }
    
    @Override
    public void fly() {
        System.out.println(name + "正在飞");
    }
    
    @Override
    public void swim() {
        System.out.println(name + "正在游泳");
    }
}
```

**接口 vs 抽象类：**
| 特性 | 接口 | 抽象类 |
|------|------|--------|
| 继承 | 多实现 | 单继承 |
| 构造方法 | 无 | 有 |
| 成员变量 | 只能public static final | 各种类型 |
| 方法 | 抽象/默认/静态 | 抽象/普通 |
| 适用场景 | 定义行为规范 | 代码复用 |

### 1.3.7 内部类

```java
public class OuterClass {
    private String outerField = "外部类属性";
    
    // 成员内部类
    public class InnerClass {
        public void display() {
            System.out.println(outerField);  // 可访问外部类私有成员
        }
    }
    
    // 静态内部类
    public static class StaticInnerClass {
        public void display() {
            System.out.println("静态内部类");
        }
    }
    
    // 局部内部类（方法内）
    public void method() {
        class LocalInnerClass {
            public void show() {
                System.out.println("局部内部类");
            }
        }
        new LocalInnerClass().show();
    }
    
    // 匿名内部类（常用）
    public void test() {
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                System.out.println("匿名内部类");
            }
        };
        runnable.run();
    }
}
```

---

## 1.4 异常处理（第13天）

### 1.4.1 异常体系

```
Throwable
├── Error（严重错误，程序无法处理）
│   ├── OutOfMemoryError
│   └── StackOverflowError
└── Exception（异常，可处理）
    ├── RuntimeException（运行时异常，非检查异常）
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── ClassCastException
    │   └── ArithmeticException
    └── 其他Exception（检查异常，必须处理）
        ├── IOException
        ├── SQLException
        └── FileNotFoundException
```

### 1.4.2 异常处理语法

```java
public class ExceptionDemo {
    
    // 检查异常：必须处理（throws或try-catch）
    public void readFile(String path) throws IOException {
        FileReader reader = new FileReader(path);
        int ch = reader.read();
        reader.close();
    }
    
    // 运行时异常：可以不处理
    public void divide(int a, int b) {
        int result = a / b;  // b=0时抛出ArithmeticException
    }
    
    // try-catch-finally
    public void processFile() {
        FileReader reader = null;
        try {
            reader = new FileReader("test.txt");
            int ch = reader.read();
            System.out.println((char) ch);
        } catch (FileNotFoundException e) {
            System.out.println("文件不存在");
        } catch (IOException e) {
            System.out.println("读取失败");
        } finally {
            // finally块总是执行，用于资源释放
            try {
                if (reader != null) {
                    reader.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
    
    // JDK 7+ try-with-resources（自动关闭资源）
    public void processFileModern() {
        try (FileReader reader = new FileReader("test.txt")) {
            int ch = reader.read();
            System.out.println((char) ch);
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 自动调用reader.close()
    }
    
    // 多异常捕获（JDK 7+）
    public void multiCatch() {
        try {
            // 可能抛出多种异常
        } catch (IOException | SQLException e) {
            System.out.println("发生异常：" + e.getMessage());
        }
    }
}
```

### 1.4.3 自定义异常

```java
// 自定义检查异常
public class InsufficientBalanceException extends Exception {
    private double balance;
    private double amount;
    
    public InsufficientBalanceException(double balance, double amount) {
        super("余额不足，当前余额：" + balance + "，取款金额：" + amount);
        this.balance = balance;
        this.amount = amount;
    }
    
    public double getBalance() {
        return balance;
    }
    
    public double getAmount() {
        return amount;
    }
}

// 自定义运行时异常
public class InvalidAgeException extends RuntimeException {
    public InvalidAgeException(String message) {
        super(message);
    }
}

// 使用自定义异常
public class BankAccount {
    private double balance;
    
    public void withdraw(double amount) throws InsufficientBalanceException {
        if (amount > balance) {
            throw new InsufficientBalanceException(balance, amount);
        }
        balance -= amount;
    }
}
```

---

## 1.5 集合框架（第14-16天）

### 1.5.1 集合体系结构

```
Collection（接口）
├── List（有序、可重复）
│   ├── ArrayList（数组实现，查询快）
│   ├── LinkedList（链表实现，增删快）
│   └── Vector（线程安全，已过时）
├── Set（无序、不可重复）
│   ├── HashSet（哈希表）
│   ├── LinkedHashSet（保持插入顺序）
│   └── TreeSet（排序）
└── Queue（队列）
    ├── LinkedList
    ├── PriorityQueue
    └── ArrayDeque

Map（接口，键值对）
├── HashMap（数组+链表+红黑树）
├── LinkedHashMap（保持插入顺序）
├── TreeMap（排序）
└── Hashtable（线程安全，已过时）
```

### 1.5.2 List使用

```java
import java.util.*;

public class ListDemo {
    public static void main(String[] args) {
        // ArrayList（最常用）
        List<String> list = new ArrayList<>();
        
        // 添加元素
        list.add("Java");
        list.add("Python");
        list.add("JavaScript");
        list.add(1, "Go");  // 指定位置插入
        
        // 获取元素
        String first = list.get(0);  // Java
        
        // 修改元素
        list.set(0, "Java17");
        
        // 删除元素
        list.remove("Python");       // 按值删除
        list.remove(0);              // 按索引删除
        
        // 遍历
        // 方式1：for循环
        for (int i = 0; i < list.size(); i++) {
            System.out.println(list.get(i));
        }
        
        // 方式2：增强for
        for (String item : list) {
            System.out.println(item);
        }
        
        // 方式3：迭代器
        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }
        
        // 方式4：Lambda（JDK 8+）
        list.forEach(item -> System.out.println(item));
        list.forEach(System.out::println);  // 方法引用
        
        // 常用方法
        int size = list.size();          // 大小
        boolean contains = list.contains("Java");  // 是否包含
        int index = list.indexOf("Java");  // 索引
        boolean empty = list.isEmpty();    // 是否为空
        
        // 排序
        List<Integer> numbers = new ArrayList<>(Arrays.asList(5, 2, 8, 1, 9));
        Collections.sort(numbers);           // 自然排序
        numbers.sort(Comparator.reverseOrder());  // 降序
        
        // 自定义对象排序
        List<Person> persons = new ArrayList<>();
        persons.sort(Comparator.comparingInt(Person::getAge));
    }
}
```

### 1.5.3 Set使用

```java
public class SetDemo {
    public static void main(String[] args) {
        // HashSet（无序、去重）
        Set<String> set = new HashSet<>();
        set.add("Java");
        set.add("Python");
        set.add("Java");  // 重复元素，添加失败
        System.out.println(set.size());  // 2
        
        // 遍历
        for (String item : set) {
            System.out.println(item);
        }
        
        // LinkedHashSet（保持插入顺序）
        Set<String> linkedSet = new LinkedHashSet<>();
        linkedSet.add("C");
        linkedSet.add("A");
        linkedSet.add("B");
        System.out.println(linkedSet);  // [C, A, B]
        
        // TreeSet（排序）
        Set<String> treeSet = new TreeSet<>();
        treeSet.add("C");
        treeSet.add("A");
        treeSet.add("B");
        System.out.println(treeSet);  // [A, B, C]
    }
}
```

### 1.5.4 Map使用

```java
public class MapDemo {
    public static void main(String[] args) {
        // HashMap（最常用）
        Map<String, Integer> map = new HashMap<>();
        
        // 添加键值对
        map.put("张三", 25);
        map.put("李四", 30);
        map.put("王五", 28);
        
        // 获取值
        Integer age = map.get("张三");  // 25
        Integer defaultAge = map.getOrDefault("赵六", 0);  // 0
        
        // 判断
        boolean hasKey = map.containsKey("张三");
        boolean hasValue = map.containsValue(25);
        
        // 删除
        map.remove("李四");
        
        // 修改
        map.put("张三", 26);  // 覆盖原值
        
        // 遍历
        // 方式1：entrySet
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // 方式2：keySet
        for (String key : map.keySet()) {
            System.out.println(key + ": " + map.get(key));
        }
        
        // 方式3：Lambda
        map.forEach((k, v) -> System.out.println(k + ": " + v));
        
        // 大小
        int size = map.size();
    }
}
```

### 1.5.5 Collections工具类

```java
public class CollectionsDemo {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(Arrays.asList(5, 2, 8, 1, 9));
        
        // 排序
        Collections.sort(list);
        Collections.sort(list, Comparator.reverseOrder());
        
        // 洗牌
        Collections.shuffle(list);
        
        // 最值
        int max = Collections.max(list);
        int min = Collections.min(list);
        
        // 频率
        int count = Collections.frequency(list, 5);
        
        // 不可变集合
        List<String> immutable = Collections.unmodifiableList(list);
        // immutable.add("test");  // 抛出UnsupportedOperationException
        
        // JDK 9+ 创建不可变集合
        List<String> list2 = List.of("A", "B", "C");
        Set<String> set2 = Set.of("A", "B", "C");
        Map<String, Integer> map2 = Map.of("A", 1, "B", 2);
    }
}
```

---

## 1.6 泛型（第17天）

### 1.6.1 泛型类

```java
// 泛型类
public class Box<T> {
    private T content;
    
    public void put(T item) {
        this.content = item;
    }
    
    public T get() {
        return content;
    }
}

// 使用
Box<String> stringBox = new Box<>();
stringBox.put("Hello");
String str = stringBox.get();  // 不需要强制转换

Box<Integer> intBox = new Box<>();
intBox.put(100);
int num = intBox.get();

// 多泛型参数
public class Pair<K, V> {
    private K key;
    private V value;
    
    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }
    
    public K getKey() { return key; }
    public V getValue() { return value; }
}

Pair<String, Integer> pair = new Pair<>("age", 25);
```

### 1.6.2 泛型方法

```java
public class GenericMethodDemo {
    
    // 泛型方法
    public <T> void printArray(T[] array) {
        for (T item : array) {
            System.out.println(item);
        }
    }
    
    // 返回泛型
    public <T> T getFirst(List<T> list) {
        return list.isEmpty() ? null : list.get(0);
    }
    
    // 多泛型参数
    public <K, V> void printKeyValue(K key, V value) {
        System.out.println(key + ": " + value);
    }
    
    // 使用
    public static void main(String[] args) {
        GenericMethodDemo demo = new GenericMethodDemo();
        
        String[] strArr = {"A", "B", "C"};
        demo.printArray(strArr);
        
        Integer[] intArr = {1, 2, 3};
        demo.printArray(intArr);
        
        List<String> list = Arrays.asList("X", "Y", "Z");
        String first = demo.getFirst(list);
    }
}
```

### 1.6.3 泛型限定

```java
public class GenericBoundDemo {
    
    // 上界：T必须是Number或其子类
    public <T extends Number> double sum(List<T> list) {
        double sum = 0;
        for (T num : list) {
            sum += num.doubleValue();
        }
        return sum;
    }
    
    // 多上界
    public <T extends Comparable & Serializable> void test(T t) {
        // T必须同时实现Comparable和Serializable
    }
    
    // 下界（通配符）
    public void addIntegers(List<? super Integer> list) {
        list.add(1);
        list.add(2);
        list.add(3);
    }
    
    // 无界通配符
    public void printList(List<?> list) {
        for (Object item : list) {
            System.out.println(item);
        }
    }
}
```

---

## 1.7 IO流（第18-19天）

### 1.7.1 IO流分类

```
按方向分：
- 输入流（InputStream/Reader）：从文件读取数据
- 输出流（OutputStream/Writer）：向文件写入数据

按数据类型分：
- 字节流（InputStream/OutputStream）：处理二进制数据（图片、视频等）
- 字符流（Reader/Writer）：处理文本数据

按功能分：
- 节点流：直接连接数据源
- 处理流：在节点流基础上增强功能
```

### 1.7.2 字节流

```java
import java.io.*;

public class ByteStreamDemo {
    
    // 文件输入流
    public void readFile() throws IOException {
        InputStream in = new FileInputStream("test.txt");
        
        // 方式1：单字节读取
        int b;
        while ((b = in.read()) != -1) {
            System.out.print((char) b);
        }
        
        // 方式2：批量读取（推荐）
        byte[] buffer = new byte[1024];
        int len;
        while ((len = in.read(buffer)) != -1) {
            System.out.print(new String(buffer, 0, len));
        }
        
        in.close();
    }
    
    // 文件输出流
    public void writeFile() throws IOException {
        OutputStream out = new FileOutputStream("output.txt");
        
        String content = "Hello, Java IO!";
        out.write(content.getBytes("UTF-8"));
        
        out.close();
    }
    
    // 文件复制
    public void copyFile(String src, String dest) throws IOException {
        try (InputStream in = new FileInputStream(src);
             OutputStream out = new FileOutputStream(dest)) {
            
            byte[] buffer = new byte[1024];
            int len;
            while ((len = in.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }
        }
    }
}
```

### 1.7.3 字符流

```java
public class CharStreamDemo {
    
    // 字符输入流
    public void readText() throws IOException {
        try (Reader reader = new FileReader("test.txt", StandardCharsets.UTF_8)) {
            int ch;
            while ((ch = reader.read()) != -1) {
                System.out.print((char) ch);
            }
        }
    }
    
    // 字符输出流
    public void writeText() throws IOException {
        try (Writer writer = new FileWriter("output.txt", StandardCharsets.UTF_8)) {
            writer.write("Hello, 你好世界！");
        }
    }
    
    // 缓冲流（提高性能）
    public void bufferedRead() throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new FileReader("test.txt", StandardCharsets.UTF_8))) {
            
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        }
    }
    
    // PrintWriter（方便的打印方法）
    public void printWrite() throws IOException {
        try (PrintWriter out = new PrintWriter(
                new FileWriter("output.txt", StandardCharsets.UTF_8))) {
            out.println("姓名：张三");
            out.println("年龄：25");
            out.printf("分数：%.2f%n", 85.5);
        }
    }
}
```

### 1.7.4 对象序列化

```java
// 实现Serializable接口
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String username;
    private transient String password;  // transient修饰的字段不参与序列化
    private int age;
    
    // 构造方法、getter、setter省略
}

public class ObjectStreamDemo {
    
    // 序列化：对象→字节
    public void serialize(User user) throws IOException {
        try (ObjectOutputStream out = new ObjectOutputStream(
                new FileOutputStream("user.dat"))) {
            out.writeObject(user);
        }
    }
    
    // 反序列化：字节→对象
    public User deserialize() throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new ObjectInputStream(
                new FileInputStream("user.dat"))) {
            return (User) in.readObject();
        }
    }
}
```

### 1.7.5 NIO（New IO）

```java
import java.nio.*;
import java.nio.file.*;
import java.nio.channels.*;

public class NioDemo {
    
    // Path和Files（JDK 7+，推荐）
    public void fileOperations() throws IOException {
        Path path = Paths.get("test.txt");
        
        // 读取所有行
        List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
        
        // 读取所有字节
        byte[] bytes = Files.readAllBytes(path);
        
        // 写入
        Files.write(path, "Hello NIO".getBytes(StandardCharsets.UTF_8));
        
        // 复制文件
        Files.copy(Paths.get("src.txt"), Paths.get("dest.txt"), 
                   StandardCopyOption.REPLACE_EXISTING);
        
        // 移动文件
        Files.move(Paths.get("old.txt"), Paths.get("new.txt"));
        
        // 删除文件
        Files.deleteIfExists(Paths.get("test.txt"));
        
        // 判断
        boolean exists = Files.exists(path);
        boolean isDir = Files.isDirectory(path);
        boolean isFile = Files.isRegularFile(path);
        
        // 遍历目录
        try (Stream<Path> stream = Files.walk(Paths.get("D:/"))) {
            stream.filter(Files::isRegularFile)
                  .forEach(System.out::println);
        }
    }
}
```

---

## 1.8 反射机制（第20天）

### 1.8.1 什么是反射

反射是Java在运行时动态获取类信息和操作对象的能力。

### 1.8.2 获取Class对象

```java
public class ReflectionDemo {
    public static void main(String[] args) throws ClassNotFoundException {
        // 方式1：类名.class
        Class<?> clazz1 = String.class;
        
        // 方式2：对象.getClass()
        String str = "Hello";
        Class<?> clazz2 = str.getClass();
        
        // 方式3：Class.forName()（最常用）
        Class<?> clazz3 = Class.forName("java.lang.String");
        
        System.out.println(clazz1 == clazz2);  // true
        System.out.println(clazz2 == clazz3);  // true
    }
}
```

### 1.8.3 反射操作

```java
import java.lang.reflect.*;

public class ReflectionOps {
    
    // 获取类信息
    public void classInfo() throws ClassNotFoundException {
        Class<?> clazz = Class.forName("com.example.Person");
        
        // 类名
        System.out.println("类名：" + clazz.getName());
        System.out.println("简单类名：" + clazz.getSimpleName());
        
        // 包名
        System.out.println("包名：" + clazz.getPackage().getName());
        
        // 父类
        System.out.println("父类：" + clazz.getSuperclass().getName());
        
        // 实现的接口
        Class<?>[] interfaces = clazz.getInterfaces();
        for (Class<?> i : interfaces) {
            System.out.println("接口：" + i.getName());
        }
        
        // 构造方法
        Constructor<?>[] constructors = clazz.getDeclaredConstructors();
        for (Constructor<?> c : constructors) {
            System.out.println("构造方法：" + c.getName());
        }
        
        // 字段
        Field[] fields = clazz.getDeclaredFields();
        for (Field f : fields) {
            System.out.println("字段：" + f.getType().getName() + " " + f.getName());
        }
        
        // 方法
        Method[] methods = clazz.getDeclaredMethods();
        for (Method m : methods) {
            System.out.println("方法：" + m.getName());
        }
    }
    
    // 动态创建对象
    public void createObject() throws Exception {
        Class<?> clazz = Class.forName("com.example.Person");
        
        // 调用无参构造
        Object obj = clazz.getDeclaredConstructor().newInstance();
        
        // 调用有参构造
        Constructor<?> constructor = clazz.getConstructor(String.class, int.class);
        Object obj2 = constructor.newInstance("张三", 25);
    }
    
    // 动态调用方法
    public void invokeMethod() throws Exception {
        Class<?> clazz = Class.forName("com.example.Person");
        Object obj = clazz.getDeclaredConstructor().newInstance();
        
        // 获取方法
        Method method = clazz.getMethod("sayHello", String.class);
        
        // 调用方法
        Object result = method.invoke(obj, "李四");
    }
    
    // 动态访问字段
    public void accessField() throws Exception {
        Class<?> clazz = Class.forName("com.example.Person");
        Object obj = clazz.getDeclaredConstructor().newInstance();
        
        // 获取私有字段
        Field field = clazz.getDeclaredField("name");
        field.setAccessible(true);  // 绕过访问控制
        
        // 设置值
        field.set(obj, "张三");
        
        // 获取值
        String name = (String) field.get(obj);
    }
}
```

---

## 1.9 注解（第21天）

### 1.9.1 内置注解

```java
@Override        // 方法重写
@Deprecated      // 已过时
@SuppressWarnings("unchecked")  // 抑制警告
@FunctionalInterface  // 函数式接口
```

### 1.9.2 自定义注解

```java
// 定义注解
@Target({ElementType.TYPE, ElementType.METHOD})  // 可用于类和方法
@Retention(RetentionPolicy.RUNTIME)              // 运行时保留
@Documented                                      // 包含在Javadoc
public @interface MyAnnotation {
    String value() default "";      // 属性，有默认值
    int age() default 0;
    String[] tags() default {};     // 数组属性
}

// 使用注解
@MyAnnotation(value = "test", age = 25, tags = {"java", "spring"})
public class TestClass {
    
    @MyAnnotation("method")
    public void testMethod() {
    }
}
```

### 1.9.3 注解处理器

```java
public class AnnotationProcessor {
    public static void main(String[] args) {
        Class<?> clazz = TestClass.class;
        
        // 判断是否有注解
        if (clazz.isAnnotationPresent(MyAnnotation.class)) {
            // 获取注解
            MyAnnotation annotation = clazz.getAnnotation(MyAnnotation.class);
            System.out.println("value: " + annotation.value());
            System.out.println("age: " + annotation.age());
            System.out.println("tags: " + Arrays.toString(annotation.tags()));
        }
    }
}
```

---

## 1.10 Lambda与Stream API（第22-24天）

### 1.10.1 Lambda表达式

```java
public class LambdaDemo {
    public static void main(String[] args) {
        // 匿名内部类
        Runnable r1 = new Runnable() {
            @Override
            public void run() {
                System.out.println("匿名内部类");
            }
        };
        
        // Lambda表达式
        Runnable r2 = () -> System.out.println("Lambda");
        
        // 带参数
        Comparator<Integer> c1 = (a, b) -> a - b;
        Comparator<Integer> c2 = (Integer a, Integer b) -> a - b;  // 可省略类型
        
        // 方法引用
        List<String> list = Arrays.asList("Java", "Python", "Go");
        list.forEach(System.out::println);  // 静态方法引用
        list.stream().map(String::toUpperCase);  // 实例方法引用
        
        // 构造方法引用
        Supplier<List<String>> supplier = ArrayList::new;
        Function<Integer, int[]> func = int[]::new;
    }
}
```

### 1.10.2 Stream API

```java
public class StreamDemo {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("Java", "Python", "JavaScript", "Go", "TypeScript");
        
        // 创建Stream
        Stream<String> stream1 = list.stream();
        Stream<String> stream2 = Stream.of("A", "B", "C");
        IntStream stream3 = IntStream.range(1, 10);
        
        // 过滤
        list.stream()
             .filter(s -> s.length() > 5)
             .forEach(System.out::println);
        
        // 映射
        list.stream()
             .map(String::toUpperCase)
             .forEach(System.out::println);
        
        // 排序
        list.stream()
             .sorted()
             .forEach(System.out::println);
        
        list.stream()
             .sorted(Comparator.reverseOrder())
             .forEach(System.out::println);
        
        // 去重
        Stream.of(1, 2, 2, 3, 3, 4)
              .distinct()
              .forEach(System.out::println);
        
        // 限制与跳过
        list.stream()
             .skip(2)      // 跳过前2个
             .limit(3)     // 取前3个
             .forEach(System.out::println);
        
        // 聚合操作
        long count = list.stream().filter(s -> s.length() > 5).count();
        Optional<String> max = list.stream().max(Comparator.naturalOrder());
        Optional<String> min = list.stream().min(Comparator.naturalOrder());
        
        // 归约
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        int sum = numbers.stream().reduce(0, Integer::sum);
        int product = numbers.stream().reduce(1, (a, b) -> a * b);
        
        // 收集器
        List<String> result = list.stream()
                                   .filter(s -> s.length() > 5)
                                   .collect(Collectors.toList());
        
        Set<String> set = list.stream().collect(Collectors.toSet());
        
        Map<String, Integer> map = list.stream()
                                        .collect(Collectors.toMap(
                                            s -> s,
                                            String::length
                                        ));
        
        // 分组
        Map<Integer, List<String>> grouped = list.stream()
                                                  .collect(Collectors.groupingBy(String::length));
        
        // 分区
        Map<Boolean, List<String>> partitioned = list.stream()
                                                      .collect(Collectors.partitioningBy(
                                                          s -> s.length() > 5
                                                      ));
        
        // 连接
        String joined = list.stream().collect(Collectors.joining(", "));
        
        // 并行Stream
        list.parallelStream()
            .filter(s -> s.length() > 5)
            .forEach(System.out::println);
    }
}
```

### 1.10.3 Optional类

```java
public class OptionalDemo {
    public static void main(String[] args) {
        // 创建Optional
        Optional<String> empty = Optional.empty();
        Optional<String> opt = Optional.of("Hello");
        Optional<String> nullable = Optional.ofNullable(null);
        
        // 判断
        boolean isPresent = opt.isPresent();
        opt.ifPresent(System.out::println);
        
        // 获取值
        String value = opt.get();
        String defaultVal = nullable.orElse("Default");
        String defaultVal2 = nullable.orElseGet(() -> "Default");
        
        // 转换
        Optional<Integer> length = opt.map(String::length);
        
        // 过滤
        Optional<String> filtered = opt.filter(s -> s.length() > 3);
        
        // 链式调用
        String result = Optional.of("Hello")
                                 .map(String::toUpperCase)
                                 .filter(s -> s.length() > 3)
                                 .orElse("Default");
    }
}
```

---

## 1.11 并发编程入门（第25-28天）

### 1.11.1 创建线程

```java
public class ThreadDemo {
    
    // 方式1：继承Thread类
    public static class MyThread extends Thread {
        @Override
        public void run() {
            for (int i = 0; i < 10; i++) {
                System.out.println("MyThread: " + i);
            }
        }
    }
    
    // 方式2：实现Runnable接口（推荐）
    public static class MyRunnable implements Runnable {
        @Override
        public void run() {
            for (int i = 0; i < 10; i++) {
                System.out.println("MyRunnable: " + i);
            }
        }
    }
    
    // 方式3：实现Callable接口（有返回值）
    public static class MyCallable implements Callable<Integer> {
        @Override
        public Integer call() throws Exception {
            int sum = 0;
            for (int i = 1; i <= 100; i++) {
                sum += i;
            }
            return sum;
        }
    }
    
    public static void main(String[] args) throws Exception {
        // 启动线程
        new MyThread().start();
        
        new Thread(new MyRunnable()).start();
        
        // Lambda方式
        new Thread(() -> {
            System.out.println("Lambda Thread");
        }).start();
        
        // Callable + FutureTask
        FutureTask<Integer> task = new FutureTask<>(new MyCallable());
        new Thread(task).start();
        Integer result = task.get();  // 获取返回值（阻塞）
        System.out.println("结果：" + result);
    }
}
```

### 1.11.2 线程同步

```java
public class SyncDemo {
    
    // 共享资源
    private static int count = 0;
    
    // synchronized方法
    public synchronized void increment1() {
        count++;
    }
    
    // synchronized代码块
    public void increment2() {
        synchronized (this) {
            count++;
        }
    }
    
    // 静态同步方法（锁是类对象）
    public static synchronized void increment3() {
        count++;
    }
    
    // Lock（更灵活）
    private final Lock lock = new ReentrantLock();
    
    public void increment4() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }
}
```

### 1.11.3 线程池

```java
import java.util.concurrent.*;

public class ThreadPoolDemo {
    public static void main(String[] args) {
        // 创建线程池（推荐手动创建）
        ExecutorService pool = new ThreadPoolExecutor(
            2,                          // 核心线程数
            5,                          // 最大线程数
            60L,                        // 空闲线程存活时间
            TimeUnit.SECONDS,           // 时间单位
            new LinkedBlockingQueue<>(100),  // 工作队列
            Executors.defaultThreadFactory(),
            new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
        );
        
        // 提交任务
        pool.execute(() -> {
            System.out.println("执行任务");
        });
        
        // 提交有返回值的任务
        Future<String> future = pool.submit(() -> {
            Thread.sleep(1000);
            return "任务完成";
        });
        
        try {
            String result = future.get();  // 阻塞等待结果
            System.out.println(result);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        
        // 关闭线程池
        pool.shutdown();
        
        // 常用快捷方法（不推荐生产环境）
        ExecutorService fixedPool = Executors.newFixedThreadPool(5);
        ExecutorService cachedPool = Executors.newCachedThreadPool();
        ExecutorService singlePool = Executors.newSingleThreadExecutor();
        ScheduledExecutorService scheduledPool = Executors.newScheduledThreadPool(5);
    }
}
```

### 1.11.4 CompletableFuture

```java
public class CompletableFutureDemo {
    public static void main(String[] args) {
        // 创建CompletableFuture
        CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
            sleep(1000);
            return "任务1完成";
        });
        
        CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> {
            sleep(2000);
            return "任务2完成";
        });
        
        // 获取结果
        future1.thenAccept(System.out::println);
        
        // 组合
        CompletableFuture<String> combined = future1.thenCombine(future2, (r1, r2) -> {
            return r1 + " + " + r2;
        });
        
        // 链式调用
        CompletableFuture.supplyAsync(() -> "Hello")
                          .thenApply(s -> s + " World")
                          .thenApply(String::toUpperCase)
                          .thenAccept(System.out::println);
        
        // 等待所有完成
        CompletableFuture.allOf(future1, future2).join();
        
        // 等待任一完成
        CompletableFuture.anyOf(future1, future2).thenAccept(System.out::println);
        
        // 异常处理
        CompletableFuture.supplyAsync(() -> {
            if (true) throw new RuntimeException("Error");
            return "OK";
        }).exceptionally(ex -> "Default").thenAccept(System.out::println);
    }
    
    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

---

## 1.12 练习任务

### 练习1：学生管理系统（控制台版）
- 实现学生类（学号、姓名、年龄、成绩）
- 实现增删改查功能
- 使用集合存储学生数据
- 支持按成绩排序

### 练习2：文件复制工具
- 支持文本文件和二进制文件复制
- 显示复制进度
- 支持大文件分块复制

### 练习3：多线程下载模拟器
- 模拟多线程下载
- 使用线程池
- 显示下载进度

### 练习4：简单反射框架
- 实现简单的依赖注入
- 根据配置文件创建对象
- 自动注入属性

---

## 1.13 学习检查清单

- [ ] 能独立搭建Java开发环境
- [ ] 理解Java编译运行机制
- [ ] 掌握Maven基本使用
- [ ] 熟练使用IDEA开发
- [ ] 理解面向对象三大特性
- [ ] 掌握集合框架的使用
- [ ] 理解泛型的作用
- [ ] 能处理常见异常
- [ ] 掌握IO流操作
- [ ] 理解反射和注解
- [ ] 熟练使用Lambda和Stream
- [ ] 理解多线程基础

---

*完成本阶段后，你应该能够用Java编写基本的控制台程序，为后续Web开发打下坚实基础。*
