package learn.io;

import java.io.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;

/**
 * IO 流 Demo
 *
 * 【核心总结】
 * IO 流分类：
 * 按单位：字节流（InputStream/OutputStream）→ 图片视频；字符流（Reader/Writer）→ 文本
 * 按方向：输入流（读）、输出流（写）
 * File 类表示文件/路径，新项目推荐用 NIO 的 Path/Files。
 *
 * 【高频要点】
 * -
 * 字节流：FileInputStream/FileOutputStream、BufferedInputStream/BufferedOutputStream
 * - 字符流：FileReader/FileWriter、BufferedReader/BufferedWriter
 * - 务必关闭资源：try-with-resources 自动管理，或 finally 手动 close
 * - 缓冲流带缓冲区，读大文件比普通流快很多
 * - Java NIO（Path/Files）更现代，Files.readString/writestring 一行搞定小文件读写
 */
public class IODemo {

    public static void main(String[] args) {
        System.out.println("========== 1. 字节流 ==========");

        try (FileOutputStream fos = new FileOutputStream("test.txt")) {
            String content = "Hello, Java IO!";
            fos.write(content.getBytes(StandardCharsets.UTF_8));
            System.out.println("写入成功");
        } catch (IOException e) {
            System.out.println("写入失败: " + e.getMessage());
        }

        try (FileInputStream fis = new FileInputStream("test.txt")) {
            byte[] buffer = new byte[1024];
            int len;
            StringBuilder sb = new StringBuilder();
            while ((len = fis.read(buffer)) != -1) {
                sb.append(new String(buffer, 0, len, StandardCharsets.UTF_8));
            }
            System.out.println("读取内容: " + sb.toString());
        } catch (IOException e) {
            System.out.println("读取失败: " + e.getMessage());
        }

        System.out.println("\n========== 2. 字符流 ==========");

        try (FileWriter fw = new FileWriter("test2.txt", StandardCharsets.UTF_8)) {
            fw.write("你好，世界！\n");
            fw.write("Hello, World!\n");
            System.out.println("写入成功");
        } catch (IOException e) {
            System.out.println("写入失败: " + e.getMessage());
        }

        try (FileReader fr = new FileReader("test2.txt", StandardCharsets.UTF_8)) {
            int ch;
            StringBuilder sb = new StringBuilder();
            while ((ch = fr.read()) != -1) {
                sb.append((char) ch);
            }
            System.out.println("读取内容: " + sb.toString());
        } catch (IOException e) {
            System.out.println("读取失败: " + e.getMessage());
        }

        System.out.println("\n========== 3. 缓冲流 ==========");

        try (BufferedReader br = new BufferedReader(new FileReader("test2.txt", StandardCharsets.UTF_8))) {
            String line;
            System.out.println("按行读取:");
            while ((line = br.readLine()) != null) {
                System.out.println("  " + line);
            }
        } catch (IOException e) {
            System.out.println("读取失败: " + e.getMessage());
        }

        try (BufferedWriter bw = new BufferedWriter(new FileWriter("test3.txt", StandardCharsets.UTF_8))) {
            bw.write("第一行");
            bw.newLine();
            bw.write("第二行");
            bw.newLine();
            bw.write("第三行");
            System.out.println("写入成功");
        } catch (IOException e) {
            System.out.println("写入失败: " + e.getMessage());
        }

        System.out.println("\n========== 4. PrintWriter ==========");

        try (PrintWriter pw = new PrintWriter(new FileWriter("test4.txt", StandardCharsets.UTF_8))) {
            pw.println("姓名: 张三");
            pw.println("年龄: 25");
            pw.printf("分数: %.2f%n", 85.5);
            System.out.println("写入成功");
        } catch (IOException e) {
            System.out.println("写入失败: " + e.getMessage());
        }

        System.out.println("\n========== 5. NIO（New IO） ==========");

        Path path = Paths.get("test.txt");

        try {
            java.util.List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
            System.out.println("所有行: " + lines);
        } catch (IOException e) {
            System.out.println("读取失败: " + e.getMessage());
        }

        try {
            byte[] bytes = Files.readAllBytes(path);
            System.out.println("字节数: " + bytes.length);
        } catch (IOException e) {
            System.out.println("读取失败: " + e.getMessage());
        }

        try {
            Files.write(Paths.get("nio_test.txt"), "Hello NIO".getBytes(StandardCharsets.UTF_8));
            System.out.println("NIO写入成功");
        } catch (IOException e) {
            System.out.println("写入失败: " + e.getMessage());
        }

        System.out.println("\n========== 6. 目录操作 ==========");

        try {
            Files.createDirectories(Paths.get("test_dir/sub_dir"));
            System.out.println("目录创建成功");
        } catch (IOException e) {
            System.out.println("创建失败: " + e.getMessage());
        }

        try {
            System.out.println("当前目录文件:");
            Files.list(Paths.get("."))
                    .filter(Files::isRegularFile)
                    .forEach(p -> System.out.println("  " + p.getFileName()));
        } catch (IOException e) {
            System.out.println("遍历失败: " + e.getMessage());
        }

        System.out.println("\n========== 7. 对象序列化 ==========");

        User2 user = new User2("张三", 25, "zhangsan@example.com");

        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("user.dat"))) {
            oos.writeObject(user);
            System.out.println("序列化成功");
        } catch (IOException e) {
            System.out.println("序列化失败: " + e.getMessage());
        }

        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream("user.dat"))) {
            User2 deserializedUser = (User2) ois.readObject();
            System.out.println("反序列化成功: " + deserializedUser);
        } catch (IOException | ClassNotFoundException e) {
            System.out.println("反序列化失败: " + e.getMessage());
        }

        System.out.println("\n========== 8. 实战示例：日志记录器 ==========");

        SimpleLogger logger = new SimpleLogger("app.log");
        logger.log("INFO", "应用程序启动");
        logger.log("DEBUG", "加载配置文件");
        logger.log("ERROR", "连接数据库失败");
        logger.close();

        try {
            Files.lines(Paths.get("app.log"), StandardCharsets.UTF_8)
                    .forEach(System.out::println);
        } catch (IOException e) {
            System.out.println("读取日志失败: " + e.getMessage());
        }

        System.out.println("\n========== 9. IO流选择指南 ==========");
        System.out.println("字节流: 处理二进制数据（图片、视频、音频）、网络传输");
        System.out.println("字符流: 处理文本数据，需要指定字符编码");
        System.out.println("缓冲流: 提高IO性能，减少实际IO次数");
        System.out.println("NIO (Files/Path): JDK 7+推荐，更简洁的API");
    }
}

class User2 implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    private int age;
    private transient String password;
    private String email;

    public User2(String name, int age, String email) {
        this.name = name;
        this.age = age;
        this.email = email;
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', age=" + age + ", email='" + email + "'}";
    }
}

class SimpleLogger {
    private PrintWriter writer;

    public SimpleLogger(String filename) {
        try {
            writer = new PrintWriter(new FileWriter(filename, StandardCharsets.UTF_8, true), true);
        } catch (IOException e) {
            throw new RuntimeException("创建日志文件失败", e);
        }
    }

    public void log(String level, String message) {
        String timestamp = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        writer.printf("[%s] [%s] %s%n", timestamp, level, message);
    }

    public void close() {
        if (writer != null) {
            writer.close();
        }
    }
}
