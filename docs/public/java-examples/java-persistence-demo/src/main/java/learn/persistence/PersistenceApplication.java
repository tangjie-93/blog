package learn.persistence;

import learn.persistence.jdbc.JdbcCrudDemo;
import learn.persistence.jdbc.JdbcTransactionDemo;
import learn.persistence.jpa.JpaConceptDemo;
import learn.persistence.mybatis.MybatisConceptDemo;
import learn.persistence.mybatisplus.MybatisPlusConceptDemo;
import learn.persistence.pool.ConnectionPoolConceptDemo;
import learn.persistence.pool.HikariConnectionPoolDemo;
import learn.persistence.practice.StudentCoursePracticeDemo;
import learn.persistence.sql.SqlBasicsDemo;

import java.util.Scanner;

public class PersistenceApplication {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        while (true) {
            printMenu();
            String choice = scanner.nextLine();

            if ("0".equals(choice)) {
                System.out.println("Exit persistence demo.");
                break;
            }

            System.out.println();
            runDemo(choice);
            System.out.println();
        }
    }

    private static void printMenu() {
        System.out.println("========================================");
        System.out.println("  Stage 2: Database and Persistence Demo");
        System.out.println("========================================");
        System.out.println("1. MySQL schema and SQL basics");
        System.out.println("2. JDBC CRUD workflow");
        System.out.println("3. JDBC transaction workflow");
        System.out.println("4. Connection pool concept");
        System.out.println("5. MyBatis concept and dynamic SQL");
        System.out.println("6. MyBatis-Plus concept");
        System.out.println("7. JPA/Hibernate concept");
        System.out.println("8. Practice: student-course system");
        System.out.println("0. Exit");
        System.out.print("Choose demo (0-8): ");
    }

    private static void runDemo(String choice) {
        switch (choice) {
            case "1" -> SqlBasicsDemo.main(new String[]{});
            case "2" -> JdbcCrudDemo.main(new String[]{});
            case "3" -> JdbcTransactionDemo.main(new String[]{});
            // case "4" -> ConnectionPoolConceptDemo.main(new String[]{});
            case "4" -> HikariConnectionPoolDemo.main(new String[]{});
            case "5" -> MybatisConceptDemo.main(new String[]{});
            case "6" -> MybatisPlusConceptDemo.main(new String[]{});
            case "7" -> JpaConceptDemo.main(new String[]{});
            case "8" -> StudentCoursePracticeDemo.main(new String[]{});
            default -> System.out.println("Invalid option.");
        }
    }
}
