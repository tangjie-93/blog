package learn.syntax;

/**
 * 流程控制 Demo
 *
 * 【核心总结】
 * if-else / switch / for / while / do-while，和 JS 基本一样。
 * Java 特有增强：
 *   1. switch 表达式（JDK 14+）→ 可返回值，箭头语法，不用 break
 *   2. 增强 for 循环 for (Type item : collection) — 类似 JS 的 for...of
 *   3. 带标签的 break/continue — 跳出多层循环
 *
 * 【高频要点】
 * - switch 支持 String、枚举、int（不支持 long/double）
 * - for-each 遍历数组和集合，但不能在遍历中修改结构
 * - break 跳出当前层，continue 跳过本次迭代
 */
public class ControlFlowDemo {
    
    public static void main(String[] args) {
        System.out.println("========== 1. if-else 条件语句 ==========");
        
        int score = 85;
        
        if (score >= 90) {
            System.out.println("优秀");
        } else if (score >= 80) {
            System.out.println("良好");
        } else if (score >= 60) {
            System.out.println("及格");
        } else {
            System.out.println("不及格");
        }
        
        int age = 25;
        boolean hasTicket = true;
        
        if (age >= 18) {
            if (hasTicket) {
                System.out.println("可以入场");
            } else {
                System.out.println("请购票");
            }
        } else {
            System.out.println("未成年人需家长陪同");
        }
        
        System.out.println("\n========== 2. switch 语句 ==========");
        
        String day = "MONDAY";
        
        switch (day) {
            case "MONDAY":
            case "TUESDAY":
            case "WEDNESDAY":
            case "THURSDAY":
            case "FRIDAY":
                System.out.println(day + " 是工作日");
                break;
            case "SATURDAY":
            case "SUNDAY":
                System.out.println(day + " 是周末");
                break;
            default:
                System.out.println("未知");
        }
        
        String type = switch (day) {
            case "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY" -> "工作日";
            case "SATURDAY", "SUNDAY" -> "周末";
            default -> "未知";
        };
        System.out.println("switch表达式结果: " + type);
        
        System.out.println("\n========== 3. for 循环 ==========");
        
        System.out.println("基本for循环:");
        for (int i = 0; i < 5; i++) {
            System.out.print(i + " ");
        }
        System.out.println();
        
        int[] numbers = {10, 20, 30, 40, 50};
        System.out.println("增强for循环:");
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println();
        
        System.out.println("\n========== 4. while 循环 ==========");
        
        int count = 0;
        while (count < 5) {
            System.out.print(count + " ");
            count++;
        }
        System.out.println();
        
        int n = 10;
        do {
            System.out.println("do-while执行，n = " + n);
            n++;
        } while (n < 5);
        
        System.out.println("\n========== 5. break 和 continue ==========");
        
        System.out.println("break示例:");
        for (int i = 0; i < 10; i++) {
            if (i == 5) {
                System.out.println("遇到5，跳出循环");
                break;
            }
            System.out.print(i + " ");
        }
        System.out.println();
        
        System.out.println("continue示例（跳过偶数）:");
        for (int i = 0; i < 10; i++) {
            if (i % 2 == 0) {
                continue;
            }
            System.out.print(i + " ");
        }
        System.out.println();
        
        System.out.println("带标签的break:");
        outer:
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (i == 1 && j == 1) {
                    System.out.println("遇到i=1,j=1，跳出外层循环");
                    break outer;
                }
                System.out.println("i=" + i + ", j=" + j);
            }
        }
        
        System.out.println("\n========== 6. 实战示例 ==========");
        
        System.out.println("判断素数:");
        int testNum = 17;
        boolean isPrime = true;
        
        if (testNum <= 1) {
            isPrime = false;
        } else {
            for (int i = 2; i <= Math.sqrt(testNum); i++) {
                if (testNum % i == 0) {
                    isPrime = false;
                    break;
                }
            }
        }
        System.out.println(testNum + (isPrime ? " 是素数" : " 不是素数"));
        
        System.out.println("\n九九乘法表:");
        for (int i = 1; i <= 9; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.printf("%d×%d=%-2d ", j, i, i * j);
            }
            System.out.println();
        }
        
        System.out.println("\n========== 7. 模式匹配（JDK 16+） ==========");
        
        Object obj = "Hello, Java!";
        
        if (obj instanceof String str) {
            System.out.println("模式匹配，长度: " + str.length());
        }
        
        Object value = 42;
        String description = switch (value) {
            case Integer i -> "整数: " + i;
            case String s -> "字符串: " + s;
            case null -> "null值";
            default -> "未知类型";
        };
        System.out.println(description);
    }
}
