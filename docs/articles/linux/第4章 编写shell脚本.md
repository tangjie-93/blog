# shell脚本编写

### 1、什么是shell脚本？

​		shell脚本就是包含一系列命令行的脚本。shell读取这些脚本，执行其中的所有命令，就好像这些命令就已经直接输入到命令行中一样。它不仅是一个强大的命令行接口，也是一个脚本语言解释器。

​		shell脚本能够运行的三个条件：

+ 创建一个shell脚本。
+ 使脚本文件可执行。
+ 把脚本放置到shell能够找到的地方。当没有指定可执行文件明确的路径名时，shell 会自动地搜索某些目录，
  来查找此可执行文件。

**1、脚本文件格式**

```js
//1、在第一行设置
#!/bin/bash //#!是一种特殊的结构，称为shebang，用来告诉操作系统将执行此脚本所用的解释器的名字。
```

**2、脚本文件权限**

```js
//2、设置可执行权限 755是每个人都能执行，700是文件所有者才能执行
chmod 755 hello
```

**3、脚本文件位置**

```js
echo $PATH //查看系统会自动搜索的目录，并执行其中的脚本文件，而该目录列表被存储在一个名为PATH的环境变量。第1种方法：将hello文件放置到PATH变量包含的目录中；第2种方法：将hello所在文件夹添加到PATH变量上去，或者创建一个文件夹放到PATH变量上去。PATH变量不包含hello文件所在目录时，在.bashrc文件中修改
export PATH=~/bin:"$PATH"
//然后重新读取这个.bashrc文件
. .bashrc 或者 source .bashrc
```

**4、脚本文件的好去处**

```js
1、系统中每个用户都可以访问
/usr/local/bin
2、系统管理员访问
/usr/local/sbin
3、大多情况下
/usr/local
```

### 2、启动一个项目

**1、变量和常量**

+ 变量名必须有字母数字和下划线组成。
+ 变量名的第一个字符必须是一个字母或下划线
+ 变量名中不许出现空格和标点符号

在赋值过程中，变量名，等号和变量值之间是没有空格的。

可以在同一行中对多个变量进行赋值。

```bash
#!/bin/bash 
# Program to output a system information page 
# 定义变量,并在变量中引用变量
title="System Information Report $HOSTNAME" res="this is a rsult"
# 定义常量
TITLE="this is a constant title"
# 在(())进行计算
data=$((5*7))
CURRENT_TIME=$(date)
catText=$(cat foo.txt)
# 引用变量$title
echo "<HTML> 
		<HEAD> 
    		<TITLE>$title</TITLE> 
    		$TITLE
		</HEAD> 
		<BODY>
    		<H1>$title</H1> 
    		$res
		</BODY> 
</HTML>"
```

​		在参数展开过程中，变量名可能被花括号"{}"包围。通过添加花括号，shell 不再把末尾的1解释为变量名的一部分。

```js
mv $filename ${filename}1 //$filename表示变量名
```

**2、Here Document**

​		here document 是另外一种 I/O 重定向形式，我们在脚本文件中嵌入正文文本，然后把它发送给一个命令的标准输入。

​		here documents 中的单引号和双引号会失去它们在 shell 中的特殊含义，把它们看作是普通的字符。

​		可以和任意能接受标准输入的命令一块使用。

​		它这样工作：

```bash
command << token 
text 
token
// command 是一个可以接受标准输入的命令名,token 是一个用来指示嵌入文本结束的字符串,这个 token 必须在一行中单独出现，并且文本行中 没有末尾的空格。
#!/bin/bash 
# Program to output a system information page 
# 定义变量,并在变量中引用变量
title="System Information Report $HOSTNAME" res="this is a rsult"
# 定义常量
TITLE="this is a constant title"
# 在(())进行计算
data=$((5*7))
CURRENT_TIME=$(date)
catText=$(cat foo.txt)
# 引用变量$title
cat << _EOF_
<HTML> 
		<HEAD> 
    		<TITLE>$title</TITLE> 
    		$TITLE
		</HEAD> 
		<BODY>
    		<H1>$title</H1> 
    		$res
		</BODY> 
</HTML>
_EOF_
```

### 3、自顶向下设计

