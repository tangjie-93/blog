"""SAG 关联检索教学：手工标注实体，SQLite 扩展证据；不复现官方算法。"""

# shortcut: 实体手工标注且候选不评分，处理真实语料时需补抽取、筛选与质量评估。

import argparse
import sqlite3
from contextlib import closing


def build_index():
    """创建内存索引，使用虚构资料，不读取或改写用户文件。"""
    db = sqlite3.connect(":memory:")
    db.row_factory = sqlite3.Row
    db.executescript("""
        PRAGMA foreign_keys = ON;
        CREATE TABLE chunks (
            id TEXT PRIMARY KEY, scope TEXT NOT NULL,
            path TEXT NOT NULL, body TEXT NOT NULL
        );
        CREATE TABLE event_entities (
            chunk_id TEXT REFERENCES chunks(id) ON DELETE CASCADE,
            entity TEXT NOT NULL, PRIMARY KEY (chunk_id, entity)
        );
        CREATE INDEX entity_lookup ON event_entities(entity);
    """)
    records = [
        ("c1", "public", "team.md", "张三负责星河项目。", ("张三", "星河项目")),
        ("c2", "public", "project.md", "星河项目的客户是远帆公司。", ("星河项目", "远帆公司")),
        ("c3", "public", "contract.md", "远帆公司的合同于 2027-06-30 到期。", ("远帆公司",)),
        ("c4", "private", "private.md", "远帆公司的保密报价是 99 万元。", ("远帆公司",)),
        ("c5", "public", "archive.md", "星河项目的旧版手册已归档。", ("星河项目",)),
    ]
    for chunk_id, scope, path, body, entities in records:
        db.execute("INSERT INTO chunks VALUES (?, ?, ?, ?)", (chunk_id, scope, path, body))
        db.executemany("INSERT INTO event_entities VALUES (?, ?)", [(chunk_id, e) for e in entities])
    db.commit()
    return db


def retrieve(db, entity, scope="public", hops=2):
    """从精确实体开始扩展，返回去重原文；scope 应由可信调用方提供。"""
    if not entity.strip() or not scope.strip() or not 0 <= hops <= 5:
        raise ValueError("实体、范围不能为空；扩展次数必须在 0 到 5 之间")
    frontier = {row[0] for row in db.execute("""
        SELECT c.id FROM chunks c JOIN event_entities e ON e.chunk_id = c.id
        WHERE e.entity = ? AND c.scope = ?
    """, (entity, scope))}
    visited = set(frontier)
    for _ in range(hops):
        if not frontier:
            break
        placeholders = ",".join("?" for _ in frontier)
        neighbors = {row[0] for row in db.execute(f"""
            SELECT DISTINCT target.id
            FROM event_entities source
            JOIN event_entities linked ON linked.entity = source.entity
            JOIN chunks target ON target.id = linked.chunk_id
            WHERE source.chunk_id IN ({placeholders}) AND target.scope = ?
        """, (*sorted(frontier), scope))}
        frontier = neighbors - visited
        visited.update(frontier)
    return [dict(row) for row in db.execute(
        "SELECT id, path, body FROM chunks WHERE scope = ? ORDER BY id", (scope,))
            if row["id"] in visited]


def self_test():
    """核验逐跳扩展、去重、范围隔离、空结果、删除与输入边界。"""
    with closing(build_index()) as db:
        ids = lambda **kwargs: [row["id"] for row in retrieve(db, "张三", **kwargs)]
        assert ids(hops=0) == ["c1"]
        assert ids(hops=1) == ["c1", "c2", "c5"]
        assert ids(hops=2) == ["c1", "c2", "c3", "c5"]
        assert ids(hops=5) == ids(hops=2)
        assert ids(scope="private") == []
        assert retrieve(db, "不存在") == []
        assert retrieve(db, "张三' OR 1=1 --") == []
        assert retrieve(db, "远帆公司", scope="private")[0]["id"] == "c4"
        assert all(row["path"] and row["body"] for row in retrieve(db, "张三"))
        for entity, hops in [("", 2), ("张三", -1), ("张三", 6)]:
            try:
                retrieve(db, entity, hops=hops)
            except ValueError:
                pass
            else:
                raise AssertionError("无效输入未被拒绝")
        db.execute("DELETE FROM chunks WHERE id = 'c2'")
        assert ids() == ["c1", "c5"]
        assert db.execute("SELECT count(*) FROM event_entities WHERE chunk_id = 'c2'").fetchone()[0] == 0
    print("self-test: passed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--test", action="store_true")
    parser.add_argument("--hops", type=int, choices=range(6), default=2)
    args = parser.parse_args()
    if args.test:
        self_test()
    else:
        with closing(build_index()) as connection:
            for item in retrieve(connection, "张三", hops=args.hops):
                print(f"[{item['id']}] {item['path']}: {item['body']}")
