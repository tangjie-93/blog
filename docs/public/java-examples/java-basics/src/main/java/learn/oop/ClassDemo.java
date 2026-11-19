package learn.oop;

/**
 * 类与对象 Demo — OOP 起点
 *
 * 【核心总结】
 * 类是模板（设计图），对象是实例（按图造出来的东西）。
 * new 关键字创建对象 → 分配堆内存 → 调用构造方法初始化。
 *
 * 【高频要点】
 * - 构造方法：与类同名、无返回值、new 时自动调用
 * - this：当前对象的引用，用来区分成员变量和局部变量同名
 * - 成员变量有默认值（int=0, 对象=null），局部变量没有
 * - 一个 .java 文件只能有一个 public 类，但可以有多个非 public 类
 */
public class ClassDemo {
    
    public static void main(String[] args) {
        System.out.println("========== 1. 定义类和创建对象 ==========");
        
        Person person1 = new Person();
        person1.setName("张三");
        person1.setAge(25);
        person1.setEmail("zhangsan@example.com");
        
        System.out.println("姓名: " + person1.getName());
        System.out.println("年龄: " + person1.getAge());
        System.out.println("邮箱: " + person1.getEmail());
        
        person1.sayHello();
        person1.introduce();
        
        System.out.println("\n========== 2. 构造方法 ==========");
        
        Person person2 = new Person();
        person2.setName("李四");
        Person person3 = new Person("王五", 30, "wangwu@example.com");
        System.out.println("person3: " + person3.getName() + ", " + person3.getAge());
        
        System.out.println("\n========== 3. this关键字 ==========");
        
        Person person4 = new Person("赵六", 28);
        person4.printThis();
        
        System.out.println("\n========== 4. 方法重载 ==========");
        
        Calculator calc = new Calculator();
        System.out.println("1 + 2 = " + calc.add(1, 2));
        System.out.println("1 + 2 + 3 = " + calc.add(1, 2, 3));
        System.out.println("1.5 + 2.5 = " + calc.add(1.5, 2.5));
        
        System.out.println("\n========== 5. static关键字 ==========");
        
        System.out.println("创建对象前，实例数量: " + Person.getInstanceCount());
        
        new Person("用户1", 20);
        new Person("用户2", 22);
        new Person("用户3", 24);
        
        System.out.println("创建3个对象后，实例数量: " + Person.getInstanceCount());
        
        Person.printStaticInfo();
        
        System.out.println("\n========== 6. 访问控制 ==========");
        
        AccessDemo demo = new AccessDemo();
        demo.publicField = "公有";
        demo.setPrivateField("通过setter设置私有字段");
        System.out.println("私有字段: " + demo.getPrivateField());
        
        System.out.println("\n========== 7. Lombok简化 ==========");
        
        LomPerson lp = new LomPerson("测试用户", 25);
        System.out.println("Lombok对象: " + lp);
        System.out.println("姓名: " + lp.getName());
        
        System.out.println("\n========== 8. toString方法 ==========");
        
        Person person5 = new Person("孙七", 35, "sunqi@example.com");
        System.out.println("toString: " + person5.toString());
        System.out.println("直接打印: " + person5);
        
        System.out.println("\n========== 9. equals方法 ==========");
        
        Person p10 = new Person("周八", 28);
        Person p11 = new Person("周八", 28);
        Person p12 = p10;
        
        System.out.println("p10 == p11: " + (p10 == p11));
        System.out.println("p10 == p12: " + (p10 == p12));
        System.out.println("p10.equals(p11): " + p10.equals(p11));
        System.out.println("p10.equals(p12): " + p10.equals(p12));
        
        System.out.println("\n========== 10. 内部类 ==========");
        
        OuterClass outer = new OuterClass();
        outer.display();
        
        OuterClass.InnerClass inner = outer.new InnerClass();        
        inner.innerMethod();
        
        OuterClass.StaticInnerClass staticInner = new OuterClass.StaticInnerClass();
        staticInner.staticMethod();
    }
}

class Person {
    private String name;
    private int age;
    private String email;
    
    private static int instanceCount = 0;
    
    public Person() {
        instanceCount++;
        System.out.println("调用无参构造方法");
    }
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
        instanceCount++;
    }
    
    public Person(String name, int age, String email) {
        this(name, age);
        this.email = email;
    }
    
    public void sayHello() {
        System.out.println("Hello, I'm " + name);
    }
    
    public void introduce() {
        System.out.println("姓名: " + name + ", 年龄: " + age + ", 邮箱: " + email);
    }
    
    public void printThis() {
        System.out.println("this: " + this);
    }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public int getAge() { return age; }
    public void setAge(int age) {
        if (age > 0 && age < 150) {
            this.age = age;
        } else {
            System.out.println("年龄不合法");
        }
    }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public static int getInstanceCount() { return instanceCount; }
    
    public static void printStaticInfo() {
        System.out.println("这是一个静态方法");
    }
    
    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + ", email='" + email + "'}";
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Person person = (Person) obj;
        return age == person.age &&
               java.util.Objects.equals(name, person.name) &&
               java.util.Objects.equals(email, person.email);
    }
}

class Calculator {
    public int add(int a, int b) { return a + b; }
    public int add(int a, int b, int c) { return a + b + c; }
    public double add(double a, double b) { return a + b; }
    public String add(String a, String b) { return a + b; }
}

class AccessDemo {
    public String publicField = "公有字段";
    protected String protectedField = "受保护字段";
    String defaultField = "默认字段";
    private String privateField = "私有字段";
    
    public String getPrivateField() { return privateField; }
    public void setPrivateField(String privateField) { this.privateField = privateField; }
}

class LomPerson {
    private String name;
    private int age;

    public LomPerson() {}
    public LomPerson(String name, int age) { this.name = name; this.age = age; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    @Override
    public String toString() {
        return "LomPerson{name='" + name + "', age=" + age + "}";
    }
}

class OuterClass {
    private String outerField = "外部类属性";
    
    public void display() { System.out.println("外部类方法"); }
    
    class InnerClass {
        public void innerMethod() {
            System.out.println("内部类方法，访问外部属性: " + outerField);
        }
    }
    
    static class StaticInnerClass {
        public void staticMethod() { System.out.println("静态内部类方法"); }
    }
}