​		这种先确定上层步骤，然后再逐步细化这些步骤的过程被称为自顶向下设计。这种技巧允许我们 把庞大而复杂的任务分割为许多小而简单的任务。自顶向下设计是一种常见的程序设计方法， 尤其适合 shell 编程。

**1、shell函数**

​		shell函数时位于其他脚本中的"微脚本"，作为自主程序，shell函数有两种语法形式：

```bash
function name { 
	commands return 
} 
name () { 
	commands return 
}
//name是函数名，commands是一系列包含在函数中的命令
```

​		Shell 函数的命名规则和变量一样。**一个函数必须至少包含一条命令**。函数定义与使用如下所示。

```bash
#!/bin/bash

#shell function demo

function func(){
    echo "Step2"
    return
}
# main program starts

echo "Step1"
func
echo "Step3"
```

**2、局部变量**

​		全局变量在整个程序中保持存在。 局部变量只能在定义它们的 shell 函数中使用，并且一旦 shell 函数执行完毕，它们就不存在了。

​		拥有局部变量允许程序员使用的局部变量名，可以与已存在的变量名相同，这些变量可以是全局变量， 或者是其它 shell 函数中的局部变量，却不必担心潜在的名字冲突。

```bash
#!/bin/bash

#global variable
foo=0

function fun1(){
    local foo //定义局部变量
    foo=1
    echo "fun1:foo=$foo"
    return
}

function fun2(){
    local foo
    foo=2
    echo "fun2:foo=$foo"
    return
}

echo "global foo=$foo"
fun1
echo "global foo=$foo"
fun2
echo "global foo=$foo"
```

### 4、流程控制——if分支语句

**1、if**

​		if的语句语法如下所示

```bash
//commands是一系列命令
if commands; then 
commands 
[elif commands; then 
commands...] 
[else commands] 
fi		
```

```bash
if [[ -d $dir_name ]]; then 
	if cd $dir_name; then 
		echo rm * # TESTING
    else 
        echo "cannot cd to '$dir_name'" >&2 
        exit 1 
    fi 
else 
	echo "no such directory: '$dir_name'" >&2 
	exit 1 
fi 
exit # TESTING
```

当命令执行完毕后，命令（包括我们编写的脚本和 shell 函数）会给系统发送一个值，叫做**退出状态**。这个值是一个0到255之间的整数，说明命令成功或者失败。零值说明成功，其他值说明失败。

```js
ls -d /usr/bin
echo $? //显示上一次命令的执行状态
```

**2、测试**

​		test命令执行各种各样的检查和比较。有两种等价模式。

```bash
test expression
[ expression ]
//expression是一个表达式，执行结果是true护着false。表达式为真时，test命令返回一个0退出状态，为假时，退出状态为1。
```

以下表达式用来计算文件状态。

| 表达式          | 如果                                                         |
| --------------- | ------------------------------------------------------------ |
| file1 -ef file2 | file1 和 file2 拥有相同的索引号（通过硬链接两个文件名指向相同的文件）。 |
| file1 -nt file2 | file1新于 file2。                                            |
| file1 -ot file2 | file1早于 file2。                                            |
| -b file         | file 存在并且是一个块（设备）文件。                          |
| -c file         | file 存在并且是一个字符（设备）文件。                        |
| -d file         | **file 存在并且是一个目录。**                                |
| -e file         | **file 存在。**                                              |
| -f file         | **file 存在并且是一个普通文件。**                            |
| -g file         | file 存在并且设置了组 ID。                                   |
| -G file         | file 存在并且由有效组 ID 拥有。                              |
| -k file         | file 存在并且设置了它的“sticky bit”。                        |
| -L file         | file 存在并且是一个符号链接。                                |
| -O file         | file 存在并且由有效用户 ID 拥有。                            |
| -p file         | file 存在并且是一个命名管道。                                |
| -r file         | **file 存在并且可读（有效用户有可读权限）。**                |
| -s file         | file 存在且其长度大于零。                                    |
| -S file         | file 存在且是一个网络 socket。                               |
| -t fd           | fd 是一个定向到终端／从终端定向的文件描述符 。 这可以被用来决定是否重定向了标准输 入／输出错误。 |
| -u file         | file 存在并且设置了 setuid 位。                              |
| -w file         | **file 存在并且可写（有效用户拥有可写权限）。**              |
| -x file         | **file 存在并且可执行（有效用户有执行／搜索权限）。**        |

