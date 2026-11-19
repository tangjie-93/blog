package learn.oop;

/**
 * 封装 Demo — OOP 三大特性之一
 *
 * 【核心总结】
 * 封装 = private 字段 + public getter/setter，隐藏内部细节，保护数据不被随意篡改。
 * 一句话：属性私有化，行为公开化。
 *
 * 【高频要点】
 * - 字段用 private，通过 getXxx()/setXxx() 访问
 * - set 方法里可以加校验逻辑（如：年龄不能为负）
 * - get 方法可以只读不写，或者计算后返回（如：余额不可直接 set）
 * - 封装也意味着类的内部修改不影响调用者
 */
public class EncapsulationDemo {
    
    public static void main(String[] args) {
        System.out.println("========== 1. 不封装 vs 封装 ==========");
        
        UnencapsulatedUser badUser = new UnencapsulatedUser();
        badUser.name = "张三";
        badUser.age = -5;
        badUser.balance = -1000;
        System.out.println("不封装的用户: " + badUser.name + ", 年龄: " + badUser.age);
        
        User goodUser = new User("李四", 25);
        goodUser.setAge(30);
        goodUser.setAge(-5);
        goodUser.deposit(1000);
        goodUser.withdraw(500);
        goodUser.withdraw(2000);
        
        System.out.println("\n封装的用户: " + goodUser.getName());
        System.out.println("年龄: " + goodUser.getAge());
        System.out.println("余额: " + goodUser.getBalance());
        
        System.out.println("\n========== 2. Getter和Setter ==========");
        
        User user = new User("王五", 28);
        
        String name = user.getName();
        int age = user.getAge();
        System.out.println("姓名: " + name + ", 年龄: " + age);
        
        user.setName("王五五");
        user.setAge(29);
        System.out.println("修改后: " + user.getName() + ", " + user.getAge());
        
        System.out.println("创建时间: " + user.getCreatedAt());
        
        System.out.println("\n========== 3. 私有方法 ==========");
        
        BankAccount account = new BankAccount("123456", 10000);
        account.deposit(5000);
        account.withdraw(3000);
        account.printStatement();
        
        System.out.println("\n========== 4. 封装的好处 ==========");
        
        User user2 = new User("赵六", 25);
        user2.setEmail("invalid-email");
        user2.setEmail("zhaoliu@example.com");
        
        System.out.println("用户ID（只读）: " + user2.getId());
        
        user2.setFirstName("三");
        user2.setLastName("张");
        System.out.println("全名: " + user2.getFullName());
        
        user2.addTag("VIP");
        user2.addTag("活跃");
        System.out.println("标签: " + user2.getTags());
        
        System.out.println("\n========== 5. 访问控制修饰符 ==========");
        
        AccessControlDemo demo = new AccessControlDemo();
        demo.publicMethod();
        demo.callPrivateMethod();
        
        System.out.println("\n========== 6. 实战示例：密码管理器 ==========");
        
        PasswordManager pm = new PasswordManager("master123");
        
        pm.addPassword("gmail", "user@gmail.com", "gmail_pass_123");
        pm.addPassword("github", "user@github.com", "github_pass_456");
        
        String gmailPass = pm.getPassword("master123", "gmail");
        System.out.println("Gmail密码: " + gmailPass);
        
        String wrongPass = pm.getPassword("wrong_pass", "gmail");
        System.out.println("错误密码尝试: " + wrongPass);
        
        System.out.println("已保存的服务: " + pm.listServices());
    }
}

class UnencapsulatedUser {
    public String name;
    public int age;
    public double balance;
}

class User {
    private Long id;
    private String name;
    private int age;
    private String email;
    private double balance;
    private String firstName;
    private String lastName;
    private java.util.List<String> tags;
    private final java.time.LocalDateTime createdAt;
    
    private static Long idCounter = 1000L;
    
