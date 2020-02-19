
---
title: docker学习总结
date: '2020-02-20'
type: 技术
tags: docker
note: docker学习总结
---
### 1、什么是docker？

​		docker是一个能够将开发的应用程序部署到容器的`开源引擎`。docker在虚拟化的容器执行环境中，增加了一个`应用程序部署引擎`。该引擎的目标就是提供一个轻量、快速的环境，能够运行开发者的程序，并方便高效的将程序从开发者的笔记本部署到测试环境，然后再部署到开发环境。

### 2、Docker组件

+ Docker客户端和服务器
+ Docker镜像
+ Registry
+ Docker容器

**1、Docker客户端和服务器**

​		Docker是一个客户-服务器（C/S）架构的程序。Docker客户端只需向Docker服务器或守护进程发出请求，服务器或守护进程将完成所有工作并返回结果。

**2、Docker镜像**

​		镜像是构建Docker世界的基石。用户基于镜像来运行自己的容器。镜像也是Docker生命周期中的“构建”部分。镜像是基于联合文件系统的一种层式的结构，由一系列指令一步一步构建出来。

​		也可以把镜像当做容器的“源代码”。镜像体积很小，非常“便携”，易于分享、存储和更新。

**3、Registry**

​		Docker用Registry来保存用户构建的镜像。Registry分为公共和私有两种。

**4、容器**

​		容器是基于镜像启动起来的，容器中可以运行一个或多个进程。镜像是Docker生命周期中的构建或打包阶段，而容器则是启动或执行阶段。

总的来说，Docker容器就是`一个镜像格式、一系列标准的操作、一个执行环境。`

### 3、docker能够用来做什么？

+ 加速本地开发和构建流程，使其更加高效、更加轻量化。本地开发人员可以构建、运行并分享Docker容器。容器可以在开发环境中构建，然后轻松的提交到测试环境中，并最终进入生产环境。
+ 能够让独立服务或应用程序在不同的环境中，得到相同的运行结果。
+ 用docker创建隔离的环境来进行测试。
+ docker可以让开发者先于本机是哪个构建一个复杂的程序或者架构来进行测试，而不是一开始就在生产环境部署、测试。
+ 构建一个多用户的平台即服务的（Paas）基础设施。
+ 为开发、测试提供一个轻量级的独立沙盒环境，或者将独立的沙盒环境用于技术教学。
+ 提供软件及服务（SaaS）应用程序。
+ 高性能、超大规模的宿主机部署。

### 4、docker命令详解

---

**容器生命周期管理命令**

+ **docker run** 该命令用于创建容器。