```js
1 #!/bin/bash
2 # test-file: Evaluate the status of a file
3 FILE=~/.bashrc
4 if [ -e "$FILE" ]; then
5   if [ -f "$FILE" ]; then
6     echo "$FILE is a regular file."
7   fi
8   if [ -d "$FILE" ]; then
9     echo "$FILE is a directory."
10   fi
11   if [ -r "$FILE" ]; then
12     echo "$FILE is readable."
13   fi
14   if [ -w "$FILE" ]; then
15     echo "$FILE is writable."
16   fi
17   if [ -x "$FILE" ]; then
18     echo "$FILE is executable/searchable."
19   fi
20 else
21   echo "$FILE does not exist"
22   exit 1
23 fi
24 exit
```

**字符串表达式**

| 表达式                                 | 含义                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| string                                 | string 不为 null。                                           |
| -n string                              | 字符串 string 的长度大于零                                   |
| -z string                              | 字符串 string 的长度为零。                                   |
| string1 =string2<br>string1 == string2 | string1 和 string2 相同. 单或双等号都可以，不过双等号更受欢迎。 |
| string1 != string2                     | string1 和 string2 不相同。                                  |
| string1 > string2                      | sting1 排列在 string2 之后。这个 > 和 <表达式操作符必须用引号引起来（或者是用反斜杠转义） |
| string1 < string2                      | string1 排列在 string2 之前。                                |

 **整型表达式**

| 表达式                | 含义                          |
| --------------------- | ----------------------------- |
| integer1 -eq integer2 | integer1 等于 integer2        |
| integer1 -ne integer2 | integer1 不等于 integer2.     |
| integer1 -le integer2 | integer1 小于或等于 integer2. |
| integer1 -lt integer2 | integer1 小于 integer2.       |
| integer1 -ge integer2 | integer1 大于或等于 integer2. |
| integer1 -gt integer2 | integer1 大于 integer2.       |

例子

```js
#!/bin/bash 
# test-integer: evaluate the value of an integer. 
INT=-5 
if [ -z "$INT" ]; then 
	echo "INT is empty." >&2 
	exit 1 
fi 
if [ $INT -eq 0 ]; then 
	echo "INT is zero." 
else 
    if [ $INT -lt 0 ]; then 
		echo "INT is negative." 
	else 
    	echo "INT is positive." 
	fi 
	if [ $((INT % 2)) -eq 0 ]; then 
		echo "INT is even." 
	else 
    	echo "INT is odd." 
	fi
fi
```

`[[expression]]` ，expression是1个表达式，其计算结果为真或假 。expressiom增加了一个重要的表达式——string1=~regex。regex是正则表达式。

```js
[[string=~rrgex]]
[[string==regex]] //[[$FILE==foo.*]]
```

**(())——为整数而设计**

​		 (( )) 复合命名，其有利于操作整数。它支持一套 完整的算术计算。

```js
#!/bin/bash 
# test-integer2: evaluate the value of an integer. 
INT=-5 
if [[ "$INT" =~ ^-?[0-9]+$ ]]; then 
    if [ $INT -eq 0 ]; then 
        echo "INT is zero." 
    else 
        if ((INT < 0 && INT > -6)); then 
        	echo "INT is negative." 
        if [ $INT -lt 0 ]; then 
            echo "INT is negative." 
        else 
            echo "INT is positive." 
        fi 
        if [ $((INT % 2)) -eq 0 ]; then 
            echo "INT is even." 
        else 
            echo "INT is odd." 
        fi 
    fi 
else
    echo "INT is not an integer." >&2 
exit 1 
fi
```

**结合表达式**

​		通过使用逻辑操作符来结合表达式。 AND，OR，和 NOT。test 和 [[ ]] 使用不同的操作符来表示这些操作：

| 操作符 | test测试 | [[]]和()() |
| ------ | -------- | ---------- |
| AND    | -a       | &&         |
| OR     | -o       | \|\|       |
| NOT    | !        | !          |

