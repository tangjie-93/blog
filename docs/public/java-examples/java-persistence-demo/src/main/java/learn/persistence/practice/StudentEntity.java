package learn.persistence.practice;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

/**
 * 学生实体（MyBatis-Plus 版）— 映射 students 表
 */
@TableName("students")
public class StudentEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private Integer age;

    public StudentEntity() {
    }

    public StudentEntity(String name, Integer age) {
        this.name = name;
        this.age = age;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    @Override
    public String toString() {
        return "Student{id=" + id + ", name='" + name + "', age=" + age + "}";
    }
}
