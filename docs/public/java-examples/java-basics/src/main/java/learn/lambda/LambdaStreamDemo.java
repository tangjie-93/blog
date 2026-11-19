package learn.lambda;

import java.util.*;
import java.util.stream.*;
import java.util.function.*;

/**
 * Lambda & Stream API Demo
 *
 * 【核心总结】
 * Lambda：匿名函数的简写，(参数) -> { 方法体 }，专用于函数式接口。
 * Stream：对集合/数组的声明式操作链，不是数据结构，不存储数据。
 *
 * 【高频要点】
 * - Lambda 语法：() -> {} / (a, b) -> a + b / s -> s.length()
 * - 方法引用：类名::静态方法 / 实例::方法 / 类名::实例方法（如 String::length）
 * - 四大函数式接口：Predicate(判断)、Function(转换)、Consumer(消费)、Supplier(供给)
 * - Stream 三步走：创建 → 中间操作(filter/map/sorted/distinct...) →
 * 终止操作(collect/forEach/reduce...)
 * - 中间操作是惰性的，终止操作触发执行
 * - 常用收集器：Collectors.toList()/toSet()/toMap()/joining()/groupingBy()
 * - 并行流：parallelStream()，大数据量时利用多核
 */
public class LambdaStreamDemo {

    public static void main(String[] args) {
        System.out.println("========== 1. Lambda基础语法 ==========");

        Runnable runnable = () -> System.out.println("Hello Lambda");
        // 等价传统写法：
        // Runnable runnable = new Runnable() { public void run() {
        // System.out.println("Hello Lambda"); } };
        runnable.run();

        Consumer<String> consumer = s -> System.out.println("消费: " + s);
        // 等价：Consumer<String> consumer = new Consumer<String>() { public void
        // accept(String s) { System.out.println("消费: " + s); } };
        consumer.accept("数据");

        Comparator<Integer> comparator = (a, b) -> a - b;
        // 等价：Comparator<Integer> comparator = new Comparator<Integer>() { public int
        // compare(Integer a, Integer b) { return a - b; } };
        System.out.println("比较: " + comparator.compare(5, 3));

        Comparator<String> lengthComparator = (s1, s2) -> {
            int len1 = s1.length();
            int len2 = s2.length();
            return len1 - len2;
        };
        // 等价：Comparator<String> c = new Comparator<String>() { public int
        // compare(String s1, String s2) { return s1.length() - s2.length(); } };
        System.out.println("长度比较: " + lengthComparator.compare("Java", "Go"));

        System.out.println("\n========== 2. 方法引用 ==========");

        List<String> words = Arrays.asList("Hello", "World", "Java");
        words.forEach(System.out::println);
        // 等价：words.forEach(s -> System.out.println(s));
        // 等价传统写法：for (String s : words) { System.out.println(s); }

        String str = "Hello";
        Supplier<String> supplier = str::toUpperCase;
        // 等价：Supplier<String> supplier = () -> str.toUpperCase();
        // 等价：Supplier<String> supplier = new Supplier<String>() { public String get() {
        // return str.toUpperCase(); } };
        System.out.println("大写: " + supplier.get() + " " + str.toUpperCase());

        words.stream().map(String::toUpperCase).forEach(System.out::println);
        // 等价：words.stream().map(s -> s.toUpperCase()).forEach(s ->
        // System.out.println(s));

        Supplier<List<String>> listSupplier = ArrayList::new;
        // 等价：Supplier<List<String>> listSupplier = () -> new ArrayList<>();
        // 等价：Supplier<List<String>> listSupplier = new Supplier<List<String>>() {
        // public List<String> get() { return new ArrayList<>(); } };
        List<String> list = listSupplier.get();
        list.add("Test");
        System.out.println("构造方法引用: " + list);

        System.out.println("\n========== 3. Stream创建 ==========");

        List<String> collection = Arrays.asList("A", "B", "C");
        Stream<String> stream1 = collection.stream();
        Stream<String> parallelStream1 = collection.parallelStream();

        String[] array = { "X", "Y", "Z" };
        Stream<String> stream2 = Arrays.stream(array);

        IntStream intStream = IntStream.range(1, 10);
        IntStream intStream2 = IntStream.rangeClosed(1, 10);

        System.out.println("\n========== 4. Stream中间操作 ==========");

        List<String> fruits = Arrays.asList("Apple", "Banana", "Cherry", "Date", "Elderberry");

        System.out.println("filter（长度>5）:");
        fruits.stream().filter(f -> f.length() > 5).forEach(f -> System.out.println("  " + f));
        // 等价传统写法：
        // for (String f : fruits) { if (f.length() > 5) { System.out.println(" " + f);
        // } }

        System.out.println("\nmap（转大写）:");
        fruits.stream().map(String::toUpperCase).forEach(f -> System.out.println("  " + f));
        // 等价：fruits.stream().map(f -> f.toUpperCase()).forEach(f ->
        // System.out.println(" " + f));
        // 等价传统写法：
        // for (String f : fruits) { System.out.println(" " + f.toUpperCase()); }

        System.out.println("\nsorted（自然排序）:");
        fruits.stream().sorted().forEach(f -> System.out.println("  " + f));
        // 等价传统写法（需要工具类）：
        // List<String> copy = new ArrayList<>(fruits); Collections.sort(copy); for
        // (String f : copy) { System.out.println(" " + f); }

        System.out.println("\nsorted（按长度排序）:");
        fruits.stream().sorted((s1, s2) -> s2.length() - s1.length()).forEach(f -> System.out.println("  " + f));
        // 等价传统写法：
        // Collections.sort(fruits, new Comparator<String>() { public int compare(String
        // s1, String s2) { return s2.length() - s1.length(); } });
        // for (String f : fruits) { System.out.println(" " + f); }

        System.out.print("\ndistinct: ");
        Stream.of(1, 2, 2, 3, 3, 4).distinct().forEach(n -> System.out.print(n + " "));
        // 等价传统写法：
        // Set<Integer> set = new LinkedHashSet<>(); for (int n : new
        // int[]{1,2,2,3,3,4}) { set.add(n); } for (int n : set) { System.out.print(n +
        // " "); }
        System.out.println();

        System.out.print("\nlimit(3): ");
        fruits.stream().limit(3).forEach(f -> System.out.print(f + " "));
        // 等价传统写法：int i = 0; for (String f : fruits) { if (i++ >= 3) break;
        // System.out.print(f + " "); }
        System.out.println();

        System.out.print("skip(2): ");
        fruits.stream().skip(2).forEach(f -> System.out.print(f + " "));
        // 等价传统写法：int i = 0; for (String f : fruits) { if (i++ < 2) continue;
        // System.out.print(f + " "); }
        System.out.println();

        System.out.print("\nflatMap: ");
        List<List<String>> nestedList = Arrays.asList(Arrays.asList("A", "B"), Arrays.asList("C", "D"));
        nestedList.stream().flatMap(List::stream).forEach(s -> System.out.print(s + " "));
        // 等价：nestedList.stream().flatMap(inner -> inner.stream()).forEach(s ->
        // System.out.print(s + " "));
        // 等价传统写法：
        // for (List<String> inner : nestedList) { for (String s : inner) {
        // System.out.print(s + " "); } }
        System.out.println();

        System.out.println("\n========== 5. Stream终端操作 ==========");

        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

        System.out.print("forEach: ");
        numbers.stream().forEach(n -> System.out.print(n + " "));
        System.out.println();

        long count = numbers.stream().filter(n -> n > 3).count();
        System.out.println("count(>3): " + count);

        Optional<Integer> max = numbers.stream().max(Integer::compareTo);
        // 等价：numbers.stream().max((a, b) -> a.compareTo(b));
        Optional<Integer> min = numbers.stream().min(Integer::compareTo);
        // 等价：numbers.stream().min((a, b) -> a.compareTo(b));
        System.out.println("max: " + max.orElse(0));
        System.out.println("min: " + min.orElse(0));

        int sum = numbers.stream().reduce(0, Integer::sum);
        // 等价：numbers.stream().reduce(0, (a, b) -> a + b);
        // 等价传统写法：int s = 0; for (Integer n : numbers) { s += n; }
        System.out.println("sum: " + sum);

        List<String> collected = fruits.stream().filter(f -> f.length() > 5).collect(Collectors.toList());
        // 等价传统写法：
        // List<String> result = new ArrayList<>(); for (String f : fruits) { if
        // (f.length() > 5) result.add(f); }
        System.out.println("collect to List: " + collected);

        Map<String, Integer> map = fruits.stream().collect(Collectors.toMap(f -> f, String::length));
        // 等价：fruits.stream().collect(Collectors.toMap(f -> f, f -> f.length()));
        // 等价传统写法：
        // Map<String, Integer> m = new HashMap<>(); for (String f : fruits) { m.put(f,
        // f.length()); }
        System.out.println("collect to Map: " + map);

        Map<Integer, List<String>> grouped = fruits.stream().collect(Collectors.groupingBy(String::length));
        // 等价：fruits.stream().collect(Collectors.groupingBy(f -> f.length()));
        // 等价传统写法（需要 computeIfAbsent）：
        // Map<Integer, List<String>> g = new HashMap<>();
        // for (String f : fruits) { g.computeIfAbsent(f.length(), k -> new
        // ArrayList<>()).add(f); }
        System.out.println("groupingBy长度: " + grouped);

        String joined = fruits.stream().collect(Collectors.joining(", "));
        // 等价传统写法：
        // StringBuilder sb = new StringBuilder(); for (int i = 0; i < fruits.size();
        // i++) { if (i > 0) sb.append(", "); sb.append(fruits.get(i)); }
        System.out.println("joining: " + joined);

        System.out.println("\n========== 6. Optional ==========");

        Optional<String> empty = Optional.empty();
        Optional<String> opt = Optional.of("Hello");
        Optional<String> nullable = Optional.ofNullable(null);

        System.out.println("isPresent: " + opt.isPresent());
        System.out.println("isEmpty: " + nullable.isEmpty());
        System.out.println("get: " + opt.get());
        System.out.println("orElse: " + nullable.orElse("Default"));
        // 等价传统写法：String val = nullable != null && nullable.isPresent() ? nullable.get()
        // : "Default";

        opt.ifPresent(v -> System.out.println("ifPresent: " + v));
        // 等价传统写法：if (opt != null && opt.isPresent()) { String v = opt.get();
        // System.out.println("ifPresent: " + v); }

        Optional<Integer> length = opt.map(String::length);
        // 等价：Optional<Integer> length = opt.map(s -> s.length());
        // 等价传统写法：Optional<Integer> length = opt.isPresent() ?
        // Optional.of(opt.get().length()) : Optional.empty();
        System.out.println("map: " + length.orElse(0));

        String result = Optional.of("Hello").map(String::toUpperCase).filter(s -> s.length() > 3).orElse("Default");
        // 等价传统写法：
        // String tmp = "Hello"; String result;
        // if (tmp != null) { tmp = tmp.toUpperCase(); if (tmp.length() > 3) { result =
        // tmp; } else { result = "Default"; } } else { result = "Default"; }
        System.out.println("链式调用: " + result);

        System.out.println("\n========== 7. 实战示例：数据处理 ==========");

        List<Student3> students = Arrays.asList(
                new Student3("张三", 85, "A"), new Student3("李四", 92, "A"),
                new Student3("王五", 78, "B"), new Student3("赵六", 95, "A"),
                new Student3("孙七", 88, "B"), new Student3("周八", 67, "C"));

        List<Student3> excellent = students.stream()
                .filter(s -> "A".equals(s.getClassroom()))
                .filter(s -> s.getScore() >= 90)
                .collect(Collectors.toList());
        // 等价传统写法：
        // List<Student3> ex = new ArrayList<>(); for (Student3 s : students) { if
        // ("A".equals(s.getClassroom()) && s.getScore() >= 90) ex.add(s); }
        System.out.println("A班优秀学生: " + excellent);

        Map<String, Double> avgByClass = students.stream()
                .collect(Collectors.groupingBy(Student3::getClassroom, Collectors.averagingDouble(Student3::getScore)));
        // 等价：.collect(Collectors.groupingBy(s -> s.getClassroom(),
        // Collectors.averagingDouble(s -> s.getScore())));
        // 等价传统写法：
        // Map<String, List<Integer>> group = new HashMap<>(); for (Student3 s :
        // students) {
        // group.computeIfAbsent(s.getClassroom(), k -> new
        // ArrayList<>()).add(s.getScore());
        // } Map<String, Double> avg = new HashMap<>(); for (Map.Entry<String,
        // List<Integer>> e : group.entrySet()) {
        // double sum = 0; for (int sc : e.getValue()) sum += sc; avg.put(e.getKey(),
        // sum / e.getValue().size());
        // }
        System.out.println("各班平均分: " + avgByClass);

        Optional<Student3> topStudent = students.stream().max(Comparator.comparingInt(Student3::getScore));
        // 等价：students.stream().max((a, b) -> Integer.compare(a.getScore(),
        // b.getScore()));
        // 等价传统写法：Student3 top = null; for (Student3 s : students) { if (top == null ||
        // s.getScore() > top.getScore()) top = s; }
        topStudent.ifPresent(s -> System.out.println("最高分: " + s));

        List<String> ranking = students.stream()
                .sorted(Comparator.comparingInt(Student3::getScore).reversed())
                .map(s -> s.getName() + "(" + s.getScore() + ")")
                .collect(Collectors.toList());
        // 等价传统写法：
        // List<Student3> sorted = new ArrayList<>(students);
        // sorted.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));
        // List<String> r = new ArrayList<>(); for (Student3 s : sorted) {
        // r.add(s.getName() + "(" + s.getScore() + ")"); }
        System.out.println("排名: " + ranking);

        System.out.println("\n========== 8. 函数式接口 ==========");

        Predicate<Integer> isPositive = n -> n > 0;
        // 等价传统写法：
        // Predicate<Integer> isPositive = new Predicate<Integer>() { public boolean
        // test(Integer n) { return n > 0; } };
        System.out.println("5是正数? " + isPositive.test(5));

        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<Integer> isPositiveEven = isPositive.and(isEven);
        // 等价传统写法：
        // Predicate<Integer> isPositiveEven = new Predicate<Integer>() { public boolean
        // test(Integer n) { return n > 0 && n % 2 == 0; } };
        System.out.println("4是正偶数? " + isPositiveEven.test(4));

        Function<String, Integer> strLength = String::length;
        // 等价：Function<String, Integer> strLength = s -> s.length();
        // 等价传统写法：
        // Function<String, Integer> strLength = new Function<String, Integer>() {
        // public Integer apply(String s) { return s.length(); } };
        System.out.println("Hello长度: " + strLength.apply("Hello"));

        Consumer<String> printer = s -> System.out.println("打印: " + s);
        // 等价传统写法：
        // Consumer<String> printer = new Consumer<String>() { public void accept(String
        // s) { System.out.println("打印: " + s); } };
        printer.accept("数据");

        Supplier<String> uuidSupplier = () -> UUID.randomUUID().toString();
        // 等价传统写法：
        // Supplier<String> uuidSupplier = new Supplier<String>() { public String get()
        // { return UUID.randomUUID().toString(); } };
        System.out.println("UUID: " + uuidSupplier.get());

        System.out.println("\n========== 9. 对比：JS vs Java ==========");

        int jsResult = numbers.stream().filter(n -> n > 3).mapToInt(n -> n * 2).sum();
        System.out.println("JS风格链式调用结果: " + jsResult);

        System.out.println("\nJS Array方法 → Java Stream方法:");
        System.out.println("  array.filter() → stream.filter()");
        System.out.println("  array.map() → stream.map()");
        System.out.println("  array.reduce() → stream.reduce()");
        System.out.println("  array.forEach() → stream.forEach()");
        System.out.println("  array.find() → stream.filter().findFirst()");
    }
}

class Student3 {
    private String name;
    private int score;
    private String classroom;

    public Student3(String name, int score, String classroom) {
        this.name = name;
        this.score = score;
        this.classroom = classroom;
    }

    public String getName() {
        return name;
    }

    public int getScore() {
        return score;
    }

    public String getClassroom() {
        return classroom;
    }

    @Override
    public String toString() {
        return name + "(" + score + "," + classroom + "班)";
    }
}
