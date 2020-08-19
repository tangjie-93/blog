---
title: git常用命令总结
date: '2020-01-14'
type: 技术
tags: git
note: git常用命令总结
---

### **1、Git是什么？与SVN的区别在哪里？**
| 区别             | Git                                                          | SVN                                                          |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 定义             | `Git是分布式版本控制系统`。没有中央服务器，每个人电脑上都是一个完整的版本库。 | `SVN是集中式版本控制系统`，版本库是集中放在中央服务器的，干活的时候先从中央服务器得到最新的代码，干完活你再把自己的代码推送到中央服务器 |
| 是否联网         | Git只有在pull和push等操作的时候才需要联网。                  | SVN只有在联网的情况下才能工作。                              |
| 版本记录         | Git在断网的情况下，可以在本地保存版本记录。所以合并起来很方便。同时可以在没网的情况下查看开发的版本历史。 | 在断网的情况下，SVN不工作，既不能提交也不能回滚，所以也不会有本地记录。 |
| 历史库的存放位置 | Git本地仓库包含代码库和历史库，在本地的开发环境中就可以记录历史。 | SVN的历史库存在中央仓库，每次对比和提交代码都必须连接到中央仓库才行 |
**Git和SVN的最根本区别在于历史版本维护的问题。**

### **2、Git仓库**

+ 1、 创建git仓库的方案
    + 第1种方案：在现有目录下初始化仓库
```js
    1)创建一个文件夹
    mkdir vue
    2)在该文件夹下新建仓库
    git init  
    //此时vue目录下会出现一个.git的目录，该目录是用来跟踪管理版本的
```
    + 第2种方案：克隆现有的仓库
```js
	git clone git@github.com:tangjie1111/vue.git
	git clone -b dev git@github.com:tangjie1111/vue.git //clone指定分支
```

> 2、将本地仓库跟远程库关联起来（在本地仓库文件夹下(vue)输入下面的命名）

```js
第1步，在GitHub上面新建一个空的仓库
    Create a new repo 
    //然后在Repository name填入vue，此时可以从这个仓库克隆出新的仓库，也可以把一个已有的本地仓库与之关		联。然后把本地仓库的内容推送到GitHub仓库，
第2步，将GitHub上的仓库关联到本地
    git remote add origin git@github.com:tangjie1111/vue.git 
    //git@github.com:tangjie-93/vue.git是仓库地址，tangjie1111是该用户吧账号名。 origin表示仓库的名称

    //关联多个远程仓库
    git remote add github git@github.com:tangjie-93/learngit.git 
    //关联github账户为tangjie-93，名为github的远程仓库
    git remote add gitee git@github.com:james/learngit.git
    //关联github账户为james，名为gitee的远程仓库
```

> 3、将远程仓库的内容拉取到本地且和本地分支合并

```js
git  pull origin master	//origin仓库名称，master分支名称
git  pull origin <远程分支名>:<本地分支名> //将远程指定分支 拉取到 本地指定分支上：
```

> 4、将远程仓库的内容拉取到本地

```js
git fetch [remote-name]	//访问远程仓库，从中拉取所有你还没有的数据
```

> 5、将当前分支内容推送到远程分支（如果没有该远程分支，则创建该远程分支）

```js
git push [remote-name] [branch-name]
git push -u origin master
//将本地库的所有内容推送到远程库。将当前分支master推送到远程。参数u使得Git不但会把本地的master分支内容推送到远程的master分支，还会把本地的master分支和远程的master分支关联起来。在以后的推送和拉取就可以简话化命令了。之后的推送就可以不用加u了。
git push origin dev 或者git push origin dev:dev 
//表示将当前分支推送到dev远程分支。origin是默认仓库名称，也可以使用其他名称
git push origin dev:test
//将本地的dev分支内容推送到远程仓库上的test分支
```

>6、查看远程仓库的名称

```js
git remote 
//查看远程仓库的名称,默认为origin
git remote -v
//查看远程仓库的信息
git remote show [remote-name]
//查看某一个远程仓库的更多信息
```

> 7、取消本地目录下关联的远程库

```js
git remote rm origin //删除已有的远程仓库
```

> 8、重命名远程仓库

```js
 git remote rename dev test
```

>9、重命名本地库

```js
git branch -m current-branch-name new-branch-name
```

> 10、在本地新建一个分支来跟踪远程分支

```js
git checkout -b serverfix //在本地创建分支并切换到serverfix分支
git checkout -b serverfix origin/serverfix
git checkout -b serverfix --track origin/serverfix
```

