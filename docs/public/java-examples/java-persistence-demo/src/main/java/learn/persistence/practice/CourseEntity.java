package learn.persistence.practice;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

/**
 * 课程实体（MyBatis-Plus 版）— 映射 courses 表
 */
@TableName("courses")
public class CourseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private Integer credit;

    public CourseEntity() {
    }

    public CourseEntity(String name, Integer credit) {
        this.name = name;
        this.credit = credit;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCredit() { return credit; }
    public void setCredit(Integer credit) { this.credit = credit; }

    @Override
    public String toString() {
        return "Course{id=" + id + ", name='" + name + "', credit=" + credit + "}";
    }
}
