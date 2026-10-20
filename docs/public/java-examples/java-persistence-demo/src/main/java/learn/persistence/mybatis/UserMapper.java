package learn.persistence.mybatis;

import learn.persistence.model.User;

import java.util.List;

public interface UserMapper {
    User findById(Long id);

    List<User> findAll();

    List<User> findByCondition(UserQuery query);

    int insert(User user);

    int update(User user);

    int deleteById(Long id);
}
