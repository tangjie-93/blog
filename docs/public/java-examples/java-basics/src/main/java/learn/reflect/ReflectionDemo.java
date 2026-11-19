package learn.reflect;

import java.lang.reflect.*;
import java.lang.annotation.*;

/**
 * 反射 Demo
 *
 * 【核心总结】
 * 反射 = 运行时动态获取类的信息、创建对象、调用方法、访问字段。
 * 就像拿到了类的"X光片"，所有结构一览无余。
 *
 * 【高频要点】
 * - 获取 Class 对象的三种方式：类名.class / 对象.getClass() / Class.forName("全限定名")
 * - 可以做的事：newInstance() 创建对象、invoke() 调用方法、get/set 访问字段（包括 private）
 * - 但破坏封装，性能差，能不用就不用
 *
 * 【实际应用场景】
 * - 框架底层（Spring 的依赖注入、MyBatis 的结果映射）
 * - 注解处理器（运行时读取注解信息）
 * - JDBC 的 Class.forName("Driver") 加载驱动
 *
 * 【关键 API】
 * - Class: getName/getMethods/getFields/getConstructors
 * - Method: invoke(obj, args)
 * - Field: get(obj) / set(obj, value) + setAccessible(true) 突破 private
 * - Constructor: newInstance(args)
 */
public class ReflectionDemo {

