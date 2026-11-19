package learn.persistence.mybatis;

import java.util.ArrayList;
import java.util.List;

public class DynamicSqlBuilder {

    public String buildFindByConditionSql(UserQuery query) {
        StringBuilder sql = new StringBuilder("SELECT * FROM users");
        List<String> conditions = new ArrayList<>();

        if (hasText(query.getUsername())) {
            conditions.add("username LIKE CONCAT('%', #{username}, '%')");
        }
        if (hasText(query.getEmail())) {
            conditions.add("email = #{email}");
        }
        if (query.getMinAge() != null && query.getMaxAge() != null) {
            conditions.add("age BETWEEN #{minAge} AND #{maxAge}");
        }
        if (query.getStatus() != null) {
            conditions.add("status = #{status}");
        }

        if (!conditions.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", conditions));
        }

        return sql.append(" ORDER BY id DESC").toString();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