    public User(String name, int age) {
        this.id = ++idCounter;
        setName(name);
        setAge(age);
        this.createdAt = java.time.LocalDateTime.now();
        this.tags = new java.util.ArrayList<>();
    }
    
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) {
        if (name != null && !name.trim().isEmpty()) {
            this.name = name;
        } else {
            System.out.println("姓名不能为空");
        }
    }
    
    public int getAge() { return age; }
    public void setAge(int age) {
        if (age > 0 && age < 150) {
            this.age = age;
        } else {
            System.out.println("年龄不合法: " + age);
        }
    }
    
    public String getEmail() { return email; }
    public void setEmail(String email) {
        if (email != null && email.contains("@") && email.contains(".")) {
            this.email = email;
        } else {
            System.out.println("邮箱格式不正确: " + email);
        }
    }
    
    public double getBalance() { return balance; }
    
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("存款成功: " + amount + ", 余额: " + balance);
        }
    }
    
    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("取款成功: " + amount + ", 余额: " + balance);
        } else {
            System.out.println("取款失败，余额不足");
        }
    }
    
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getFullName() { return lastName + firstName; }
    
    public void addTag(String tag) { tags.add(tag); }
    
    public java.util.List<String> getTags() {
        return new java.util.ArrayList<>(tags);
    }
}

class BankAccount {
    private String accountNo;
    private double balance;
    
    public BankAccount(String accountNo, double initialBalance) {
        this.accountNo = accountNo;
        this.balance = initialBalance;
    }
    
    public void deposit(double amount) {
        if (validateAmount(amount)) {
            balance += amount;
            logTransaction("存款", amount);
        }
    }
    
    public void withdraw(double amount) {
        if (validateAmount(amount) && balance >= amount) {
            balance -= amount;
            logTransaction("取款", amount);
        } else {
            System.out.println("取款失败");
        }
    }
    
    public void printStatement() {
        System.out.println("账户: " + maskAccountNo());
        System.out.println("余额: " + balance);
        calculateInterest();
    }
    
    private boolean validateAmount(double amount) { return amount > 0; }
    private void logTransaction(String type, double amount) {
        System.out.println(type + ": " + amount + ", 余额: " + balance);
    }
    private String maskAccountNo() { return "****" + accountNo.substring(accountNo.length() - 4); }
    private void calculateInterest() {
        double interest = balance * 0.02;
        System.out.println("预计年利息: " + interest);
    }
}

class AccessControlDemo {
    public String publicField = "公有";
    protected String protectedField = "受保护";
    String defaultField = "默认";
    private String privateField = "私有";
    
    public void publicMethod() { System.out.println("公有方法"); }
    private void privateMethod() { System.out.println("私有方法"); }
    public void callPrivateMethod() { privateMethod(); }
}

class PasswordManager {
    private String masterPassword;
    private java.util.Map<String, PasswordEntry> passwords;
    
    public PasswordManager(String masterPassword) {
        this.masterPassword = masterPassword;
        this.passwords = new java.util.HashMap<>();
    }
    
    public void addPassword(String service, String username, String password) {
        passwords.put(service, new PasswordEntry(username, encrypt(password)));
        System.out.println("已保存 " + service + " 的密码");
    }
    
    public String getPassword(String masterPass, String service) {
        if (!verifyMasterPassword(masterPass)) {
            System.out.println("主密码错误");
            return null;
        }
        PasswordEntry entry = passwords.get(service);
        if (entry == null) {
            System.out.println("服务不存在");
            return null;
        }
        return decrypt(entry.getPassword());
    }
    
    public java.util.List<String> listServices() {
        return new java.util.ArrayList<>(passwords.keySet());
    }
    
    private boolean verifyMasterPassword(String masterPass) { return this.masterPassword.equals(masterPass); }
    private String encrypt(String password) { return new StringBuilder(password).reverse().toString(); }
    private String decrypt(String encrypted) { return new StringBuilder(encrypted).reverse().toString(); }
    
    private static class PasswordEntry {
        private String username;
        private String password;
        
        public PasswordEntry(String username, String password) {
            this.username = username;
            this.password = password;
        }
        public String getUsername() { return username; }
        public String getPassword() { return password; }
    }
}
