package learn.exception;

import java.io.*;

/**
 * 异常处理 Demo
 *
 * 【核心总结】
 * Java 异常分工：
 *   1. 受检异常（Checked Exception）：必须 try-catch 或 throws，如 IOException
 *   2. 非受检异常（RuntimeException）：编译不检查，如 NullPointerException
 *   3. Error：JVM 自身的严重错误，如 OutOfMemoryError，不用捕获
 *
 * 【高频要点】
 * - try-catch-finally：捕获异常，finally 无论是否异常都执行（用于关资源）
 * - try-with-resources（Java 7+）：try(资源){} → 自动调用 close()，替代 finally
 * - catch 可写多个，子类异常在前父类在后（顺序不能反）
 * - throws：自己不处理，丢给调用者（签名上声明）
 * - 自定义异常：extends Exception 或 RuntimeException，可携带自定义数据
 */
public class ExceptionDemo {

    public static void main(String[] args) {
        System.out.println("========== 1. 基本异常处理 ==========");

        try {
            int result = 10 / 0;
            System.out.println("结果: " + result);
        } catch (ArithmeticException e) {
            System.out.println("捕获到异常: " + e.getMessage());
        } finally {
            System.out.println("finally块执行（用于资源清理）");
        }

        System.out.println("\n========== 2. 多个catch块 ==========");

        try {
            String str = null;
            System.out.println(str.length());
        } catch (NullPointerException e) {
            System.out.println("空指针异常: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("其他异常: " + e.getMessage());
        }

        System.out.println("\n========== 3. 多异常捕获（JDK 7+） ==========");

        try {
            int[] arr = { 1, 2, 3 };
            System.out.println(arr[10]);
        } catch (NullPointerException | ArrayIndexOutOfBoundsException e) {
            System.out.println("捕获到异常: " + e.getClass().getSimpleName());
        }

        System.out.println("\n========== 4. try-with-resources（JDK 7+） ==========");

        try (BufferedReader reader = new BufferedReader(new FileReader("test.txt"))) {
            String line = reader.readLine();
            System.out.println(line);
        } catch (IOException e) {
            System.out.println("文件读取失败: " + e.getMessage());
        }

        System.out.println("\n========== 5. 自定义异常 ==========");

        try {
            withdraw(100, 50);
            withdraw(100, 150);
        } catch (InsufficientBalanceException e) {
            System.out.println("自定义异常: " + e.getMessage());
            System.out.println("余额: " + e.getBalance());
            System.out.println("取款金额: " + e.getAmount());
        }

        System.out.println("\n========== 6. throws声明异常 ==========");

        try {
            readFile("nonexistent.txt");
        } catch (IOException e) {
            System.out.println("文件不存在: " + e.getMessage());
        }

        System.out.println("\n========== 7. 异常链 ==========");

        try {
            processConfig("config.xml");
        } catch (BusinessException e) {
            System.out.println("业务异常: " + e.getMessage());
            System.out.println("原因: " + e.getCause().getMessage());
        }

        System.out.println("\n========== 8. 常见运行时异常 ==========");

        try {
            String str = null;
            str.length();
        } catch (NullPointerException e) {
            System.out.println("空指针: " + e.getMessage());
        }

        try {
            int[] arr = { 1, 2, 3 };
            System.out.println(arr[10]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("数组越界: " + e.getMessage());
        }

        try {
            Object obj = "Hello";
            Integer num = (Integer) obj;
        } catch (ClassCastException e) {
            System.out.println("类型转换: " + e.getMessage());
        }

        try {
            int num = Integer.parseInt("abc");
        } catch (NumberFormatException e) {
            System.out.println("数字格式: " + e.getMessage());
        }

        try {
            int result = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("算术异常: " + e.getMessage());
        }

        System.out.println("\n========== 9. 异常处理最佳实践 ==========");

        try {
            riskyMethod();
        } catch (SpecificException e) {
            handleSpecificException(e);
        } catch (Exception e) {
            handleGenericException(e);
        }

        try (Resource res = new Resource()) {
            res.use();
        } catch (Exception e) {
            System.out.println("使用资源失败");
        }

        System.out.println("\n========== 10. 实战示例：用户注册 ==========");

        try {
            registerUser("admin", "123456", "admin@example.com");
            registerUser("", "123", "invalid-email");
        } catch (ValidationException e) {
            System.out.println("验证失败: " + e.getMessage());
            for (String error : e.getErrors()) {
                System.out.println("  - " + error);
            }
        }
    }

    public static void withdraw(double balance, double amount) throws InsufficientBalanceException {
        if (amount > balance) {
            throw new InsufficientBalanceException(balance, amount);
        }
        System.out.println("取款成功，余额: " + (balance - amount));
    }

    public static void readFile(String filename) throws IOException {
        FileReader reader = new FileReader(filename);
        reader.close();
    }

    public static void processConfig(String filename) throws BusinessException {
        try {
            loadConfig(filename);
        } catch (IOException e) {
            throw new BusinessException("处理配置失败", e);
        }
    }

    private static void loadConfig(String filename) throws IOException {
        throw new IOException("文件不存在: " + filename);
    }

    public static void riskyMethod() throws SpecificException {
        throw new SpecificException("特定异常");
    }

    private static void handleSpecificException(SpecificException e) {
        System.out.println("处理特定异常: " + e.getMessage());
    }

    private static void handleGenericException(Exception e) {
        System.out.println("处理通用异常: " + e.getMessage());
    }

    public static void registerUser(String username, String password, String email) throws ValidationException {
        java.util.List<String> errors = new java.util.ArrayList<>();
        if (username == null || username.trim().isEmpty())
            errors.add("用户名不能为空");
        if (password == null || password.length() < 6)
            errors.add("密码长度不能少于6位");
        if (email == null || !email.contains("@"))
            errors.add("邮箱格式不正确");
        if (!errors.isEmpty())
            throw new ValidationException("用户注册验证失败", errors);
        System.out.println("用户注册成功: " + username);
    }
}

class InsufficientBalanceException extends Exception {
    private double balance;
    private double amount;

    public InsufficientBalanceException(double balance, double amount) {
        super("余额不足，当前余额: " + balance + ", 取款金额: " + amount);
        this.balance = balance;
        this.amount = amount;
    }

    public double getBalance() {
        return balance;
    }

    public double getAmount() {
        return amount;
    }
}

class BusinessException extends Exception {
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}

class SpecificException extends Exception {
    public SpecificException(String message) {
        super(message);
    }
}

class ValidationException extends Exception {
    private java.util.List<String> errors;

    public ValidationException(String message, java.util.List<String> errors) {
        super(message);
        this.errors = errors;
    }

    public java.util.List<String> getErrors() {
        return errors;
    }
}

class Resource implements AutoCloseable {
    public Resource() {
        System.out.println("打开资源");
    }

    public void use() {
        System.out.println("使用资源");
    }

    @Override
    public void close() throws Exception {
        System.out.println("关闭资源");
    }
}