> 11、设置已有的本地分支跟踪一个刚刚拉取下来的远程分支

```js
git branch -u origin/serverfix
```

>12、将所有的本地分支列出来并且包含更多的信息

```js
git branch -vv //一般要先将服务器上的数据线拉取过来 git fetch --all，
git branch -v //只有分支名称信息
git branch -a //包含本地和远程分支
```

> 13、删除一个远程分支

```js
git push origin --delete dev //删除远程dev分支
```

> 14、删除本地分支

```js
git branch -D dev //删除本地dev分支
```

### **3、Git设置配置项**

​		对这台机器上所有的Git仓库都会使用这个配置，当然也可以对某个仓库指定不同的用户名和邮箱。
> 1、配置名字
```js
git config --global user.name "james";
```
> 2、配置邮箱

```js
git config --global user.email "14232134576.@qq.com";
```
> 3、查看配置列表

```js
git config --list 
```
>  4、查看某一配置项

```js
git config user.name
```
> 5、查看git有哪些命令

```js
git help 
git help config //获取config命令的手册
```
> 6、配置git命令别名

```js
git config --global alias.status st
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
```
### **4、版本回退**

> 1、查看最近到最远的提交日志

```js
//查看提交历史，以便确定要回退到哪个版本
git log 
//仅仅显示版本号和提交说明 --pretty=oneline表示将提交历史放在一行显示 --abbrev-commit在于缩短commit id。
git log --pretty=oneline --abbrev-commit
//定制化要显示的记录格式
git log --pretty=format:"%h - %an, %ar: %s" 
//以图的形式展示提交信息合合并信息
git log --graph --pretty=oneline --abbrev-commit 
```

> 2、将当前版本回退到上一个版本

```js
git reset --hard HEAD^ //HEAD指向当前版本
```

> 3、回退到指定版本

```js
git reset --hard 1092a //1092a表示版本号的前几位
git reset HEAD "文件" //把暂存区的修改撤销掉
```

> 4、查看记录的每一次命令

```js
git reflog //查看命令历史，以便要回到未来的哪个版本
```

> 5、查看最近几次提交的内容差异

```js
git log -p -n //-p表示按补丁格式显示每个更新之间的差异
```

> 6、查看每次提交的简略的统计信息

```js
git log --stat
```

> 7、限制输出长度

```js
//查看最近两周的提交
git log --since=2.weeks
//查看指定作者指定时间段的提交 
git log --pretty="%h - %s" --author=tangjie-93 --since="2008-10-01"
```

> 8、按指定关键字进行筛选

```js
git log -Sgit //按git关键字筛选提交的内容
```

> 9、查看最后一次的提交记录

```js
 git log -1
```

> 10、查看提交历史、各个分支的指向以及项目的分支分叉情况

```js
git log --oneline --decorate --graph --all
```

> 11、查看某个文件的修改记录

```js
git blame 文件名 -L//参数L来检查需要修改的某几行。
```

> 12、查看之前提交的内容

```js
 git show commitId
```

**1、下图是--pretty=format常用选项**<br>

```js
%H		提交对象（commit）的完整哈希字串
%h		提交对象的简短哈希字串
%T		树对象（tree）的完整哈希字串
%t		树对象简短哈希字串
%P		父对象（parent）的完整哈希字串
%p		父对象（parent）的简短哈希字串
%an		作者的名字
%ae		作者的电子邮件地址
%ad		作者修订地址（可以用--date="选项定制格式"）
%ar		作者修订日期，按多久以前的方式显示
%cn		提交者的名字
%ce		提交者的电子邮件地址
%cd		提交日期
%cr		提交日期，按多久以前的格式显示
%s		提交说明
```

**2、下面是git log的常用选项**

```js
-p					按不定格式显示每个更新之间的差异
--stat				显示每次更新的文件修改统计信息。
--shortstat			只显示——stat中最后的行数修改添加移除统计。
--name-only			仅在提交信息后显示已修改的文件清单。
--name-status		显示新增、修改、删除的文件清单。
--abbrev-commit		仅显示SHA-1的前几个字符，而非所有的40个字符。
--relative-date		使用较短的相对时间显示（比如 "2 weeks ago"）
--graph				显示ASCII图表的分支合并历史
--pretty			使用其他格式显示历史信息。选项有oneline，short，full和format(后跟指定格式)
```

**3、下图是限制git log输出的选项**

