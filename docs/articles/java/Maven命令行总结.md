---
title: Maven 命令行总结
date: '2026-10-19'
type: 技术
tags: Java|Maven
note: Maven 生命周期、常用命令和项目构建操作。
---

# Maven 命令行总结

## 一、Maven 生命周期命令

### 1. clean 生命周期（清理）
| 命令 | 说明 |
|------|------|
| `mvn clean` | 删除 target 目录 |
| `mvn pre-clean` | 清理前的预备操作 |
| `mvn post-clean` | 清理后的收尾操作 |

### 2. default 生命周期（构建）
| 命令 | 说明 |
|------|------|
| `mvn validate` | 验证项目结构是否正确 |
| `mvn compile` | 编译 `src/main/java` 源码 |
| `mvn test` | 编译并运行单元测试 |
| `mvn package` | 打包（jar / war）到 target 目录 |
| `mvn verify` | 运行集成测试，验证包完整性 |
| `mvn install` | 将包安装到本地仓库 `~/.m2` |
| `mvn deploy` | 将包部署到远程仓库 |

### 3. site 生命周期（站点文档）
| 命令 | 说明 |
|------|------|
| `mvn site` | 生成项目站点文档 |
| `mvn site:deploy` | 部署站点到服务器 |

---

## 二、常用组合命令

| 命令 | 说明 |
|------|------|
| `mvn clean compile` | 清理后重新编译 |
| `mvn clean test` | 清理后运行测试 |
| `mvn clean package` | 清理后打包 |
| `mvn clean install` | 清理后安装到本地仓库 |
| `mvn clean package -DskipTests` | 打包但跳过测试 |
| `mvn clean deploy -DskipTests` | 部署但跳过测试 |
| `mvn clean verify -U` | 强制更新 SNAPSHOT 依赖后验证 |

---

## 三、测试相关

| 命令 | 说明 |
|------|------|
| `mvn test` | 运行全部单元测试 |
| `mvn test -Dtest=ClassName` | 运行指定类的测试 |
| `mvn test -Dtest=ClassName#methodName` | 运行指定方法 |
| `mvn test -Dtest=Cls1,Cls2` | 运行多个类（逗号分隔） |
| `mvn test -Dtest=Cls*Test` | 通配符匹配 |
| `mvn -DskipTests package` | 编译测试但不执行 |
| `mvn -Dmaven.test.skip=true package` | 完全跳过测试（不编译也不跑） |
| `mvn test -DfailIfNoTests=false` | 没有测试也不报错 |
| `mvn surefire-report:report` | 生成测试报告 |

---

## 四、依赖管理

| 命令 | 说明 |
|------|------|
| `mvn dependency:tree` | 打印依赖树 |
| `mvn dependency:list` | 列出所有依赖 |
| `mvn dependency:resolve` | 解析并下载依赖 |
| `mvn dependency:analyze` | 分析未使用/未声明的依赖 |
| `mvn dependency:purge-local-repository` | 清除本地仓库中的项目依赖 |
| `mvn dependency:sources` | 下载依赖源码 |
| `mvn dependency:copy-dependencies` | 将依赖 jar 复制到指定目录 |

---

## 五、插件相关

| 命令 | 说明 |
|------|------|
| `mvn help:describe -Dplugin=groupId:artifactId:version` | 查看插件详情 |
| `mvn help:describe -Dplugin=compiler -Ddetail` | 查看 compiler 插件详细信息 |
| `mvn versions:display-dependency-updates` | 查看依赖可更新版本 |
| `mvn versions:display-plugin-updates` | 查看插件可更新版本 |
| `mvn versions:set -DnewVersion=1.2.0` | 修改项目版本号 |
| `mvn enforcer:enforce` | 强制执行构建规则校验 |

---

## 六、多模块构建

| 命令 | 说明 |
|------|------|
| `mvn -pl moduleA,moduleB clean install` | 只构建指定模块 |
| `mvn -pl moduleA -am clean install` | 同时构建指定模块及其依赖模块（also-make） |
| `mvn -pl moduleA -amd clean install` | 同时构建指定模块及其下游模块（also-make-dependents） |
| `mvn -rf moduleB clean install` | 从指定模块开始恢复构建（resume-from） |
| `mvn -N clean install` | 只构建父 POM，不递归子模块（non-recursive） |