```js
#!/bin/bash 
# test-integer3: determine if an integer is within a 
# specified range of values. 
MIN_VAL=1 
MAX_VAL=100 
INT=50 
if [[ "$INT" =~ ^-?[0-9]+$ ]]; then 
	# 在[[]]使用&&
	if [[ INT -ge MIN_VAL && INT -le MAX_VAL ]]; then 
    	echo "$INT is within $MIN_VAL to $MAX_VAL."
	else 
        echo "$INT is out of range." 
	fi 
    #在[]中使用-a ()需要添加转义符
    if [ ! \( $INT -ge $MIN_VAL -a $INT -le $MAX_VAL \) ]; then 
        echo "$INT is outside $MIN_VAL to $MAX_VAL." 
    else 
        echo "$INT is in range." 
    fi
else 
    echo "INT is not an integer." >&2 
exit 1 
fi
```

**5、控制操作符——分支的另一种方法**

​		bash 支持两种可以执行分支任务的控制操作符。语法如下：

```js
command1 && command2
command1 || command2

//创建temp文件夹，创建成功后再切换到新建的文件夹
mkdir temp && cd temp
//判断文件夹是否存在，不存在则创建
[ -d temp ] || mkdir temp 
```

### 5、读取键盘输入

**1、read——从标准输入读取数据**

​		read内部命令被用来从标准输入读取单行数据。该命令可以用来读取键盘输入。

​		`options`表示的是`read`支持的选项，`variable`是用来存储输入数值的一个或多个变量名。如果没有提供变量名，shell 变量 REPLY 会包含数据行。

```bash
read [-options][variable...] 
```

read支持以下选项：

| 选项         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| -a array     | 把输入赋值到数组 array 中，从索引号零开始。                  |
| -d delimiter | 用字符串 delimiter 中的第一个字符指示输入结束，而不是一个换行符。 |
| -e           | 使用 Readline 来处理输入。这使得与命令行相同的方式编辑输入。 |
| -n num       | 读取 num 个输入字符，而不是整行。                            |
| -p prompt    | 为输入显示提示信息，使用字符串 prompt。                      |
| -r           | Raw mode. 不把反斜杠字符解释为转义字符。                     |
| -s           | Raw mode. 不把反斜杠字符解释为转义字符。                     |
| -t seconds   | 超时. 几秒钟后终止输入。read 会返回一个非零退出状态，若输入超时。 |
| -u fd        | 使用文件描述符 fd 中的输入，而不是标准输入。                 |

```bash
 1 #!/bin/bash
 2 # read-integer: evaluate the value of an integer .
 3 echo -n "Please enter an integer -> " //-n表示不换行
 4 read int
 5 if [[ "$int" =~ ^-?[0-9]+$ ]]; then
 6   if [ $int -eq 0 ]; then
 7     echo "$int is zero."
 8   else
 9     if [ $int -lt 0 ]; then
 10         echo "$int is negative."
 11     else
 12         echo "$int is positive."
 13     fi
 14     if [ $((int % 2)) -eq 0 ]; then
 15         echo "$int is even."
 16     else
 17         echo "$int is odd."
 18     fi
 19   fi
 20 else
 21   echo "Input value is not an integer." >&2
 22 exit 1
 23 fi
```

read给多个变量赋值

```bash
1 #!/bin/bash
2 echo -n "please enter onoe or more values>"
3 read  var1 var2 var3 var4 var5
4 echo "var1=$var1"
5 echo "var2=$var2"
6 echo "var3=$var3"
7 echo "var4=$var4"
8 echo "var5=$var5"
```

read 配置密码输入及时间过期

```bash
1 #!/bin/bash
2 # read secret:input a secret
3 if read -t 10 -sp "enter secret pass >" secret_pass; then
4   echo -e "\nsecret pass =$secret_pass"
5 else
    6   echo -e "\ninput timeout">&2
7   exit 1
8 fi
```

**2、IFS**

​		内部字符分割符，默认值包含一个空格、一个tab和一个换行符。每一个都会把字段分割开。

