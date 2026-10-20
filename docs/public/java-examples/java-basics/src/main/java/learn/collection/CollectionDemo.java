package learn.collection;

import java.util.*;

/**
 * 集合框架 Demo
 *
 * 【核心总结】
 * 集合体系：
 *   Collection（单列）
 *     ├─ List：有序、可重复 → ArrayList（查快）/ LinkedList（头尾增删快）/ Vector（线程安全）
 *     └─ Set：无序、不可重复 → HashSet（最快）/ LinkedHashSet（保持插入序）/ TreeSet（自动排序）
 *   Map（双列，键值对）
 *     └─ HashMap（最快） / LinkedHashMap（插入序） / TreeMap（key 排序） / Hashtable（线程安全，已淘汰）
 *
 * 【高频要点】
 * - List vs 数组：List 动态扩容，数组定长
 * - ArrayList：底层数组，get 是 O(1)，中间插入是 O(n)；默认容量10，不够时扩容1.5倍
 * - LinkedList：底层双向链表，同时实现了 List/Deque，可当列表/队列/栈用
 * - HashMap：key 的 hashCode 决定存储位置，equals 判断重复
 * - Collections 工具类：sort/max/min/binarySearch/reverse/shuffle
 * - 遍历删除要用迭代器 remove()，不要用 list.remove()（会抛 ConcurrentModificationException）
 */
public class CollectionDemo {

    public static void main(String[] args) {
        System.out.println("========== 1. ArrayList ==========");

        List<String> list = new ArrayList<>();
        list.add("Java");
        list.add("Python");
        list.add("JavaScript");
        list.add(1, "Go");
        System.out.println("添加后: " + list);

        System.out.println("第一个: " + list.get(0));
        list.set(0, "Java17");
        System.out.println("修改后: " + list);
        list.remove("Python");
        list.remove(0);
        System.out.println("删除后: " + list);
        System.out.println("大小: " + list.size());
        System.out.println("包含Java17? " + list.contains("Java17"));
        System.out.println("Go的索引: " + list.indexOf("Go"));

        System.out.println("遍历:");
        for (String item : list) {
            System.out.println("  " + item);
        }
        list.forEach(item -> System.out.println("  " + item));

        System.out.println("\n========== 2. LinkedList ==========");

        LinkedList<String> linkedList = new LinkedList<>();
        linkedList.add("A");
        linkedList.add("B");
        linkedList.add("C");
        linkedList.addFirst("First");
        linkedList.addLast("Last");
        System.out.println("LinkedList: " + linkedList);
        System.out.println("第一个: " + linkedList.getFirst());
        System.out.println("最后一个: " + linkedList.getLast());
        linkedList.removeFirst();
        linkedList.removeLast();
        System.out.println("删除后: " + linkedList);

        LinkedList<String> stack = new LinkedList<>();
        stack.push("A");
        stack.push("B");
        stack.push("C");
        System.out.println("栈: " + stack);
        System.out.println("出栈: " + stack.pop());

        LinkedList<String> queue = new LinkedList<>();
        queue.offer("A");
        queue.offer("B");
        queue.offer("C");
        System.out.println("队列: " + queue);
        System.out.println("出队: " + queue.poll());

        System.out.println("\n========== 3. HashSet ==========");

        Set<String> set = new HashSet<>();
        set.add("Java");
        set.add("Python");
        set.add("Java");
        System.out.println("HashSet: " + set);
        System.out.println("大小: " + set.size());
        System.out.println("包含Java? " + set.contains("Java"));
        set.remove("Python");
        System.out.println("删除后: " + set);

        Set<String> linkedSet = new LinkedHashSet<>();
        linkedSet.add("C");
        linkedSet.add("A");
        linkedSet.add("B");
        System.out.println("LinkedHashSet: " + linkedSet);

        Set<String> treeSet = new TreeSet<>();
        treeSet.add("C");
        treeSet.add("A");
        treeSet.add("B");
        System.out.println("TreeSet: " + treeSet);

        System.out.println("\n========== 4. HashMap ==========");

        Map<String, Integer> map = new HashMap<>();
        map.put("张三", 25);
        map.put("李四", 30);
        map.put("王五", 28);
        System.out.println("HashMap: " + map);
        System.out.println("张三的年龄: " + map.get("张三"));
        System.out.println("赵六的年龄: " + map.getOrDefault("赵六", 0));
        System.out.println("包含张三? " + map.containsKey("张三"));
        System.out.println("包含25? " + map.containsValue(25));
        map.put("张三", 26);
        System.out.println("修改后: " + map);
        map.remove("李四");
        System.out.println("删除后: " + map);
        System.out.println("大小: " + map.size());

        System.out.println("遍历:");
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println("  " + entry.getKey() + ": " + entry.getValue());
        }
        map.forEach((k, v) -> System.out.println("  " + k + ": " + v));