---

## 七、通用参数（Options）

### 日志与输出
| 参数 | 说明 |
|------|------|
| `-e` / `--errors` | 打印完整错误堆栈 |
| `-X` / `--debug` | 开启 Debug 模式（最详细日志） |
| `-q` / `--quiet` | 安静模式，只显示错误 |
| `-B` / `--batch-mode` | 批处理模式，非交互式 |

### 版本与更新
| 参数 | 说明 |
|------|------|
| `-U` / `--update-snapshots` | 强制检查并更新 SNAPSHOT 依赖 |
| `-C` / `--no-snapshot-updates` | 不检查 SNAPSHOT 更新 |
| `-cpu` / `--check-plugin-updates` | 强制检查插件更新 |

### 构建优化
| 参数 | 说明 |
|------|------|
| `-o` / `--offline` | 离线模式（只用本地仓库） |
| `-T 4` | 并行构建线程数（如 `-T 1C` 表示 CPU 核数） |
| `-f` / `--file <pom.xml>` | 指定 POM 文件路径 |
| `-s <settings.xml>` | 指定 settings 文件 |
| `-gs <global-settings.xml>` | 指定全局 settings 文件 |
| `-DskipTests` | 跳过测试执行（但编译测试代码） |
| `-Dmaven.test.skip=true` | 完全跳过测试（连编译也跳过） |

### 其他常用
| 参数 | 说明 |
|------|------|
| `-P <profile>` | 激活指定 Profile，多个用逗号分隔 |
| `-D<property>=<value>` | 传入自定义系统属性 |
| `-Dmaven.compiler.source=11` | 指定 Java 源码版本 |
| `-Dmaven.compiler.target=11` | 指定编译目标版本 |
| `--also-make` | 同 `-am` |
| `--projects` | 同 `-pl` |
| `-nsu` / `--no-snapshot-updates` | 不更新快照 |

---

## 八、实用命令速查

```bash
# 创建新项目（交互式 / 非交互式）
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false

# 查看生效的 settings / 环境信息
mvn help:effective-settings
mvn help:effective-pom
mvn help:system
mvn --version

# 编译后直接运行 main 类
mvn exec:java -Dexec.mainClass="com.example.Main"

# 只编译不跑测试
mvn clean compile -DskipTests

# 打包时跳过测试
mvn clean package -Dmaven.test.skip=true

# 强制重新下载依赖
mvn clean compile -U

# 并行加速构建
mvn clean install -T 1C

# 离线构建
mvn -o clean package

# 生成代码覆盖率报告（JaCoCo）
mvn clean test jacoco:report

# 代码格式检查（Checkstyle）
mvn checkstyle:check

# 编译 + 测试 + 安装 全套
mvn -T 1C -U clean install -DskipTests

# 查看依赖冲突
mvn dependency:tree -Dverbose -Dincludes=com.fasterxml.jackson

# 分析依赖
mvn dependency:analyze

# 强制重新生成 idea 项目文件
mvn idea:idea
```

---

## 九、常见问题与对应命令

| 场景 | 命令 |
|------|------|
| 依赖下不下来 | `mvn clean install -U` |
| 想知道谁引入了某个 jar | `mvn dependency:tree -Dincludes=xxx:yyy` |
| 想从半途恢复构建 | `mvn -rf moduleB clean install` |
| 只想构建某个子模块 | `mvn -pl moduleA clean install` |
| 打包时报错缺类 | `mvn clean compile -U` 强制更新 |
| 想排除某个模块 | `mvn -pl '!moduleC' clean install` |
| 测试跑太慢想并行 | `mvn test -T 1C` |
| 需要离线构建 | `mvn -o clean package` |
| 想用本地 jar | `mvn install:install-file -Dfile=xxx.jar -DgroupId=... -DartifactId=... -Dversion=... -Dpackaging=jar` |

---

## 十、核心概念回顾

```
生命周期 Lifecycle  → 阶段 Phase  → 插件目标 Plugin Goal

clean → pre-clean → clean → post-clean
default → validate → compile → test → package → verify → install → deploy
site → pre-site → site → post-site → site-deploy

一个 Phase 可以绑定多个 Plugin Goal
执行 Phase 时会依次执行前面所有 Phase
```
