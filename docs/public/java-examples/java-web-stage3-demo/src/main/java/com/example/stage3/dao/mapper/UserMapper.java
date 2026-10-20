package com.example.stage3.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.stage3.model.User;

/**
 * MyBatis-Plus 用户 Mapper — 继承 BaseMapper 自动获得全套 CRUD
 *
 * 无需写 XML，BaseMapper 自带：
 *   insert(User)          → 新增，主键自动回填
 *   selectById(Long)      → 按 ID 查
 *   selectList(Wrapper)   → 条件查询（null = 查全部）
 *   updateById(User)      → 按 ID 更新
 *   deleteById(Long)      → 按 ID 删除
 *
 * 由 WebConfig 上的 @MapperScan 扫描并创建代理
 */
public interface UserMapper extends BaseMapper<User> {
}