        Set<String> keys = map.keySet();
        System.out.println("所有键: " + keys);
        Collection<Integer> values = map.values();
        System.out.println("所有值: " + values);

        Map<String, Integer> linkedMap = new LinkedHashMap<>();
        linkedMap.put("C", 3);
        linkedMap.put("A", 1);
        linkedMap.put("B", 2);
        System.out.println("LinkedHashMap: " + linkedMap);

        Map<String, Integer> treeMap = new TreeMap<>();
        treeMap.put("C", 3);
        treeMap.put("A", 1);
        treeMap.put("B", 2);
        System.out.println("TreeMap: " + treeMap);

        System.out.println("\n========== 5. 集合工具类Collections ==========");

        List<Integer> numbers = new ArrayList<>(Arrays.asList(5, 2, 8, 1, 9, 3));
        System.out.println("原列表: " + numbers);
        Collections.sort(numbers);
        System.out.println("排序后: " + numbers);
        Collections.sort(numbers, Collections.reverseOrder());
        System.out.println("降序: " + numbers);
        Collections.shuffle(numbers);
        System.out.println("洗牌: " + numbers);
        System.out.println("最大值: " + Collections.max(numbers));
        System.out.println("最小值: " + Collections.min(numbers));

        List<String> words = Arrays.asList("a", "b", "a", "c", "a");
        System.out.println("a出现次数: " + Collections.frequency(words, "a"));

        List<String> list9 = List.of("A", "B", "C");
        Set<String> set9 = Set.of("A", "B", "C");
        Map<String, Integer> map9 = Map.of("A", 1, "B", 2);

        System.out.println("\n========== 6. 自定义对象排序 ==========");

        List<Student2> students = Arrays.asList(
                new Student2("张三", 85), new Student2("李四", 92),
                new Student2("王五", 78), new Student2("赵六", 95));
        Collections.sort(students);
        System.out.println("按分数排序: " + students);
        students.sort(Comparator.comparing(Student2::getName));
        // 按分数排序
        students.sort(Comparator.comparing(s->s.getScore()));
        System.out.println("按姓名排序: " + students);
        students.sort(Comparator.comparing(Student2::getScore).reversed().thenComparing(Student2::getName));
        System.out.println("多条件排序: " + students);

        System.out.println("\n========== 7. 集合转数组 ==========");

        List<String> strList = Arrays.asList("A", "B", "C");
        String[] array = strList.toArray(new String[0]);
        System.out.println("数组: " + Arrays.toString(array));
        List<String> fromArray = Arrays.asList("X", "Y", "Z");
        System.out.println("从数组: " + fromArray);
        List<String> mutableList = new ArrayList<>(Arrays.asList("X", "Y", "Z"));
        mutableList.add("W");
        System.out.println("可变列表: " + mutableList);

        System.out.println("\n========== 8. 实战示例：词频统计 ==========");

        String text = "hello world hello java world hello";
        String[] words2 = text.split(" ");
        Map<String, Integer> wordCount = new HashMap<>();
        for (String word : words2) {
            wordCount.put(word, wordCount.getOrDefault(word, 0) + 1);
        }
        System.out.println("词频统计: " + wordCount);

        System.out.println("\n========== 9. 实战示例：去重 ==========");
        // 不支持增/删操作
        List<Integer> withDuplicates = Arrays.asList(1, 2, 2, 3, 3, 3, 4, 4, 5);
        System.out.println("原列表: " + withDuplicates);
        Set<Integer> uniqueSet = new HashSet<>(withDuplicates);
        System.out.println("Set去重: " + uniqueSet);
        List<Integer> uniqueList = withDuplicates.stream().distinct().toList();
        System.out.println("Stream去重: " + uniqueList);
        Set<Integer> linkedUnique = new LinkedHashSet<>(withDuplicates);
        System.out.println("LinkedHashSet去重: " + linkedUnique);

        System.out.println("\n========== 10. 选择指南 ==========");
        System.out.println("List选择:");
        System.out.println("  - ArrayList: 大多数场景（查询多）");
        System.out.println("  - LinkedList: 频繁增删、作为栈/队列");
        System.out.println("\nSet选择:");
        System.out.println("  - HashSet: 大多数场景（无序）");
        System.out.println("  - LinkedHashSet: 需要保持插入顺序");
        System.out.println("  - TreeSet: 需要排序");
        System.out.println("\nMap选择:");
        System.out.println("  - HashMap: 大多数场景（无序）");
        System.out.println("  - LinkedHashMap: 需要保持插入顺序");
        System.out.println("  - TreeMap: 需要排序");
    }
}

class Student2 implements Comparable<Student2> {
    private String name;
    private int score;

    public Student2(String name, int score) {
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
    public int compareTo(Student2 other) {
        return Integer.compare(this.score, other.score);
    }

    @Override
    public String toString() {
        return "Student{name='" + name + "', score=" + score + "}";
    }
}
