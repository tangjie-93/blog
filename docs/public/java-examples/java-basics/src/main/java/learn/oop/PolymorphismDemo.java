package learn.oop;

/**
 * 多态 Demo — OOP 三大特性之三，最重要
 *
 * 【核心总结】
 * 多态 = 父类引用指向子类对象。Animal a = new Dog();
 * 编译看左边（Animal），运行看右边（Dog）：
 *   - 能调什么方法 → 看父类（编译期）
 *   - 方法怎么执行 → 看子类（运行期，动态绑定）
 *
 * 前提条件：1.有继承/实现关系  2.子类重写了父类方法
 *
 * 【高频要点】
 * - 方法有多态性（动态绑定），字段没有（见 parent.value 例子）
 * - 向上转型（Dog → Animal）：自动；向下转型（Animal → Dog）：强制，可能抛 ClassCastException
 * - instanceof 检查后再强转，避免异常
 * - 多态最大好处：新增子类不需要改调用方代码（开闭原则）
 */
public class PolymorphismDemo {

    public static void main(String[] args) {
        System.out.println("========== 1. 多态的基本使用 ==========");

        AnimalPoly animal1 = new DogPoly("旺财", "田园犬");
        AnimalPoly animal2 = new CatPoly("咪咪", "波斯猫");
        AnimalPoly animal3 = new BirdPoly("小黄", "金丝雀");

        animal1.eat();
        animal2.eat();
        animal3.eat();

        System.out.println("\n========== 2. 多态作为方法参数 ==========");

        makeAnimalEat(animal1);
        makeAnimalEat(animal2);
        makeAnimalEat(animal3);
        makeAnimalEat(new DogPoly("小黑", "黑背"));
        makeAnimalEat(new CatPoly("小花", "橘猫"));

        System.out.println("\n========== 3. 多态作为返回值 ==========");

        AnimalPoly pet1 = getPet("dog");
        AnimalPoly pet2 = getPet("cat");
        pet1.eat();
        pet2.eat();

        System.out.println("\n========== 4. instanceof 和类型转换 ==========");

        if (animal1 instanceof DogPoly) {
            DogPoly dog = (DogPoly) animal1;
            // DogPoly dogPoly = (DogPoly)animal1;
            dog.bark();
            dog.fetch();
        }

        if (animal2 instanceof CatPoly cat) {
            cat.meow();
            cat.catchMouse();
        }

        System.out.println("animal1是DogPoly吗? " + (animal1 instanceof DogPoly));
        System.out.println("animal1是AnimalPoly吗? " + (animal1 instanceof AnimalPoly));
        System.out.println("animal1是Object吗? " + (animal1 instanceof Object));

        System.out.println("\n========== 5. 多态的实际应用 ==========");

        PaymentService paymentService = new PaymentService();
        paymentService.pay(new Alipay(), 100.0);
        paymentService.pay(new WeChatPay(), 200.0);
        paymentService.pay(new UnionPay(), 300.0);

        System.out.println("\n========== 6. 多态与数组 ==========");

        AnimalPoly[] animals = new AnimalPoly[5];
        animals[0] = new DogPoly("狗1", "品种1");
        animals[1] = new CatPoly("猫1", "品种1");
        animals[2] = new BirdPoly("鸟1", "品种1");
        animals[3] = new DogPoly("狗2", "品种2");
        animals[4] = new CatPoly("猫2", "品种2");

        for (AnimalPoly animal : animals) {
            animal.eat();
            if (animal instanceof DogPoly dog) {
                dog.bark();
            } else if (animal instanceof CatPoly cat) {
                cat.meow();
            } else if (animal instanceof BirdPoly bird) {
                bird.fly();
            }
        }

        System.out.println("\n========== 7. 多态的注意事项 ==========");

        AnimalPoly animal = new DogPoly("测试", "品种");
        animal.eat();

        Parent2 parent = new Child2();
        System.out.println("parent.value: " + parent.value);
        System.out.println("((Child2)parent).value: " + ((Child2) parent).value);

        Parent2.staticMethod();
        Child2.staticMethod();
        parent.staticMethod();

        System.out.println("\n========== 8. 多态的优缺点 ==========");

        System.out.println("优点:");
        System.out.println("1. 提高代码的扩展性（新增子类不需要修改现有代码）");
        System.out.println("2. 提高代码的复用性（统一处理逻辑）");
        System.out.println("3. 符合开闭原则");

        System.out.println("\n缺点:");
        System.out.println("1. 不能调用子类特有的方法（需要转型）");
        System.out.println("2. 设计复杂度增加");

        System.out.println("\n========== 9. 实战示例：图形计算器 ==========");

        Shape2[] shapes = {
                new Circle2(5), new Rectangle2(4, 6), new Triangle2(3, 4, 5),
                new Circle2(3), new Rectangle2(2, 8)
        };

        double totalArea = 0;
        double totalPerimeter = 0;

        for (Shape2 shape : shapes) {
            totalArea += shape.getArea();
            totalPerimeter += shape.getPerimeter();
            System.out.printf("%s: 面积=%.2f, 周长=%.2f%n",
                    shape.getClass().getSimpleName(), shape.getArea(), shape.getPerimeter());
        }

        System.out.printf("%n总面积: %.2f%n", totalArea);
        System.out.printf("总周长: %.2f%n", totalPerimeter);
    }

