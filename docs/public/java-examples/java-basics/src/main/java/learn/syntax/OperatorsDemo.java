package learn.syntax;

/**
 * 运算符 Demo
 *
 * 【核心总结】
 * 大部分运算符和 JS 一样，关键差异：
 *   1. 没有 ===/!==，== 对基本类型比值，对引用类型比地址（用 equals() 比值）
 *   2. 整数/整数 = 整数（截断），要小数结果得先转 double
 *   3. instanceof 检查对象是不是某个类的实例
 *
 * 【高频要点】
 * - &&、|| 短路运算（前面为 false，后面不执行）
 * - &、| 也可以做逻辑运算但不会短路，还会做位运算
 * - 字符串拼接用 +，但底层是 StringBuilder
 * - 三元运算符：condition ? a : b（相当于 JS 的 condition ? a : b）
 */
public class OperatorsDemo {
    
    public static void main(String[] args) {
        System.out.println("========== 1. 算术运算符 ==========");
        
        int a = 10, b = 3;
        
        System.out.println("a + b = " + (a + b));
        System.out.println("a - b = " + (a - b));
        System.out.println("a * b = " + (a * b));
        System.out.println("a / b = " + (a / b));
        System.out.println("10.0 / 3 = " + (10.0 / 3));
        System.out.println("a % b = " + (a % b));
        
        int c = 5;
        System.out.println("c++ = " + (c++));
        System.out.println("c = " + c);
        System.out.println("++c = " + (++c));
        
        System.out.println("\n========== 2. 关系运算符 ==========");
        
        int x = 10, y = 20;
        
        System.out.println("x > y: " + (x > y));
        System.out.println("x < y: " + (x < y));
        System.out.println("x >= y: " + (x >= y));
        System.out.println("x <= y: " + (x <= y));
        System.out.println("x == y: " + (x == y));
        System.out.println("x != y: " + (x != y));
        
        String s1 = new String("hello");
        String s2 = new String("hello");
        String s3 = "hello";
        String s4 = "hello";
        
        System.out.println("\n字符串比较（重要！）:");
        System.out.println("s1 == s2: " + (s1 == s2));
        System.out.println("s1.equals(s2): " + s1.equals(s2));
        System.out.println("s3 == s4: " + (s3 == s4));
        
        System.out.println("\n========== 3. 逻辑运算符 ==========");
        
        boolean p = true, q = false;
        
        System.out.println("p && q: " + (p && q));
        System.out.println("p || q: " + (p || q));
        System.out.println("!p: " + (!p));
        
        int num = 10;
        boolean result = (num > 20) && (num / 0 > 0);
        System.out.println("短路测试: " + result);
        
        System.out.println("\n========== 4. 赋值运算符 ==========");
        
        int val = 100;
        val += 10;
        System.out.println("val += 10: " + val);
        
        val -= 20;
        System.out.println("val -= 20: " + val);
        
        val *= 2;
        System.out.println("val *= 2: " + val);
        
        val /= 3;
        System.out.println("val /= 3: " + val);
        
        val %= 7;
        System.out.println("val %= 7: " + val);
        
        System.out.println("\n========== 5. 三元运算符 ==========");
        
        int age = 20;
        String status = (age >= 18) ? "成年" : "未成年";
        System.out.println("年龄: " + age + ", 状态: " + status);
        
        int score = 85;
        String grade = (score >= 90) ? "优秀" : 
                       (score >= 80) ? "良好" : 
                       (score >= 60) ? "及格" : "不及格";
        System.out.println("分数: " + score + ", 等级: " + grade);
        
        System.out.println("\n========== 6. 位运算符 ==========");
        
        int m = 5;
        int n = 3;
        
        System.out.println("m & n (按位与): " + (m & n));
        System.out.println("m | n (按位或): " + (m | n));
        System.out.println("m ^ n (按位异或): " + (m ^ n));
        System.out.println("~m (按位取反): " + (~m));
        System.out.println("m << 1 (左移): " + (m << 1));
        System.out.println("m >> 1 (右移): " + (m >> 1));
        
        System.out.println("\n========== 7. instanceof 运算符 ==========");
        
        Object obj1 = "Hello";
        Object obj2 = 100;
        
        System.out.println("obj1 instanceof String: " + (obj1 instanceof String));
        System.out.println("obj1 instanceof Integer: " + (obj1 instanceof Integer));
        System.out.println("obj2 instanceof Integer: " + (obj2 instanceof Integer));
        System.err.println("obj2 instanceof String: " + (obj2 instanceof String));
        
        if (obj1 instanceof String str) {
            System.out.println("字符串长度: " + str.length());
        }
        
        System.out.println("\n========== 8. 运算符优先级 ==========");
        
        int result1 = 2 + 3 * 4;
        int result2 = (2 + 3) * 4;
        
        System.out.println("2 + 3 * 4 = " + result1);
        System.out.println("(2 + 3) * 4 = " + result2);
    }
}
