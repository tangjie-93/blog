package learn.generic;

import java.util.*;

/**
 * 泛型 Demo
 *
 * 【核心总结】
 * 泛型 = 类型参数化，把类型当作参数传。目的：编译时类型检查，避免运行时 ClassCastException。
 * 语法：<T> 表示一个类型参数。
 *
 * 【高频要点】
 * - 泛型类：class Box<T> { T content; }
 * - 泛型方法：<T> T method(T arg)
 * - 泛型接口：interface Consumer<T> { void accept(T t); }
 * - 通配符：
 * ? 任意类型 | ? extends X（X 或其子类，上界） | ? super X（X 或其父类，下界）
 * - PECS 原则：Producer Extends, Consumer Super
 * - 泛型擦除：编译后 <T> 被擦成 Object，JVM 不感知泛型（向后兼容）
 */
public class GenericDemo {

    public static void main(String[] args) {
        System.out.println("========== 1. 泛型类 ==========");

        Box<String> stringBox = new Box<>();
        stringBox.put("Hello");
        String str = stringBox.get();
        System.out.println("StringBox: " + str);

        Box<Integer> intBox = new Box<>();
        intBox.put(100);
        int num = intBox.get();
        System.out.println("IntBox: " + num);

        Pair<String, Integer> pair = new Pair<>("年龄", 25);
        System.out.println("Pair: " + pair.getKey() + " = " + pair.getValue());

        System.out.println("\n========== 2. 泛型方法 ==========");

        GenericDemo demo = new GenericDemo();

        String[] strArr = { "A", "B", "C" };
        demo.printArray(strArr);

        Integer[] intArr = { 1, 2, 3 };
        demo.printArray(intArr);

        List<String> list = Arrays.asList("X", "Y", "Z");
        String first = demo.getFirst(list);
        System.out.println("第一个: " + first);

        System.out.println("\n========== 3. 泛型接口 ==========");

        Comparator<String> comparator = (s1, s2) -> s1.length() - s2.length();
        List<String> words = Arrays.asList("Java", "Python", "Go");
        words.sort(comparator);
        words.forEach(System.out::println);
        System.out.println("按长度排序: " + words);

        System.out.println("\n========== 4. 泛型限定 ==========");

        List<Integer> intList = Arrays.asList(1, 2, 3);
        List<Double> doubleList = Arrays.asList(1.1, 2.2, 3.3);

        double sum1 = demo.sum(intList);
        double sum2 = demo.sum(doubleList);
        System.out.println("整数和: " + sum1);
        System.out.println("浮点和: " + sum2);

        System.out.println("\n========== 5. 通配符 ==========");

        List<?> unknownList = Arrays.asList(1, "two", 3.0);
        demo.printList(unknownList);

        List<Integer> intList2 = Arrays.asList(1, 2, 3);
        double sum3 = demo.sumOfList(intList2);
        System.out.println("和: " + sum3);

        List<Number> numberList = new ArrayList<>();
        demo.addIntegers(numberList);
        System.out.println("添加整数后: " + numberList);

        System.out.println("\n========== 6. 泛型与集合 ==========");

        List<String> strList = new ArrayList<>();
        Map<String, Integer> map = new HashMap<>();
        Set<Double> set = new HashSet<>();

        strList.add("Hello");
        System.out.println("集合: " + strList);

        System.out.println("\n========== 7. 泛型方法实战 ==========");

        String[] arr1 = { "A", "B", "C", "D" };
        demo.swap(arr1, 0, 3);
        System.out.println("交换后: " + Arrays.toString(arr1));

        List<Integer> numbers = Arrays.asList(5, 2, 8, 1, 9);
        Integer max = demo.max(numbers);
        System.out.println("最大值: " + max);

        System.out.println("\n========== 8. 泛型类实战：栈 ==========");

        Stack<String> stack = new Stack<>();
        stack.push("A");
        stack.push("B");
        stack.push("C");
        System.out.println("栈: " + stack);
        System.out.println("出栈: " + stack.pop());
        System.out.println("栈顶: " + stack.peek());
        System.out.println("是否为空? " + stack.isEmpty());
        System.out.println("大小: " + stack.size());

        System.out.println("\n========== 9. 泛型的类型擦除 ==========");

        Box<String> box1 = new Box<>();
        Box<Integer> box2 = new Box<>();
        System.out.println("box1类型: " + box1.getClass().getName());
        System.out.println("box2类型: " + box2.getClass().getName());
        System.out.println("类型相同? " + (box1.getClass() == box2.getClass()));

        System.out.println("\n========== 10. 泛型的限制 ==========");
        System.out.println("泛型的限制:");
        System.out.println("1. 不能使用基本类型（要用包装类）");
        System.out.println("2. 不能创建泛型数组");
        System.out.println("3. 不能实例化泛型类型");
        System.out.println("4. 静态成员不能使用泛型");
    }

    public <T> void printArray(T[] array) {
        for (T item : array) {
            System.out.print(item + " ");
        }
        System.out.println();
    }

    public <T> T getFirst(List<T> list) {
        return list.isEmpty() ? null : list.get(0);
    }

    public <T extends Number> double sum(List<T> list) {
        double sum = 0;
        for (T num : list) {
            sum += num.doubleValue();
        }
        return sum;
    }

    public void printList(List<?> list) {
        for (Object item : list) {
            System.out.print(item + " ");
        }
        System.out.println();
    }

    public double sumOfList(List<? extends Number> list) {
        double sum = 0;
        for (Number num : list) {
            sum += num.doubleValue();
        }
        return sum;
    }

    public void addIntegers(List<? super Integer> list) {
        list.add(1);
        list.add(2);
        list.add(3);
    }

    public <T> void swap(T[] array, int i, int j) {
        T temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    public <T extends Comparable<T>> T max(List<T> list) {
        T max = list.get(0);
        for (T item : list) {
            if (item.compareTo(max) > 0) {
                max = item;
            }
        }
        return max;
    }
}

class Box<T> {
    private T content;

    public void put(T item) {
        this.content = item;
    }

    public T get() {
        return content;
    }
}

class Pair<K, V> {
    private K key;
    private V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() {
        return key;
    }

    public V getValue() {
        return value;
    }
}

class Stack<T> {
    private List<T> elements = new ArrayList<>();

    public void push(T item) {
        elements.add(item);
    }

    public T pop() {
        if (isEmpty())
            throw new EmptyStackException();
        return elements.remove(elements.size() - 1);
    }

    public T peek() {
        if (isEmpty())
            throw new EmptyStackException();
        return elements.get(elements.size() - 1);
    }

    public boolean isEmpty() {
        return elements.isEmpty();
    }

    public int size() {
        return elements.size();
    }

    @Override
    public String toString() {
        return elements.toString();
    }
}

class EmptyStackException extends RuntimeException {
    public EmptyStackException() {
        super("栈为空");
    }
}