    public static void makeAnimalEat(AnimalPoly animal) {
        animal.eat();
    }

    public static AnimalPoly getPet(String type) {
        return switch (type) {
            case "dog" -> new DogPoly("宠物狗", "泰迪");
            case "cat" -> new CatPoly("宠物猫", "蓝猫");
            default -> new BirdPoly("宠物鸟", "鹦鹉");
        };
    }
}

class AnimalPoly {
    protected String name;

    public AnimalPoly(String name) {
        this.name = name;
    }

    public void eat() {
        System.out.println(name + "正在吃东西");
    }
}

class DogPoly extends AnimalPoly {
    private String breed;

    public DogPoly(String name, String breed) {
        super(name);
        this.breed = breed;
    }

    @Override
    public void eat() {
        System.out.println(name + "正在啃骨头");
    }

    public void bark() {
        System.out.println(name + "在汪汪叫");
    }

    public void fetch() {
        System.out.println(name + "在捡球");
    }
}

class CatPoly extends AnimalPoly {
    private String breed;

    public CatPoly(String name, String breed) {
        super(name);
        this.breed = breed;
    }

    @Override
    public void eat() {
        System.out.println(name + "正在吃鱼");
    }

    public void meow() {
        System.out.println(name + "在喵喵叫");
    }

    public void catchMouse() {
        System.out.println(name + "在抓老鼠");
    }
}

class BirdPoly extends AnimalPoly {
    private String breed;

    public BirdPoly(String name, String breed) {
        super(name);
        this.breed = breed;
    }

    @Override
    public void eat() {
        System.out.println(name + "正在吃虫子");
    }

    public void fly() {
        System.out.println(name + "在飞翔");
    }
}

interface Payment {
    void pay(double amount);
}

class Alipay implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("使用支付宝支付: " + amount + "元");
    }
}

class WeChatPay implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("使用微信支付: " + amount + "元");
    }
}

class UnionPay implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("使用银联支付: " + amount + "元");
    }
}

class PaymentService {
    public void pay(Payment payment, double amount) {
        payment.pay(amount);
    }
}

class Parent2 {
    protected String value = "父类的value";

    public static void staticMethod() {
        System.out.println("父类的静态方法");
    }
}

class Child2 extends Parent2 {
    protected String value = "子类的value";

    public static void staticMethod() {
        System.out.println("子类的静态方法");
    }
}

abstract class Shape2 {
    public abstract double getArea();

    public abstract double getPerimeter();
}

class Circle2 extends Shape2 {
    private double radius;

    public Circle2(double radius) {
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

class Rectangle2 extends Shape2 {
    private double width, height;

    public Rectangle2(double width, double height) {
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

class Triangle2 extends Shape2 {
    private double a, b, c;

    public Triangle2(double a, double b, double c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    @Override
    public double getArea() {
        double s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }

    @Override
    public double getPerimeter() {
        return a + b + c;
    }
}
