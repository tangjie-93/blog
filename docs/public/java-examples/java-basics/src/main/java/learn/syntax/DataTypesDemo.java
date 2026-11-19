package learn.syntax;

/**
 * 数据类型 Demo — Java 基础语法第一步
 *
 * 【核心总结】
 * Java 是强类型语言，变量必须先声明类型才能使用。
 * 数据类型分两大类：
 *   1. 基本类型（8种）：byte/short/int/long/float/double/char/boolean — 存栈，直接存值
 *   2. 引用类型：String、数组、对象等 — 存堆，变量存的是地址
 *
 * 【高频要点】
 * - 整数默认 int，小数默认 double
 * - 自动类型转换：小→大（int→long），强制转换：大→小（(int)longValue）
 * - 包装类（Integer等）：基本类型→对象，支持 null，有工具方法
 * - 字符串是引用类型但不可变，用 + 拼接本质是新建对象
 *
 * 【前端对比】
 * - JS: let age = 25; 类型运行时确定
 * - Java: int age = 25; 类型编译时确定
 */
public class DataTypesDemo {
    
    public static void main(String[] args) {
        System.out.println("========== 1. 基本数据类型 ==========");
        
        // 【整数类型】4种
        byte byteValue = 127;
        System.out.println("byte: " + byteValue + " (占用1字节，范围: -128 ~ 127)");
        
        short shortValue = 32767;
        System.out.println("short: " + shortValue + " (占用2字节)");
        
        int intValue = 2147483647;
        System.out.println("int: " + intValue + " (占用4字节，最常用)");
        
        long longValue = 9223372036854775807L;
        System.out.println("long: " + longValue + " (占用8字节，后缀L)");
        
        System.out.println("\n========== 2. 浮点类型 ==========");
        
        float floatValue = 3.14f;
        System.out.println("float: " + floatValue + " (占用4字节，后缀f)");
        
        double doubleValue = 3.141592653589793;
        System.out.println("double: " + doubleValue + " (占用8字节，最常用)");
        
        double a = 0.1;
        double b = 0.2;
        double c = a + b;
        System.out.println("0.1 + 0.2 = " + c + " (注意：不是精确的0.3)");
        System.out.println("解决方案：使用BigDecimal（后面会学到）");
        
        System.out.println("\n========== 3. 字符类型 ==========");
        
        char charValue = 'A';
        System.out.println("char: " + charValue + " (占用2字节，单引号)");
        
        char chineseChar = '中';
        System.out.println("中文字符: " + chineseChar);
        
        char letterA = 'A';
        int asciiValue = letterA;
        System.out.println("'A' 的ASCII值: " + asciiValue);
        
        System.out.println("\n========== 4. 布尔类型 ==========");
        
        boolean boolValue = true;
        System.out.println("boolean: " + boolValue + " (只有true和false)");
        
        System.out.println("\n========== 5. 引用数据类型 ==========");
        
        String str1 = "Hello";
        String str2 = "World";
        String str3 = str1 + " " + str2;
        System.out.println("String: " + str3);
        
        String original = "Java";
        String modified = original.concat(" Programming");
        System.out.println("原字符串: " + original);
        System.out.println("新字符串: " + modified);
        
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.println("数组: " + java.util.Arrays.toString(numbers));
        System.out.println("数组长度: " + numbers.length);
        
        System.out.println("\n========== 6. 类型推断（JDK 10+） ==========");
        
        var inferredInt = 100;
        var inferredString = "Hello";
        var inferredDouble = 3.14;
        
        System.out.println("var推断int: " + inferredInt + " (类型: " + getType(inferredInt) + ")");
        System.out.println("var推断String: " + inferredString + " (类型: " + getType(inferredString) + ")");
        System.out.println("var推断double: " + inferredDouble + " (类型: " + getType(inferredDouble) + ")");
        
        System.out.println("\n========== 7. 包装类 ==========");
        
        Integer intObj = 100;
        Double doubleObj = 3.14;
        Boolean boolObj = true;
        Character charObj = 'A';
        
        System.out.println("Integer: " + intObj);
        System.out.println("Double: " + doubleObj);
        System.out.println("Boolean: " + boolObj);
        System.out.println("Character: " + charObj);
        
        int primitiveInt = intObj;
        Integer wrappedInt = 200;
        System.out.println("拆箱: " + primitiveInt);
        System.out.println("装箱: " + wrappedInt);
        
        Integer nullableInt = null;
        System.out.println("包装类可以为null: " + nullableInt);
        
        System.out.println("\n========== 8. 常量 ==========");
        
        final double PI = 3.14159265358979;
        final String APP_NAME = "Java Basics";
        
        System.out.println("常量PI: " + PI);
        System.out.println("常量APP_NAME: " + APP_NAME);
    }
    
    private static String getType(Object obj) {
        return obj.getClass().getSimpleName();
    }
}