```bash
  1 #!/bin/bash
  2 # split
  3 FILE=/etc/passwd
  4 read -p "enter a userName>" user_name //输入用户名
  5 file_info=$(grep "^$user_name:" $FILE) //过滤含有$user_name的文本行
  6 if [ -n "$file_info" ]; then
  	  # <<<指示一个here字符串，是重定向操作符
  7   IFS=":" read user pw uid gid name home shell <<< "$file_info" //以":"作为分割符。
  8   echo "user=$user"
  9   echo "uid=$uid"
 10   echo "gid=$gid"
 11   echo "fule name=$name"
 12   echo "home = $home"
 13   echo "shell= $shell"
 14 else
 15   echo "no such user $user_name" >&2
 16   exit 1
 17 fi
```

**注意** 不能使用`echo $file_info | IFS=":" read user pw uid gid name home shell`

该命令能生效，但是`REPLY`变量将总是为空。这是因为在`bash`中，管道线会创建子`shell`,是`shell`的副本，且用来执行命令的环境变量在管道线中。在子`shell`执行的时候，会为进程创建父环境的副本。当进程结束后，环境副本就会被销毁，`shell`永远都不能改变父进程的环境。

**3、矫正输入**

```bash
  1 #!/bin/bash
  2 # read-menu
  3 clear
  4 echo "
  5 please Select:
  6   1、Display System Infomation
  7   2、Display Disk space
  8   3、Display Home Space Utilization
  9   0、Quit
 10 "
 11
 12 read -p "Enter Selection [0-3]>"
 13 if [[ $REPLY =~ ^[0-3]$ ]]; then //正则匹配
 14   if [[ $REPLY == 0 ]]; then
 15     echo "Program terminated"
 16     exit
 17   fi
 18   if [[ $REPLY == 1 ]]; then
 19     echo "Hostname:$HOSTNAME"
 20     uptime
 21     exit
 22   fi
 23   if [[ $REPLY == 2 ]]; then
 24     df -h //查看磁盘使用情况
 25     exit
 26   fi
 27
 28
 29   if [[ $REPLY == 3 ]]; then
 30     if [[ $(id -u) -eq 0 ]]; then
 31       echo "Home Space Utilization (All Users)"
 32       du -sh /home/* //查看目录的真实大小
 33     else
 34       echo "Home Space Utilization ($USER)"
 35       du -sh $HOME
 36     fi
 37     exit
 38   fi
 39 else
 40   echo "Invalid entry." >&2
 41   exit 1
 42 fi
```

### 6、流程控制——while/until循环

**1、while**

```bash
while commands; do command;done
```

```bash
#!/bin/bash

count=1
while [ $count -le 5 ];
do
	echo "$count"
	count=$((count+1))
done
echo "finished"
```

**2、until**

```bash
#!/bin/bash
count=1
until [ $count -gt 5 ];
do	
	echo "$count"
	count=$((count+1))
done
echo "finished"
```

**3、使用循环读文件**

```bash
#!/bin/bash 
# while-read: read lines from a file 
while read distro version release; 
do 
	// \t是制表符 \n表示换行
	printf "Distro: %s\tVersion: %s\tReleased: %s\n" \ 
		$distro \ 
		$version \ 
		$release 
done < test.txt //从test.txt文件中读取数据 
```

### 7、调试技巧

**1、防错编程**

```bash
//先验证目录是否存在，存在再切换目录，删除文件
if [[ -d $dir_name ]]; then 
	if cd $dir_name; then 
		rm * 
	else 
		echo "cannot cd to '$dir_name'" >&2 
		exit 1 
	fi 
else 
	echo "no such directory: '$dir_name'" >&2 
exit 1 
fi
```

**2、追踪**

​		通过 -x 选项和 set 命令加上 -x 选项两种途径实现

```bash
//整个脚本追踪
#!/bin/bash -x 
# trouble: script to demonstrate common errors 
number=1 
if [ $number = 1 ]; then 
	echo "Number is equal to 1." 
else 
	echo "Number is not equal to 1." 
fi
```

```bash
//追踪一块区域
#!/bin/bash 
# trouble: script to demonstrate common errors 
number=1 
set -x # Turn on tracing 
if [ $number = 1 ]; then
	echo "Number is equal to 1." 
else 
	echo "Number is not equal to 1." 
fi 
set +x # Turn off tracing
```

### 8、流程控制——case分支

​		case的语法规则如下：

```bash
case word in 
	[pattern [| pattern]...) commands ;;]... 
esac
```