```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

options说明

```
-a stdin: 指定标准输入输出内容类型，可选 STDIN/STDOUT/STDERR 三项；
-d 后台运行容器，并返回容器ID。
-i 以交互模式运行容器，通常与-t同时使用。
-P 随机端口映射，容器内部端口随机映射到主机的高端口
-p 指定端口映射，格式为："主机(宿主)端口：容器端口"
-t 为容器重新分配一个伪输入终端，通常与-i同时使用。
--name="nginx-lb" 为容器指定一个名称
--dns 8.8.8.8 指定容器使用的DNS服务器，默认和宿主一致。
--dns-search example.com: 指定容器DNS搜索域名，默认和宿主一致；
-h "mars": 指定容器的hostname；
-e username="ritchie": 设置环境变量；
--env-file=[]: 从指定文件读入环境变量；
--cpuset="0-2" or --cpuset="0,1,2": 绑定容器到指定CPU运行；
-m :设置容器使用内存最大值；
--net="bridge": 指定容器的网络连接类型，支持bridge/host/none/container: 四种类型；
--link=[]: 添加链接到另一个容器；
-expose=[]: 开放一个端口或一组端口；
--volume , -v:	绑定一个卷
```

**例子**

1、使用docker镜像nginx:latest以`后台模式`启动一个容器,并将容器命名为mynginx。

```bash
docker run --name mynginx -d nginx:latest
```

2、使用镜像nginx:latest以后台模式启动一个容器,并将容器的80端口映射到主机随机端口。

```bash
docker run -P -d nginx:latest
```

3、使用镜像 nginx:latest，以后台模式启动一个容器,将容器的 80 端口映射到主机的 80 端口,主机的目录 /data 映射到容器的 /data。

```bash
docker run -p 80:80 -v /data:/data -d nginx:latest
```

4、绑定容器的 8080 端口，并将其映射到本地主机 127.0.0.1 的 80 端口上。

```bash
docker run -p 127.0.0.1:80:8080/tcp ubuntu bash
```

5、使用镜像nginx:latest以交互模式启动一个容器,在容器内执行/bin/bash命令。

```bash
docker run -it nginx:latest /bin/bash
```

6、创建了一个 python 应用的容器。

```bash
docker run -d -P training/webapp python app.py 
//python app.py是命令行，training/webapp是镜像，-P用来做容器内部端口随机映射到主机端口。
docker run -d -p 5000:5000 training/webapp python app.py
//也可以使用-p来绑定端口
docker run -d -p 127.0.0.1:5001:5000 training/webapp python app.py
//可以指定容器绑定的网络地址，比如绑定 127.0.0.1。
docker run -d -p 127.0.0.1:5000:5000/udp training/webapp python app.py
//默认都是绑定tcp端口，也可以绑定UDP端口。
```

+ **docker start/stop/restart 启动、停止、重启容器**

  ```bash
  docker start [OPTIONS] CONTAINER [CONTAINER...]
  docker stop [OPTIONS] CONTAINER [CONTAINER...]
  docker restart [OPTIONS] CONTAINER [CONTAINER...]
  ```

**例子**

```bash
//启动被停止的helloworld
docker start helloworld
//停止运行中的helloworld
docker stop helloworld
//重启容器helloworld
docker restart helloworld
```

+ **docker kill  杀掉一个运行中的容器**

  ```bash
  docker kill -s KILL helloworld //-s 向容器发送一个信号
  docker kill $(docker ps -a -q) //杀死所有正在运行的容器
  ```

+ **docker rm 删除一个或多个容器**

  ```bash
  docker rm [OPTIONS] CONTAINER [CONTAINER...]
  ```

  OPTIONS说明：

  + -f ：通过SIGKILL信号强制删除一个运行中的容器。
  + -l：移除容器间的网络连接，而非容器本身。
  + -v：删除与容器关联的卷。

  ```bash
  docker rm -f hello1 hello2 //强制删除容器hello1、hello2
  docker rm -l db //移除连接名为db的两个容器间的连接
  docker rm -v hello //删除容器hello,并删除容器挂载的数据卷
  docker rm $(docker ps -a -q) //删除所有已经停止的容器
  ```

+ **docker pause/unpause 暂停/恢复容器中所有的进程**

  ```bash
  docker pause hello
  docker unpause hello
  ```

+ **docker create 创建一个新的容器但是不启动它**

  ```bash
  docker create [OPTIONS] IMAGE [COMMAND] [ARG...] //语法同docker run
  //使用docker镜像nginx:latest创建一个名为hello的容器
  docker create --name hello nginx:latest
  ```

+ **docker exec：在运行的容器中执行命令,并且命令退出容器终端，不会导致容器的停止。**

  ```bash
  docker exec [OPTIONS] CONTAINER COMMAND 
  ```

  OPTIONS说明

  + -d：分离模式，在后台运行。
  + -i：即使没有附加也保持STDIN打开。
  + -t：分配一个伪终端。

  **实例**

  ```bash
  docker exec -it hello /bin/sh /root/hello.sh 
  //在容器hello中以交互模式执行容器里的/root/hello.sh脚本
  docker exec -i -t hello /bin/bash
  //在容器hello中开启一个交互模式的终端
  docker ps -a
  //查看在运行的容器，然后可以使用id进入容器
  docker exec -it 92de231ws32 /bin/bash
  ```

  **容器操作命令**

+ **docker ps：列出容器**

  ```bash
  docker ps [OPTIONS]
  ```

  OPTIONS说明

  + -a：显示所有的容器，包括未运行的。
  + -f：根据条件过滤显示的内容。
  + --format：指定返回值的模板文件。
  + -l：显示最近创建的容器。
  + -n：列出最近创建的几个容器。
  + --no-trunc：不截断输出。
  + -q：静默模式，只显示容器编号。
  + -s：显示总的文件大小。

  ps命令的输出详情介绍：

  **CONTAINER ID：容器ID**

  **IMAGE：使用的镜像。**

  **COMMAND：启动容器时运行的命令。**

  **CREARED：容器的创建时间。**

  **STATUS：容器状态。**

  状态有7种。

  + created(已创建)
  + restarting(重起中)
  + running(运行中)
  + removing(迁移中)
  + paused(暂停)
  + exited(停止)
  + dead(死亡)

  **PORTS：容器的端口信息合使用的连接类型（tcp/udp）**

  **NAMES：自动分配的容器名称。**

+ **docker inspect：获取镜像/容器的元数据**

+ **docker attach: 连接到正在运行中的容器**

  ```bash
  docker attach hello //hello是镜像名称
  ```

+ **docker events：从服务器获取实时事件。**

  ```bash
  docker events [OPTIONS]
  ```

  OPTIONS说明：

  + -f：根据条件过滤事件。
  + --since：从指定的时间戳后显示所有事件。
  + --until：流水时间显示到指定的时间为止。

  ```bash
  docker events --since="146700000"
  docker events -f "image"="hello" --since="146700000"
  ```

+ **docker logs：获取容器的日志。**

  ```bash
  docker logs [OPTIONS] CONTAINER
  ```

  OPTIONS说明:

  + -f：跟踪日志输出。
  + --since：显示某个开始时间的所有日志。
  + -t：显示时间戳。
  + --tail：仅列出最新N条容器日志。

  ```bash
  docker logs --since="2020-02-17" --tail=10 hello
  ```

+ **docker export：将文件系统作为一个tar归档文件导出到STDOUT。**

  ```bash
  docker export [OPTIONS] CONTAINER
  docker export -o hello-`date-%y%m%d`.tar hello //将hello容器按日期保存为tar文件。
  ```

+ **docker port：列出指定的容器的端口映射，或者查找将PRIVATE_PORT NAT到面向公众的端口。**

+ **docker commit：从容器创建一个新的镜像。**

  ```bash
  docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
  ```

  OPTIONS说明：

  + -a：提交的镜像作者。
  + -c：使用dockerfile指令来创建镜像。
  + -m：提交时的说明文字。
  + -p：在commit时，将容器暂停。

  ```bash
  //将容器a404c6c174a2 保存为新的镜像,并添加提交人信息和说明信息。
   docker commit -a "james" -m "test" hello  mymysql:v1 
  ```

+ **docker cp：用于容器和主机之间的数据拷贝。**

  ```bash
  docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH|-
  docker cp [OPTIONS]	SRC_PATH|- CONTAINER:DEST_PATH
  ```

+ **docker login/logout：登录到/登出docker镜像仓库，默认为docker hub**

  ```bash
  docker login -u 用户名 -p 密码
  docker logout
  ```

+ **docker pull：从镜像仓库中拉取或者更新指定仓库。**

  ```bash
  docker pull [OPTIONS] NAME[:TAG|@DIGEST]
  ```

  OPTIONS说明：

  + -a：拉取所有的tagged镜像
  + --disable-content-trust：忽略镜像的校验，默认开启。

  ```bash
  docker pull -a ubuntu
  ```

+ **docker push：将本地的镜像上传到镜像仓库，要先登录到镜像仓库。**

+ **docker search：从docker hub上查找镜像。**

  ```bash
  docker search [OPTIONS] TERM
  ```

  OPTIONS说明:

  + --automated：只列出automated build类型的镜像。
  + --no-trunc：显示完整的镜像描述。
  + -s：列出收藏数不小于指定值的镜像。

**本地镜像管理**

+ **docker images：列出本地镜像。**

  ```bash
  docker images [OPTIONS] [REPOSITOPY[:TAG]]
  ```

  OPTIONS说明:

  + -a：列出本地所有的镜像。
  + --digests:显示镜像的摘要信息。
  + -f：显示满足条件的镜像。
  + --format：指定返回值的模板文件。
  + --no-trunc：显示完整的镜像信息。
  + -q：只显示镜像ID。

  ```bash
  docker images ubuntu //
  ```

+ **docker tag：标记本地镜像，将其归入某一仓库。**

+ **docker rmi：删除本地一个或多个镜像。**

  ```bash
  docker rmi [OPTIONS] IMAGE [IMAGE...]
  ```

  OPTIONS说明:

  + -f：强制删除。
  + --no-prune：不移除该镜像的过程镜像，默认移除。

+ **docker build：用于使用Dockerfile创建镜像。**

  ```bash
  docker build [OPTIONS] PATH|URL|-
  ```

  ```bash
  docker build -t hello .//使用当前目录的dockerfile创建名为hello的镜像。
  docker build github/creack/dicker-firefox //使用url创建镜像。
  docker build -f ./dockerfile . //通过-f来指定Dockerfile文件的位置
  ```

+ **docker history：查看指定镜像的创建历史。**

+ **docker save：将指定镜像保存为tar归档文件。**

  ```bash
  docker save [OPTIONS] IMAGE [IMAGE...]
  docker save -o my_ubuntu_v3.tar runoob/ubuntu:v3
  ```

  

+ **docker load：导入使用docker save命令导出的镜像。**

  ```bash
  docker load < busybox.tar.gz
  docker load --input fedora.tar
  ```

  

+ **docker import：从归档文件中创建镜像。**

  ```bash
  docker import [OPTIONS] file|URL|- [REPOSITORY[:TAG]]
  docker import  my_ubuntu_v3.tar runoob/ubuntu:v4  
  ```

  





  

  

  








### docker之Dockerfile详解

​		Dockfile是一种被Docker程序解释的脚本，Dockerfile由一条一条的指令组成，每条指令对应Linux下面的一条命令。Docker程序将这些Dockerfile指令翻译真正的Linux命令。Dockerfile有自己书写格式和支持的命令，Docker程序解决这些命令间的依赖关系，类似于Makefile。**Docker程序将读取Dockerfile，根据指令生成定制的image。**

**1、FROM**

+ `FROM`指定一个基础镜像，一般情况下一个可用的Dockerfile一定是FROM为第一条指令。

+ FROM一定是首个非注释指令Dockerfile。
+ FROM可以在一个Dockerfile中出现多次，以便于创建混合的images。
+ 如果没有指定tag，latest将会被指定为要使用的基础镜像版本。

**2、COPY**

​		COPY 将文件从路径 `src` 复制添加到容器内部路径 `dest`。`src`必须是相对源文件夹的一个文件或目录，也可以是一个远程的url，`dest`是目标容器中的绝对路径。

**3、CMD**

​		dockerfile中只能有一个`CMD`指令。如果指定了多个，那么最后的`CMD`命令才会生效。`CMD`指令的主要作用是提供默认的执行容器。这些默认值可以包括

可执行文件，也可以省略可执行文件。当你使用shell或者exec格式时，cmd会自动执行这个命令。