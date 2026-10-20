package learn.oop;

/**
 * 接口 Demo — 定义规范，解耦利器
 *
 * 【核心总结】
 * 接口 = "能做什么"的规范，类 = "怎么做"的实现。interface 定义，implements 实现。
 * 一个类可以实现多个接口（弥补单继承的不足）。
 *
 * 【高频要点】
 * - 接口方法默认 public abstract（Java 8 前只能有抽象方法）
 * - Java 8+：default 方法（有默认实现，子类可选重写）、static 方法（接口名直接调用）
 * - 函数式接口：只有一个抽象方法的接口 → 可用 Lambda 表达式 → @FunctionalInterface
 * - 接口不能 new，不能有构造器，字段都是 public static final 常量
 * - 接口 vs 抽象类：接口强调"能做什么"，抽象类强调"是什么"
 * - Comparable：定义自然排序（compareTo），让对象可比较
 */
public class InterfaceDemo {

    public static void main(String[] args) {
        System.out.println("========== 1. 接口的基本使用 ==========");

        Airplane airplane = new Airplane("波音747");
        airplane.fly();
        airplane.takeOff();
        airplane.land();

        Bird2 bird = new Bird2("麻雀");
        bird.fly();
        bird.takeOff();
        bird.land();

        System.out.println("\n========== 2. 多实现 ==========");

        Duck2 duck = new Duck2("唐老鸭");
        duck.fly();
        duck.swim();
        duck.eat();

        System.out.println("\n========== 3. 接口的默认方法 ==========");

        Smartphone phone = new Smartphone("iPhone 15");
        phone.call("10086");
        phone.sendMessage("Hello");
        phone.takePhoto();
        phone.playGame();

        System.out.println("\n========== 4. 接口的静态方法 ==========");

        MathOperation.add(10, 20);
        MathOperation.subtract(30, 10);

        System.out.println("\n========== 5. 接口常量 ==========");

        System.out.println("PI: " + MathConstants.PI);
        System.out.println("MAX_VALUE: " + MathConstants.MAX_VALUE);
        System.out.println("APP_NAME: " + MathConstants.APP_NAME);

        System.out.println("\n========== 6. 接口继承 ==========");

        ElectricCar car = new ElectricCar("特斯拉Model 3");
        car.drive();
        car.charge();

        System.out.println("\n========== 7. 接口作为类型使用 ==========");

        UserService userService = new UserServiceImpl();
        userService.register("admin", "123456");
        userService.login("admin", "123456");

        UserService anotherService = new UserServiceImpl();
        processUser(anotherService, "test", "password");

        System.out.println("\n========== 8. 函数式接口 ==========");

        java.util.function.Predicate<Integer> predicate = n -> n > 0;
        System.out.println("5是正数吗? " + predicate.test(5));

        java.util.function.Function<String, Integer> function = str -> str.length();
        System.out.println("Hello的长度: " + function.apply("Hello"));

        java.util.function.Consumer<String> consumer = str -> System.out.println("消费: " + str);
        consumer.accept("数据");

        java.util.function.Supplier<String> supplier = () -> "生产数据";
        System.out.println(supplier.get());

        System.out.println("\n========== 9. 实战示例：排序 ==========");

        StudentIF[] students = {
                new StudentIF("张三", 85), new StudentIF("李四", 92),
                new StudentIF("王五", 78), new StudentIF("赵六", 95)
        };

        java.util.Arrays.sort(students);
        System.out.println("按分数排序:");
        for (StudentIF s : students) {
            System.out.println("  " + s);
        }

        java.util.Arrays.sort(students, (s1, s2) -> s1.getName().compareTo(s2.getName()));
        System.out.println("\n按姓名排序:");
        for (StudentIF s : students) {
            System.out.println("  " + s);
        }

        System.out.println("\n========== 10. 接口 vs 抽象类 ==========");

        System.out.println("选择接口的场景:");
        System.out.println("1. 需要多继承");
        System.out.println("2. 定义行为规范（如：Flyable, Swimmable）");
        System.out.println("3. 解耦（面向接口编程）");

        System.out.println("\n选择抽象类的场景:");
        System.out.println("1. 需要共享代码（有共同实现）");
        System.out.println("2. 需要非public成员");
        System.out.println("3. 需要非静态和非final字段");
    }

    public static void processUser(UserService service, String username, String password) {
        service.register(username, password);
    }
}

interface Flyable {
    void fly();

    default void takeOff() {
        System.out.println("正在起飞");
    }

    default void land() {
        System.out.println("正在降落");
    }

    static void checkWeather() {
        System.out.println("检查天气是否适合飞行");
    }
}

interface Swimmable {
    void swim();
}

interface AnimalInterface {
    void eat();
}

class Airplane implements Flyable {
    private String model;

    public Airplane(String model) {
        this.model = model;
    }

    @Override
    public void fly() {
        System.out.println(model + "在高空飞行");
    }
}

class Bird2 implements Flyable {
    private String type;

    public Bird2(String type) {
        this.type = type;
    }

    @Override
    public void fly() {
        System.out.println(type + "在飞翔");
    }
}

class Duck2 implements Flyable, Swimmable, AnimalInterface {
    private String name;

    public Duck2(String name) {
        this.name = name;
    }

    @Override
    public void fly() {
        System.out.println(name + "在飞");
    }

    @Override
    public void swim() {
        System.out.println(name + "在游泳");
    }

    @Override
    public void eat() {
        System.out.println(name + "在吃东西");
    }
}

interface Phone {
    void call(String number);

    void sendMessage(String message);

    default void takePhoto() {
        System.out.println("拍照功能");
    }

    default void playGame() {
        System.out.println("游戏功能");
    }
}

class Smartphone implements Phone {
    private String model;

    public Smartphone(String model) {
        this.model = model;
    }

    @Override
    public void call(String number) {
        System.out.println(model + "拨打电话: " + number);
    }

    @Override
    public void sendMessage(String message) {
        System.out.println(model + "发送短信: " + message);
    }
}

interface MathOperation {
    static void add(int a, int b) {
        System.out.println(a + " + " + b + " = " + (a + b));
    }

    static void subtract(int a, int b) {
        System.out.println(a + " - " + b + " = " + (a - b));
    }
}

interface MathConstants {
    double PI = 3.14159265358979;
    double E = 2.71828;
    int MAX_VALUE = Integer.MAX_VALUE;
    String APP_NAME = "Math App";
}

interface Vehicle {
    void drive();
}

interface Electric {
    void charge();
}

interface ElectricVehicle extends Vehicle, Electric {
}

class ElectricCar implements ElectricVehicle {
    private String model;

    public ElectricCar(String model) {
        this.model = model;
    }

    @Override
    public void drive() {
        System.out.println(model + "在行驶");
    }

    @Override
    public void charge() {
        System.out.println(model + "在充电");
    }
}

interface UserService {
    void register(String username, String password);

    boolean login(String username, String password);
}

class UserServiceImpl implements UserService {
    @Override
    public void register(String username, String password) {
        System.out.println("注册用户: " + username);
    }

    @Override
    public boolean login(String username, String password) {
        System.out.println("用户登录: " + username);
        return true;
    }
}

class StudentIF implements Comparable<StudentIF> {
    private String name;
    private int score;

    public StudentIF(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public String getName() {
        return name;
    }

    public int getScore() {
        return score;
    }

    @Override
    public int compareTo(StudentIF other) {
        return Integer.compare(other.score, this.score);
    }

    @Override
    public String toString() {
        return "StudentIF{name='" + name + "', score=" + score + "}";
    }
}
