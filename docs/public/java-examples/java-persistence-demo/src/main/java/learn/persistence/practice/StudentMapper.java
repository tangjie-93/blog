package learn.persistence.practice;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Select;

/**
 * 学生 Mapper — 继承 BaseMapper 获得基础 CRUD，无需写任何 SQL
 */
public interface StudentMapper extends BaseMapper<StudentEntity> {
    // selectById, insert, updateById, deleteById 已由 BaseMapper 提供
}
