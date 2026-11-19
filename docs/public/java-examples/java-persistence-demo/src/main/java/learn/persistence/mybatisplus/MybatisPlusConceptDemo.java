package learn.persistence.mybatisplus;

import java.util.ArrayList;
import java.util.List;

public class MybatisPlusConceptDemo {

    public static void main(String[] args) {
        System.out.println("MyBatis-Plus concept");
        System.out.println("BaseMapper gives insert/selectById/updateById/deleteById.");
        System.out.println("QueryWrapper builds SQL conditions with chained method calls.");

        QueryWrapperSample wrapper = new QueryWrapperSample()
                .eq("status", 1)
                .like("username", "test")
                .between("age", 18, 60)
                .orderByDesc("id")
                .select("id", "username", "email", "age");

        System.out.println(wrapper.toSql("users"));
    }
}

class QueryWrapperSample {
    private final List<String> selectedColumns = new ArrayList<>();
    private final List<String> conditions = new ArrayList<>();
    private String orderBy;

    QueryWrapperSample select(String... columns) {
        selectedColumns.addAll(List.of(columns));
        return this;
    }

    QueryWrapperSample eq(String column, Object value) {
        conditions.add(column + " = " + literal(value));
        return this;
    }

    QueryWrapperSample like(String column, String value) {
        conditions.add(column + " LIKE '%" + value + "%'");
        return this;
    }

    QueryWrapperSample between(String column, Object start, Object end) {
        conditions.add(column + " BETWEEN " + literal(start) + " AND " + literal(end));
        return this;
    }

    QueryWrapperSample orderByDesc(String column) {
        orderBy = column + " DESC";
        return this;
    }

    String toSql(String tableName) {
        String columns = selectedColumns.isEmpty() ? "*" : String.join(", ", selectedColumns);
        String sql = "SELECT " + columns + " FROM " + tableName;
        if (!conditions.isEmpty()) {
            sql += " WHERE " + String.join(" AND ", conditions);
        }
        if (orderBy != null) {
            sql += " ORDER BY " + orderBy;
        }
        return sql;
    }

    private String literal(Object value) {
        if (value instanceof Number) {
            return value.toString();
        }
        return "'" + value + "'";
    }
}
