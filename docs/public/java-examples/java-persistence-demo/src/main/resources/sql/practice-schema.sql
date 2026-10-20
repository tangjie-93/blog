-- 学生选课系统数据库表
-- 对应 practice 包中的内存模拟版本，将其迁移到真实 MySQL

CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    age INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    credit INT NOT NULL COMMENT '学分',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 选课关联表（多对多中间表）
CREATE TABLE enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    score INT COMMENT '成绩',
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '选课时间',

    -- 外键约束：确保 student_id 和 course_id 有效
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE,

    -- 同一学生不能重复选同一门课
    UNIQUE KEY uk_student_course (student_id, course_id),

    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
