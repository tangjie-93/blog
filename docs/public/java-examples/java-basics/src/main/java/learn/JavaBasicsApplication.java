package learn;

import java.util.Scanner;

/**
 * Java基础学习项目 - 主入口类
 * 
 * 这个项目包含了Java基础阶段一的所有知识点demo
 * 运行这个主类可以选择运行不同的demo
 */
public class JavaBasicsApplication {
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("========================================");
        System.out.println("  Java基础学习项目 - 面向前端开发者");
        System.out.println("========================================");
        System.out.println();
        
        while (true) {
            System.out.println("请选择要学习的章节：");
            System.out.println("1. 基础语法 - 数据类型");
            System.out.println("2. 基础语法 - 运算符");
            System.out.println("3. 基础语法 - 流程控制");
            System.out.println("4. 基础语法 - 数组");
            System.out.println("5. 面向对象 - 类与对象");
            System.out.println("6. 面向对象 - 封装");
            System.out.println("7. 面向对象 - 继承");
            System.out.println("8. 面向对象 - 多态");
            System.out.println("9. 面向对象 - 接口");
            System.out.println("10. 异常处理");
            System.out.println("11. 集合框架");
            System.out.println("12. 泛型");
            System.out.println("13. IO流");
            System.out.println("14. 反射和注解");
            System.out.println("15. Lambda和Stream API");
            System.out.println("16. 并发编程");
            System.out.println("0. 退出");
            System.out.println();
            System.out.print("请输入选项 (0-16): ");
            
            String choice = scanner.nextLine();
            
            if (choice.equals("0")) {
                System.out.println("感谢学习，再见！");
                break;
            }
            
            System.out.println("\n========================================\n");
            
            try {
                switch (choice) {
                    case "1":
                        learn.syntax.DataTypesDemo.main(new String[]{});
                        break;
                    case "2":
                        learn.syntax.OperatorsDemo.main(new String[]{});
                        break;
                    case "3":
                        learn.syntax.ControlFlowDemo.main(new String[]{});
                        break;
                    case "4":
                        learn.syntax.ArraysDemo.main(new String[]{});
                        break;
                    case "5":
                        learn.oop.ClassDemo.main(new String[]{});
                        break;
                    case "6":
                        learn.oop.EncapsulationDemo.main(new String[]{});
                        break;
                    case "7":
                        learn.oop.InheritanceDemo.main(new String[]{});
                        break;
                    case "8":
                        learn.oop.PolymorphismDemo.main(new String[]{});
                        break;
                    case "9":
                        learn.oop.InterfaceDemo.main(new String[]{});
                        break;
                    case "10":
                        learn.exception.ExceptionDemo.main(new String[]{});
                        break;
                    case "11":
                        learn.collection.CollectionDemo.main(new String[]{});
                        break;
                    case "12":
                        learn.generic.GenericDemo.main(new String[]{});
                        break;
                    case "13":
                        learn.io.IODemo.main(new String[]{});
                        break;
                    case "14":
                        learn.reflect.ReflectionDemo.main(new String[]{});
                        break;
                    case "15":
                        learn.lambda.LambdaStreamDemo.main(new String[]{});
                        break;
                    case "16":
                        learn.concurrent.ConcurrencyDemo.main(new String[]{});
                        break;
                    default:
                        System.out.println("无效选项，请重新选择");
                }
            } catch (Exception e) {
                System.err.println("运行出错: " + e.getMessage());
                e.printStackTrace();
            }
            
            System.out.println("\n========================================\n");
        }
        
        scanner.close();
    }
}