```bash
1 #!/bin/bash
2 # case-menu: a menu driven system information program
3 clear
4 echo " Please Select:
5   1. Display System Information
6   2. Display Disk Space
7   3. Display Home Space Utilization
8   0. Quit "
9 read -p "Enter selection [0-3] > "
10case $REPLY in
11   0)echo "Program terminated."
12     exit ;;
13   1)echo "Hostname: $HOSTNAME"
14     uptime ;;
15   2)df -h ;;
16   3)if [[ $(id -u) -eq 0 ]]; then
17       echo "Home Space Utilization (All Users)"
18       du -sh /home/*
19     else
20       echo "Home Space Utilization ($USER)"
21       du -sh $HOME
22     fi
23     ;;
24   *)echo "Invalid entry" >&2
25     exit 1
26     ;;
27 esac
```

case模式实例如下：

| 模式         | 描述                                                         |
| ------------ | ------------------------------------------------------------ |
| a）          | 若单词为 “a”，则匹配                                         |
| [[:alpha:]]) | 若单词是一个字母字符，则匹配                                 |
| ???)         | 若单词只有3个字符，则匹配                                    |
| *.txt)       | 若单词以 “.txt” 字符结尾，则匹配                             |
| *)           | 匹配任意单词。把这个模式做为 case 命令的最后一个模式，是一个很好的做法， 可以捕捉到任意一个 与先前模式不匹配的数值；也就是说，捕捉到任何可能的无效值。 |

模式使用实例

```bash
1 #!/bin/bash
2 read -p "enter world > "
3 case $REPLY in
	# 正则，条件模式，添加的 “;;&” 的语法允许 case 语句继续执行下一条测试，而不是简单地终止运行。
	q|Q) echo "terminal";;&
4   [[:alpha:]]) echo "is a single char";;&
	#正则匹配
5   [ABC][0-9]) echo "is A|B|C and 1~9";;&	
6   ???) echo "tree char";;&
7   *.txt) echo is a string endswith .txt;;&
8   *) echo "is something else";;&
9 esac
```

### 9、位置参数

**1、访问命令行**

​		shell提供了一个位置参数的变量集合。这些变量按照从0到到9进行命名。分别为**`$0~$9`**,**`$#`**用于统计参数的个数（不包括$0,从$1开始算）。

```bash
 //paramexam文件
 1 #!/bin/bash
 	echo "length of arguments is $#"
  2 echo "
  3 \$0=$0
  4 \$1=$1
  5 \$2=$2
  6 \$3=$3
  7 \$4=$4
  8 \$5=$5
  9 \$6=$6
 10 \$7=$7
 11 \$8=$8
 12 \$9=$9
 13 "
 //运行param文件，
 paramexam abcd e	//此时的$0为 paramexam, $1为abcd, $2为e
 paramexam * //此时$#是当前文件夹下文件或文件夹的个数
```

**shift命令**。每执行一次，$#的个数减1，跟数组的shift操作一样。

```bash
//循环遍历参数
#!/bin/bash
#获取文件名称
filename=$(basename $0)
count=1
while [[ $# -gt 0 ]]; do
	echo "arguments $count=$1";
	count=$((count+1))
	shift
done
```

**2、处理集体位置参数**

​		shell提供了两种特殊的参数，都能扩展成完整的位置参数列表。

​		`$*`：展开成一个从1开始的位置参数列表。当它被用双引号引起来的时候，展开成一个由双引号引起来的字符串，包含了所有的位置参数，每个位置参数由 shell 变量 IFS 的第一个字符（默认为 一个空格）分隔开。 

​		`$@`： 展开成一个从1开始的位置参数列表。当它被用双引号引起来的时候， 它把每一个位置参数展 开成一个由双引号引起来的分开的字符串。

### 10、流程控制——for循环

​		variable 是一个变量的名字，这个变量在循环执行期间会增加，words 是一个可选的条目列表， 其值会按顺序赋值给 variable，commands 是在每次循环迭代中要执行的命令。

**第一种for语法格式**

```bash
for variables [in words]; do
	commands
done
```

实例1

```bash
for i in A B C D;
do 
	echo $i
done
```

实例2——正则

```bash
//找出后缀名为.txt的所有文件
for i in *.txt;
do 
	echo $i
done
```