```js
-(n)				仅显示最近的n条提交
--since,--after		仅显示指定时间之后的提交
--until,--before	仅显示指定时间之前的提交
--author			仅显示指定作者相关的提交
--committer			仅显示指定提交者相关的提交
--grep				仅显示指定关键字的提交
-S					仅显示添加或移除了某个关键字的提交
```

### **5、工作区和暂存区**
<img src="../../images/git.jpg" alt="暂无图片" >

+ **工作区：** 在电脑里能看到的目录，如vue文件夹就是一个工作区。
+ **版本库：** 工作区的隐藏目录.git。
+ **暂存区：** 版本库中存放的stage（或者叫index）的区域，以及Git为我们自动创建的第一个分支(master),以及指向master的一个指针HEAD。

>1、将工作区的文件添加到暂存区

```js
git add "文件或者目录" 
//实际上是把工作区的文件添加到暂存区；或者跟踪(track)新添加的文件;同时还能用于合并时将有冲突的文件标记为已解决状态。该命令可被理解为"添加内容到下一次提交中"
// 注意: 执行git add的文件，还没执行git commit的文件，再次被修改后，需要重新执行git add命令才行。
git commit -m "描述" 
//把暂存区的所有内容提交到当前分支。
//注意:提交记录的是放在暂存区的快照。
git add -u git add -update
// 提交所有被删除和修改的文件到数据暂存区
git add .
// 提交s所有修改的和新建的数据到暂存区
git add -A git add -all
// 提交所有被删除、被替换、被修改和新增的文件到数据暂存区
```

> 2、 将暂存区的文件提交到当前分支

```js
git commit -a -m "描述" 
//把已经跟踪过的文件暂存起来一起提交。
git commit --amend
//用于修改提交内容
```

> 3、查看工作区文件的当前状态

```js
git status //查看工作区的当前状态
git status -s 或者 git status --short//将当前工作区的转态信息简化
```

> 4、查看工作区文件和暂存区文件的差异(查看未暂存文件的修改)

```js
git diff //比较当前工作目录中当前文件和暂存区文件之间的差异。
```

> 5、查看暂存区文件和当前分支文件的区别（查看已暂存的文的修改）

```js
git diff --cached git diff --staged  
//查看提交到暂存区但还没提交到分支的内容。也就是比较暂存区和仓库分支里的区别。
```

> 6、查看工作区文件和当前分支最新版本文件的区别

```js
git diff HEAD -- "文件" //查看工作区和版本库里最新版本的某个文件的区别
```

### **6、撤销修改**

> 1、将文件在工作区的修改全撤销
```javascript
    git checkout -- "文件" 
    //把文件在工作区的修改全撤销。总之就是让这个文件回到最近一次git commit或 git add的状态。分两种情况讨论：
    //情况1，文件自修改后还没有放到暂存区，撤销修改后就回到和版本库一样的状态。如果此时你想把刚刚撤销的内容复原的话，如果此时的编辑器还没关掉的话，使用撤销"CTRL+Z"可以回到撤销之前的状态。
    //情况2，文件已经添加到暂存区，现在又做了修改，撤销修改就回到添加到暂存区后的状态。

    git checkout -- "文件" 中的--很重要，没有--，就变成了`切换到另一个分支`的命令。
```
> 2、将暂存区的修改撤销掉，就是撤销执行了add命令还没有执行commit命令的文件
```js
    git reset HEAD "文件" 
    //将暂存区的修改撤销掉。使得工作区中文件与当前分支文件一样。
```
### **7、删除文件**
> 1、将文件从暂存区中删除，分为以下两步。先删除，再提交
```js
    git rm "文件" //从暂存区中删除该文件，并且会连带从工作目录中删除指定的文件
    git commit -m "delete file" //

    git checkout -- "文件" //用版本库里的文件替换工作区的版本，无论是修改还是删除。
```
> 2、如果删除之前修改过并且已经放到暂存区的话，就必须用强制删除选项-f 。用于防止误删还没有添加到快照区域的数据。
```js
    git rm  -f "文件" 
```
> 3、删除git仓库中的数据，但文件仍然保留在磁盘中。
```js
    git rm --cached "文件"

```
### **8、分支管理**
**1、创建和合并**

