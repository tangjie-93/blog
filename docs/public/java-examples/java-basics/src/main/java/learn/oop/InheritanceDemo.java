package learn.oop;

/**
 * 继承 Demo — OOP 三大特性之二
 *
 * 【核心总结】
 * 继承 = extends，子类拥有父类的非 private 成员。Java 单继承（一个子类只能有一个父类）。
 * 构造方法调用链：new 子类 → 先调父类构造方法 → 再调子类构造方法（自上而下）。
 *
 * 【高频要点】
 * - super.xxx：调用父类的方法/变量；super()：调用父类构造方法（必须在子类构造器第一行）
 * - 重写（Override）：子类用相同方法签名覆盖父类方法，加 @Override 注解防写错
 * - final 类不能被继承，final 方法不能被重写
 * - 所有类默认继承 Object（toString/equals/hashCode 都来自它）
 */
public class InheritanceDemo {
    
    public static void main(String[] args) {
        System.out.println("========== 1. 基本继承 ==========");
        
        Dog dog = new Dog("旺财", "中华田园犬");
        dog.eat();
        dog.sleep();
        dog.bark();
        dog.fetch();
        
        System.out.println("\n========== 2. 方法重写 ==========");
        
        Cat cat = new Cat("咪咪", "波斯猫");
        cat.eat();
        cat.sleep();
        cat.meow();
        
        System.out.println("\n========== 3. super关键字 ==========");
        
        Puppy puppy = new Puppy("小球", "金毛", 1);
        puppy.eat();
        puppy.parentEat();
        
        System.out.println("\n========== 4. 构造方法的调用顺序 ==========");
        
        System.out.println("创建GraduateStudent对象:");
        GraduateStudent gs = new GraduateStudent("张三", 25, "计算机科学");
        
        System.out.println("\n========== 5. 继承中的属性访问 ==========");
        
        Child child = new Child();
        child.display();
        
        System.out.println("\n========== 6. final关键字 ==========");
        
        FinalClass fc = new FinalClass();
        fc.finalMethod();
        
        System.out.println("\n========== 7. Object类 ==========");
        
        Object obj1 = "Hello";
        Object obj2 = 100;
        Object obj3 = new Dog("小狗", "泰迪");
        
        System.out.println("toString: " + obj3.toString());
        System.out.println("getClass: " + obj3.getClass().getName());
        System.out.println("hashCode: " + obj3.hashCode());
        
        System.out.println("obj3 instanceof Dog: " + (obj3 instanceof Dog));
        System.out.println("obj3 instanceof Animal: " + (obj3 instanceof Animal));
        System.out.println("obj3 instanceof Object: " + (obj3 instanceof Object));
        
        System.out.println("\n========== 8. 抽象类 ==========");
        
        Circle circle = new Circle("红色", 5);
        circle.display();
        System.out.println("圆形面积: " + circle.getArea());
        System.out.println("圆形周长: " + circle.getPerimeter());
        
        Rectangle rectangle = new Rectangle("蓝色", 4, 6);
        rectangle.display();
        System.out.println("矩形面积: " + rectangle.getArea());
        System.out.println("矩形周长: " + rectangle.getPerimeter());
        
        System.out.println("\n========== 9. 继承的优缺点 ==========");
        
        System.out.println("优点:");
        System.out.println("1. 代码复用：子类继承父类的属性和方法");
        System.out.println("2. 建立类之间的关系：为多态做准备");
        
        System.out.println("\n缺点:");
        System.out.println("1. 耦合性强：父类改变会影响子类");
        System.out.println("2. 单继承限制：Java只支持单继承");
        System.out.println("3. 继承层次过深：代码难以理解");
        
        System.out.println("\n建议:");
        System.out.println("1. 优先使用组合而不是继承");
        System.out.println("2. 继承层次不要太深（一般不超过3层）");
        System.out.println("3. 使用接口实现多继承的效果");
    }
}

class Animal {
    protected String name;
    
    public Animal(String name) {
        System.out.println("Animal构造方法: " + name);
        this.name = name;
    }
    
    public void eat() { System.out.println(name + "正在吃东西"); }
    public void sleep() { System.out.println(name + "正在睡觉"); }
    protected void protectedMethod() { System.out.println("父类的protected方法"); }
}

class Dog extends Animal {
    private String breed;
    
    public Dog(String name, String breed) {
        super(name);
        System.out.println("Dog构造方法: " + breed);
        this.breed = breed;
    }
    
    public void bark() { System.out.println(name + "在汪汪叫"); }
    public void fetch() { System.out.println(name + "在捡球"); }
    public String getBreed() { return breed; }
}

class Cat extends Animal {
    private String breed;
    
    public Cat(String name, String breed) {
        super(name);
        this.breed = breed;
    }
    
    @Override
    public void eat() { System.out.println(name + "正在吃鱼"); }
    public void meow() { System.out.println(name + "在喵喵叫"); }
}

class Puppy extends Dog {
    private int age;
    
    public Puppy(String name, String breed, int age) {
        super(name, breed);
        this.age = age;
    }
    
    @Override
    public void eat() { System.out.println(name + "（小狗）在喝奶"); }
    public void parentEat() { super.eat(); }
}

class StudentInherit {
    protected String name;
    protected int age;
    
    public StudentInherit(String name, int age) {
        System.out.println("1. StudentInherit构造方法");
        this.name = name;
        this.age = age;
    }
}

class GraduateStudent extends StudentInherit {
    private String major;
    
    public GraduateStudent(String name, int age, String major) {
        super(name, age);
        System.out.println("2. GraduateStudent构造方法");
        this.major = major;
    }
}

class Parent {
    protected String value = "父类的value";
}

class Child extends Parent {
    private String value = "子类的value";
    
    public void display() {
        System.out.println("子类的value: " + value);
        System.out.println("父类的value: " + super.value);
    }
}

final class FinalClass {
    public void finalMethod() { System.out.println("final类的方法"); }
    public final void anotherFinalMethod() { System.out.println("final方法"); }
}

abstract class Shape {
    protected String color;
    
    public Shape(String color) { this.color = color; }
    
    public abstract double getArea();
    public abstract double getPerimeter();
    
    public void display() { System.out.println("颜色: " + color); }
}

class Circle extends Shape {
    private double radius;
    
    public Circle(String color, double radius) { super(color); this.radius = radius; }
    
    @Override
    public double getArea() { return Math.PI * radius * radius; }
    
    @Override
    public double getPerimeter() { return 2 * Math.PI * radius; }
}

class Rectangle extends Shape {
    private double width;
    private double height;
    
    public Rectangle(String color, double width, double height) { 
        super(color); 
        this.width = width; 
        this.height = height; 
    }
    
    @Override
    public double getArea() { return width * height; }
    
    @Override
    public double getPerimeter() { return 2 * (width + height); }
}
