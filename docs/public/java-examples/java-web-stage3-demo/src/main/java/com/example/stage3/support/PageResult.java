package com.example.stage3.support;

import java.util.List;

/**
 * 分页结果 — 包装分页查询的返回数据
 *
 * 序列化后 JSON 格式：
 * {"list":[...], "total":100, "page":1, "size":10, "totalPages":10}
 */
public class PageResult<T> {
    private final List<T> list;       // 当前页数据
    private final long total;         // 总记录数
    private final int page;           // 当前页码
    private final int size;           // 每页条数
    private final int totalPages;     // 总页数 = ceil(total / size)

    public PageResult(List<T> list, long total, int page, int size) {
        this.list = list;
        this.total = total;
        this.page = page;
        this.size = size;
        this.totalPages = (int) Math.ceil((double) total / size);
    }

    public List<T> getList() { return list; }
    public long getTotal() { return total; }
    public int getPage() { return page; }
    public int getSize() { return size; }
    public int getTotalPages() { return totalPages; }
}
