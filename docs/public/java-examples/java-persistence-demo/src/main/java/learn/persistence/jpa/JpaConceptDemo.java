package learn.persistence.jpa;

public class JpaConceptDemo {

    public static void main(String[] args) {
        System.out.println("JPA/Hibernate concept");
        System.out.println("Entity maps a Java class to a table.");
        System.out.println("Repository derives queries from method names or @Query.");
        System.out.println();
        System.out.println("Example repository methods:");
        System.out.println("List<UserEntity> findByAgeGreaterThan(Integer age)");
        System.out.println("List<UserEntity> findByUsernameLike(String username)");
        System.out.println("@Query(\"SELECT u FROM UserEntity u WHERE u.age BETWEEN :min AND :max\")");
    }
}

class UserEntity {
    private Long id;
    private String username;
    private String password;
    private String email;
    private Integer age;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
}