    public static void main(String[] args) {
        System.out.println("========== 1. 获取Class对象 ==========");

        Class<?> clazz1 = String.class;
        System.out.println("方式1: " + clazz1.getName());

        String str = "Hello";
        Class<?> clazz2 = str.getClass();
        System.out.println("方式2: " + clazz2.getName());

        try {
            Class<?> clazz3 = Class.forName("java.lang.String");
            System.out.println("方式3: " + clazz3.getName());
            System.out.println("clazz2 == clazz3: " + (clazz2 == clazz3));
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }

        System.out.println("clazz1 == clazz2: " + (clazz1 == clazz2));

        System.out.println("\n========== 2. 获取类信息 ==========");

        try {
            Class<?> clazz = Class.forName("learn.reflect.Person3");
            System.out.println("完整类名: " + clazz.getName());
            System.out.println("简单类名: " + clazz.getSimpleName());
            System.out.println("包名: " + clazz.getPackage().getName());

            Class<?> superClass = clazz.getSuperclass();
            System.out.println("父类: " + (superClass != null ? superClass.getName() : "无"));

            Class<?>[] interfaces = clazz.getInterfaces();
            System.out.println("实现的接口:");
            for (Class<?> i : interfaces) {
                System.out.println("  " + i.getName());
            }

            int modifiers = clazz.getModifiers();
            System.out.println("修饰符: " + Modifier.toString(modifiers));
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }

        System.out.println("\n========== 3. 获取构造方法 ==========");

        try {
            Class<?> clazz = Person3.class;
            Constructor<?>[] constructors = clazz.getConstructors();
            System.out.println("public构造方法:");
            for (Constructor<?> c : constructors) {
                System.out.println("  " + c);
            }

            Constructor<?>[] declaredConstructors = clazz.getDeclaredConstructors();
            System.out.println("所有构造方法:");
            for (Constructor<?> c : declaredConstructors) {
                System.out.println("  " + c);
            }

            Constructor<?> constructor = clazz.getConstructor(String.class, int.class);
            System.out.println("指定构造: " + constructor);
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("\n========== 4. 获取字段 ==========");

        try {
            Class<?> clazz = Person3.class;
            Field[] fields = clazz.getFields();
            System.out.println("public字段:");
            for (Field f : fields) {
                System.out.println("  " + f.getType().getSimpleName() + " " + f.getName());
            }

            Field[] declaredFields = clazz.getDeclaredFields();
            System.out.println("所有字段:");
            for (Field f : declaredFields) {
                System.out.println("  " + Modifier.toString(f.getModifiers()) + " " + f.getType().getSimpleName() + " "
                        + f.getName());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("\n========== 5. 获取方法 ==========");

        try {
            Class<?> clazz = Person3.class;
            Method[] methods = clazz.getMethods();
            System.out.println("public方法:");
            for (Method m : methods) {
                if (m.getDeclaringClass() == clazz) {
                    System.out.println("  " + m.getName() + "(" + getParameterTypes(m) + ")");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("\n========== 6. 动态创建对象 ==========");

        try {
            Class<?> clazz = Person3.class;
            Object obj1 = clazz.getDeclaredConstructor().newInstance();
            System.out.println("无参构造: " + obj1);

            Constructor<?> constructor = clazz.getConstructor(String.class, int.class);
            Object obj2 = constructor.newInstance("张三", 25);
            System.out.println("有参构造: " + obj2);
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("\n========== 7. 动态访问字段 ==========");

        try {
            Class<?> clazz = Person3.class;
            Object obj = clazz.getConstructor(String.class, int.class).newInstance("李四", 30);

            Field publicField = clazz.getField("name");
            System.out.println("publicField: " + publicField);
            String name = (String) publicField.get(obj);
            System.out.println("name: " + name);

            publicField.set(obj, "王五");
            System.out.println("修改后name: " + ((Person3) obj).getName());

            Field privateField = clazz.getDeclaredField("age");
            privateField.setAccessible(true);
            int age = (int) privateField.get(obj);
            System.out.println("age: " + age);

            privateField.set(obj, 35);
            System.out.println("修改后age: " + ((Person3) obj).getAge());
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("\n========== 8. 动态调用方法 ==========");

        try {
            Class<?> clazz = Person3.class;
            Object obj = clazz.getConstructor(String.class, int.class).newInstance("赵六", 28);

            Method sayHelloMethod = clazz.getMethod("sayHello");
            // 调用方法
            sayHelloMethod.invoke(obj);

            Method greetMethod = clazz.getMethod("greet", String.class);
            Object result = greetMethod.invoke(obj, "孙七");
            System.out.println("返回值: " + result);

            Method privateMethod = clazz.getDeclaredMethod("privateMethod");
            privateMethod.setAccessible(true);
            privateMethod.invoke(obj);

            Method staticMethod = clazz.getMethod("staticMethod");
            staticMethod.invoke(null);
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("\n========== 9. 注解处理 ==========");

        try {
            Class<?> clazz = Person3.class;
            if (clazz.isAnnotationPresent(MyAnnotation.class)) {
                MyAnnotation annotation = clazz.getAnnotation(MyAnnotation.class);
                System.out.println("value: " + annotation.value());
                System.out.println("age: " + annotation.age());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("\n========== 10. 实战示例：简单的依赖注入 ==========");

        Service3 service = new Service3Impl();
        Injector.inject(service);
        service.doSomething();
    }

    private static String getParameterTypes(Method method) {
        Class<?>[] paramTypes = method.getParameterTypes();
        if (paramTypes.length == 0)
            return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < paramTypes.length; i++) {
            if (i > 0)
                sb.append(", ");
            sb.append(paramTypes[i].getSimpleName());
        }
        return sb.toString();
    }
}

@MyAnnotation(value = "测试类", age = 100)
class Person3 {
    public String name;
    private int age;

    public Person3() {
        System.out.println("Person3无参构造");
    }

    public Person3(String name, int age) {
        this.name = name;
        this.age = age;
    }

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
        this.age = age;
    }

    @MyAnnotation("sayHello方法")
    public void sayHello() {
        System.out.println("Hello, I'm " + name);
    }

    public String greet(String otherName) {
        return "Hello, " + otherName + "! I'm " + name;
    }

    private void privateMethod() {
        System.out.println("私有方法被调用");
    }

    public static void staticMethod() {
        System.out.println("静态方法被调用");
    }

    @Override
    public String toString() {
        return "Person3{name='" + name + "', age=" + age + "}";
    }
}

@Target({ ElementType.TYPE, ElementType.METHOD, ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
@interface MyAnnotation {
    String value() default "";

    int age() default 0;
}

interface Service3 {
    void doSomething();
}

class Service3Impl implements Service3 {
    @Inject
    private Dao3 dao;

    @Override
    public void doSomething() {
        dao.query();
    }
}

class Dao3 {
    public void query() {
        System.out.println("查询数据");
    }
}

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@interface Inject {
}

class Injector {
    public static void inject(Object obj) {
        Class<?> clazz = obj.getClass();
        for (Field field : clazz.getDeclaredFields()) {
            if (field.isAnnotationPresent(Inject.class)) {
                try {
                    Object dependency = field.getType().getDeclaredConstructor().newInstance();
                    field.setAccessible(true);
                    field.set(obj, dependency);
                    System.out.println("注入 " + field.getName() + " 成功");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