**第二种语法格式**  跟常规for循环格式一样。这里的expression都是算术表达式

```bash
for (( expression1; expression2; expression3 )); do 
	commands 
done
```

### 11、字符串和数字

**1、参数展开**

​		简单参数获取方式为`$variable`。也可以使用花括号将参数包裹起来。`${a}、${a}_file`

```bash
a="foo" //定义便令
$a //获取变量
${a}_file //获取变量
${11} //获取大于9的位置参数
```

**2、管理空变量的展开**

​		变量不存在或者空变量的参数展开形式如下：

```bash
${parameter:-word} //临时赋值
${parameter:?word}//这种方式echo $?的结果为1，也是临时赋值
```

实例

```bash
foo= //定义空变量
echo ${foo:-"this is a test"} //临时性赋值，再次获取$foo还是为空

foo=bar;
echo ${foo:-"this is a test"} //bar,如果变量不为空,那么将直接获取$foo的值
```

​		在变量存在的情况下，替换原来的值。

```bash
${parameter:+word} //也是临时性赋值
```

**3、返回变量名的参数展开**

​		返回以特定参数开头的已有变量名。

```bash
${!prefix*}
${!prefix@}
```

**4、字符串展开**

​		从字符串中获取部分字符串的形式如下所示：

```bash
${#parameter} //获取包含的字符串的长度。
${parameter:offset}//获取包含的字符串从offset索引后的字符串。若offset为负数时将从字符串的末尾开始算起，同时负数前面必须有一个空格。不然将返回整个字符串。
${parameter:offset:length} //获取以offset为开始索引后的length个字符
```

​		从展开的字符串中清除一部分文本。

```bash
${parameter#pattern}
${parameter##pattern}
${parameter%pattern}
${parameter%%pattern}
```

```bash
foo="test.txt.test.zip"
${foo#*.} //txt.test.zip 
${foo##*.} //zip
${foo%.*} //file.txt.test
${foo%%.*} //file
```

​		对parameter的内容进行查找和替换。

```bash
${parameter/pattern/string}  //只替换第一个匹配项
${parameter//pattern/string} //全部替换
${parameter/#pattern/string} //要求匹配项出现在字符串的开头
${parameter/%pattern/string} //要求出现在字符串的末尾
```

```bash
foo="file.pdf.pdf"
${foo/pdf/txt} //只替换第一个file.txt.pdf 临时替换
${foo//pdf/txt} //全部替换 file.txt.txt 临时替换
${foo/#pdf/txt} //file.pdf.pdf
${foo/%pdf/txt} //file.pdf.txt
```

**5、大小写转换**

​		可以使用`declare`命令来将字符串大写转换成小写字符。

```bash
declare -u upper //定义大写变量
declare -l lower //定义小写变量
foo="teSt"
upper=$foo
lower=$foo
echo $upper //TEST
echo $lower //test
```

​		以下四个参数展开可以执行大小写转换操作。

```bash
${parameter,,} //将parameter的值全部展开成小写字母
${parameter,} //仅仅把 parameter 的第一个字符展开成小写字母。 
${parameter^^} //把 parameter 的值全部转换成大写字母。 
${parameter^} //仅仅把 parameter 的第一个字符转换成大写字母（首字母大写）。
```

**6、算术求值和展开**

```bash
$((expression)) //expression为一个有效的算术表达式
```

​		指定不同的数基。

```bash
number 默认情况，10进制
0number 八进制度
0xnumber 十六进制
base#number number以base为底
```

```bash
echo $((076)) //62
echo $((0x76)) //118
echo $((2#110)) //6
```

**bc**：是一种高精度计算语言，可以用来计算浮点数。

```bash
bc -q //进入bc程序，并不显示版权信息
bc < foo.bc //把一个脚本直接传递给bc程序
```

### 12、数组

**1、创建数组**

```bah
a[1]=test //方式1
declare -a a //方式2
```

**2、数组赋值**

​		name是数组的名称，index是大于等于0的整数

```bash
name[index]=value 
name=(value1,value2...);
```

```bash
name=(a b)
name=([0]=a [1]=b)
```

**3、访问数组**

```bash
echo ${name[0]} //a
echo ${name} //获取的是数组的第一个元素
```

