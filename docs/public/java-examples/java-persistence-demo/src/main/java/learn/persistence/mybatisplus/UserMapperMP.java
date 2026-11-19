package learn.persistence.mybatisplus;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import learn.persistence.model.User;

/**
 * MyBatis-Plus Mapper：继承 BaseMapper<User> 后自动获得 insert/selectById/updateById/deleteById 等方法，
 * 无需编写任何 SQL 或 XML。只有当需要复杂/自定义查询时，才需要额外声明方法。
 */
public interface UserMapperMP extends BaseMapper<User> {
    // 所有基础 CRUD 已由 BaseMapper 提供，此处无需写任何代码
}