&#8195;&#8195;每次提交，Git都把它们串成一条时间线，该时间线就是分支。master称为主分支，`master(分支)是指向提交对象的可变指针，HEAD指向的是当前分支`。每次像maste分支r提交，`master`分支都会向前移动一步，提交的越多，master分支的线就越来越长。
&#8195;&#8195;当我们创建新的分支`dev`时，把`HEAD`指向当前分支`dev`。此时对工作区的修改和提交就是针对`dev`分支了，提交一次，`dev`分支的指针就向前移动一步，而master指针不变。。<br>
> 1、创建分支
```js
    git checkout -b dev 或者 git switch -c dev
    //相当于下面的两条执行语句
    git branch dev //创建分支
    git checkout dev //切换回当分支
```
> 2、查看当前分支
```js
    git branch //会列出当前所有分支，且当前分支会标记一个`*`号
    git branch -a //查看本地和远程仓库的所有分支
```
> 3、切换分支
```js
    git checkout dev或者 git switch dev
```
> 4、合并分支
```js
    git merge dev //合并某分支到当前分支
```
> 5、删除分支
```js
    git branch -d dev
```
> 6、强行删除分支
```js
    git branch -D dev
```
> 7、创建远程分支到本地
```js
    git checkout -b dev origin/dev
```
> 8、将本地分支推送到远程并在远程创建相同的分支
```js
    git push origin dev:dev
```
> 9、删除远程分支
```js
    git push origin :dev //origin 是远程仓库的默认名称
```
> 10、查看每个分支的最后一次提交
```js
    git branch -v
```
> 11、查看已经合并到当前分支的分支
```js
    git branch --merged
```
> 12、查看尚未合并到当前分支的分支
```js
    git branch --no-merged
```
&#8195;&#8195;**创建当前分支**（如下图所示）

<img src="../../images/git-branch.jpg" alt="暂无图片" style="display:block;">

&#8195;&#8195;**在当前当前分支提交，时间线的变化**（如下图所示）

<img src="../../images/git-branch2.jpg" alt="暂无图片">
**2、解决冲突**

```javascript
git log --graph --pretty=oneline //查看分支的合并情况
1、切换到dev分支,修个文件
    vi test.md
    git add test.md
    git commit -m "modify test.md"
    git switch master
    git merge dev//合并分支，冲突了
2、解决冲突
    vi test.md
    git add "test.md"
    git commit -m "modify .test.md" //此时自动合并了,此时当前分支上的数据是最新的，如果想在其他分支上也更新数据，可以在其他分支上git merge "其他分支"使得数据最新

3、通常在合并分支时，Git默认采用的是`Fast Forwar`模式，但是在这种模式下，删除分支后，会丢掉分支信息。
    git merge --no-ff -m "merge with no-ff" dev //表示禁用Fast Formard的方式，`的模式会记录分支历史。 -m 是因为本次合并会创建一个新的提交。`no-ff
```
**3、bug分支**

```javascript
//将当前工作现场存起来，暂存没法提交的工作现场
git stash 
//查看存储的列表
git stash list 
//恢复指定的stash，但是stash的内容并没有删除
git stash apply stash@{0} 
//删除stash
git stash drop 
//恢复stash的同时也把stash删除了
git stash pop 
//复制一个特定的提交到当前分支
git cherry-pick commitid 
//在本地创建和远程分支对应的分支,名称最好一样
git checkout -b branch-name origin/branch-name 
//建立本地分支和远程分支的关联
git branch --set-upstream branch-name origin/branch-name
//将原本分叉的提交历史变成一条直线。本质上就是把本地未push的分叉提交历史整理成直线。 使得我们在看历史提交的变化更容易些。其实就是把我们本地的提交放到了别人提交之后了。不足的是本地的分支提交已经被修改过了。
git rebase 
```
### **9、标签管理**
&#8195;&#8195;标签是版本库的快照，是指向某个commit的指针。目的在于可以让人们更快的记住。
> 1、创建标签
```js
git tag "标签名" //默认是对最新的commit 设置标签
git tag "标签名" commitid //对特定commit设置标签
```
> 2、后期打标签
```js
git tag -a <tagname> -m "blablabla..." commitid 
    //指定标签信息 commitid表示版本id
```
> 3、查看所有标签
```js
git tag
git show "标签名"
//查看该标签的详细信息
```
> 4、附注标签
```js
git tag -a <tagname> -m "blablabla..."
//-a表示指定标签名 -m表示指定说明文字
```
> 5、删除标签
```js
git tag -d "标签名"
tit push origin :refs/tags/"标签名"//可以删除一个远程标签
```
>6、推送标签
```js
git push origin "标签名" 
//推送一个本地标签到远程仓库
git push origin --tags 
//推送全部未推送过的本地标签到远程
```