**4、数组操作**

​		**输出整个数组的内容** 	"*"和”@“可以用来访问数组中的每一个元素。

```bash
names=("张 三" "李 四" "王 五")
for i in ${names[*]}; do echo $i; done
for i in ${names[@]}; do echo $i; done
//输出的都是
张
三
李
四
王
五
//""是为了防止 shell 执行路径名展开操作。
for i in "${names[*]}"; do echo $i; done
for i in "${names[@]}"; do echo $i; done
//输出的都是
张三
李四
王五
```

​		**确定数组元素个数**

```bash
a[100]=foo
echo ${#a[@]} //1 求数组元素个数
echo ${#a[100]} //求a[100]元素的字符个数
```

​		**找到数组元素的下标**

```bash
${!arr[*]}
${!arr[@]}
```

​		**在数组末尾添加元素**

```bash
data=(1 2 3)
data+=(4 5 6)
echo ${data[*]}
```

​		**数组排序**

```bash
data=(2 12 4)
data_sorted=($(for i in "${data[@]}"; do echo $i; done | sort))
echo ${data_sorted[*]} // 12 2 4 是按字符串来排序的
```

​		**删除数组**

```bash
data=(1 2 3)
//删除整个数组
unset data
//删除数组元素，数组元素索引不变 删除之后元素3的索引还是2
unset "data[1]"

//给一个数组赋空值不会清空数组内容
foo=(a b c d e f) 
foo=
echo ${foo[*]} //a b c d e f

//任何引用一个不带下标的数组变量，则指的是数组元素0：
foo=A 
echo ${foo[@]} 
A b c d e f
```

​		**关联数组**		关联数组使用字符串而不是整数作为数组索引。 

```bash
declare -A colors 
colors["red"]="#ff0000" 
colors["green"]="#00ff00"
colors["blue"]="#0000ff"

```

**组命令和子shell**

​		bash允许把命令组合在一起。花括号和命令之间必须有一个空格，并且最后一个命令必须用一个分号或者换行符终止。

​		***组命令在当前 shell 中执行它的所有命令，而一个子 shell（顾名思义）在当前 shell 的一个 子副本中执行它的命令。**这意味着运行环境被复制给了一个新的 shell 实例。当这个子 shell 退出时，环境副本会消失，所以在子 shell 环境（包括变量赋值）中的任何更改也会消失。组命令运行很快并且占用的内存也少。

```bash
//组命令
{ command1;command2;[command3;...] }
//子shell
(command1;command2;[command3;...])
```

实例

```bash
ls -l >outut.txt
echo "this is atest" >> output.txtx //追加内容
cat foo.txt >> output.txt //追加内容

{ls -l;echo "this is a test";cat foo.txt;} > output.txt
(ls-l; echo "this is a test";cat foo.txt;) > output.txt
```

**进程替换**

```bash
<(list) //产生标准输出的进程
>(list) //接收标准输入的进程
```

实例

```bash
#!/bin/bash 
# pro-sub : demo of process substitution 
while read attr links owner group size date time filename; 
do 
	cat <<- EOF 
		Filename:     $filename 
		Size:         $size 
		Owner:        $owner 
		Group:        $group 
		Modified:     $date $time 
		Links:        $links 
		Attributes:   $attr
	EOF
done < test.txt
```

**陷阱**

​		argument是一个字符串，被读取当做一个命令，signal是一个信号的说明，它会触发执行所要解释的命令。

```bash
trap argument signal [signal...]
```

实例

```bash
1 #!/bin/bash
2 trap "echo 'this is a test'" SIGINT SIGTERM
3 for i in {1..5}; do
4   echo "iteration $i of 5"
5   sleep 5
6 done

//封装成函数
#!/bin/bash 
# trap-demo2 : simple signal handling demo exit_on_signal_SIGINT () { 
	echo "Script interrupted." 2>&1 
	exit 0 
} 
exit_on_signal_SIGTERM () { 
	echo "Script terminated." 2>&1 
	exit 0 
}
trap exit_on_signal_SIGINT SIGINT 
trap exit_on_signal_SIGTERM SIGTERM 
for i in {1..5}; do 
	echo "Iteration $i of 5" 
	sleep 5 
done
```
