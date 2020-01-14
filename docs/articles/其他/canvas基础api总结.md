# canvas基础api总结

&#8195;&#8195;**canvas是一种基于javascript的绘图api。而是svg和VML是使用XML来进行描述绘图。各有缺点和优势。svg绘图时容易编辑，只要重描述中移除元素就行，而canvas要移除原有的元素进行重新绘制。**
 ### **1、颜色、样式及阴影设置**

 属性 | 描述 
 -- | -- 
 fillStyle | 设置或返回用于填充绘画的颜色、渐变或模式（对应着面）
 strokeStyle | 设置或返回用于笔触的颜色、渐变或模式（对应着线）
 shadowColor | 设置或返回用于阴影的颜色
 shadowBlur | 设置或返回用于阴影的模糊级别(该属性必须在fill或者fillRect之前设置才有用)
 shadowOffsetX | 设置或返回阴影距形状的水平距离
 shadowOffsetY | 设置或返回阴影距形状的垂直距离

```javascript

ctx.fillStyle=color|gradient|pattern;
//默认值是白色
ctx.strokeStyle=color|gradient|pattern;
//默认值是白色
```
+ color:指示绘图笔触的[CSS颜色值](https://www.w3school.com.cn/css/css_colors_legal.asp)。默认值是#000000。常见表示方式有"red"、FFFF"、rgb(1-255,1-255,1-255)以及rgba(1-255,1-255,1-255,0-1)

+ gradient：用于填充绘图的[渐变对象](https://www.w3school.com.cn/tags/canvas_createlineargradient.asp)（线性或放射性）
+ pattern：用于创建pattern笔触的pattern对象。与设置样式配合使用的方法是填充绘制和边绘制。

### **2、线条样式设置**
属性 | 描述
-- | --
lineCap | 设置或返回线条的结束端点样式。属性可以是round（末端为圆形）、butt（默认值，末端为平直的边缘）以及square（线条末端为正方向线帽）。
lineJoin | 设置或返回两条线相交时，所创建的拐点类型。属性可以是bevel(斜角)、round(圆角)和miter(尖角)
lineWidth | 设置或返回当前的线条宽度。
miterLimit | 设置或返回最大的斜接长度。斜接长度值的是两条线交汇处内角和外交之间的距离。`只有当lineJoin为miter时，miterLimit才有效.当斜接长度超过miterLimit的值时，边角会以lineJoin的bevel类型来显示。miterLimit属性的主要作用是为了避免斜接长度过长`
```javascript
    const canvas=document.querySelector("#demo");
    const ctx=canvas.getctx("2d");  
    ctx.beginPath();
    ctx.lineWidth=10;
    ctx.lineJoin="round";
    ctx.moveTo(20,20);
    ctx.lineTo(100,100);
    ctx.closePath();

```
### **3、常与设置样式配合使用的方法**

 方法 | 描述 
 -- | -- 
createLinearGradient(x0，y0，x1，y1) | 创建线性渐变，（x0，y0）和（x1，y1）是渐变的开始位置和结束位置。返回的值可以直接赋值给fillStyle。
createPattern(img,"repeat|repeat-x|repeat-y|no-repeat") | 在指定的方向上重复指定的元素.img表示使用的图片、画布或视频元素。repeat是默认值，在水平和垂直方向上重复；repeat-x表示只在水平方向上重复；repeat-y表示在垂直方向上重复；no-repeat该模式只显示一次（不重复）。返回的值可以直接赋值给fillStyle。
createRadialGradient(x0，y0，r0，x1，y1，r1) | 创建放射状/环形的渐变。x0，y0，r0表示的是渐变的开始的圆的x、y坐标以及开始的圆半径。x1，y1，r1表示的是渐变的结束的圆的x、y坐标以及结束的圆的半径。返回的值可以直接赋值给fillStyle。
addColorStop(0-1，color) | 规定渐变对象中的颜色和停止位置，第一个参数的范围为0-1，第二个参数为颜色值。


###  **4、形状设置**

方法 | 描述
-- | --
fill() | 填充当前绘图（对应着面）
stroke() | 绘制已定义的路径。（对应着线）
beginPath() | 起始一条路径或者是重置当前路径。（对应着线）
moveTo(x,y) | 把路径移动到动画中的指定点，`不创建线条`。x、y对应着路径的目标位置的x、y坐标。
lineTo() | 添加一个新点，然后在画布中创建从上一个点（lineTo或moveTo中的坐标点）到该点的线条。
closePath() | 创建当前点到开始点的路径。一般用于闭合多边形。
clip() | 从原始画布剪切任意形状和尺寸的区域。
rect() | 创建矩形
fillrect() | 绘制被填充的矩形
strokeRect() | 绘制矩形(无填充)
clearRect() | 在指定的矩形内清除指定的像素
quadraticCurveTo(cpx,cpy,x,y) | 创建二次贝塞尔曲线。(cpx,cpy)控制点的坐标;(x,y)结束点的坐标。
bezierCurveTo() | 创建三次贝塞尔曲线
arc() | 创建弧/曲线（主要是创建圆形或部分圆）
arcTo() | 创建两切线之间的弧/曲线

 ```javascript
 /*1、设置矩形填充区域*/
const canvas=document.querySelector("#demo");
const ctx=canvas.getctx("2d");
ctx.fillStyle="red";
ctx.fillRect(0,0,200,200);
ctx.clearRect(0,0,100,100);//
//注意：fill()跟rect()方法一起使用时，相当于使用fillRect();但是clearRect()方法只能跟fillRect()起作用。
ctx.fillStyle="red";
ctx.rect(0,0,200,200);
ctx.fill();

//2、设置矩形线框区域*/
const canvas=document.querySelector("#demo");
const ctx=canvas.getctx("2d");
ctx.strokeStyle="red";
ctx.strokeRect(10,10,200,200);
ctx.stroke()
//3、绘制线条记闭合多边形*/
var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");
ctx.beginPath();//开始绘制线条
ctx.moveTo(20,20);//设定线条起始点（20,20）
ctx.lineTo(20,100);//移动到（20,100）位置
ctx.lineTo(70,100);//移动到（70,100）位置
ctx.closePath();//创建从当前点到起始点的路径
ctx.stroke();//将线条绘制到画布上
/*4、绘制贝塞尔曲线*/
ctx.beginPath();
ctx.moveTo(20,20);//贝塞尔曲线的开始点
ctx.quadraticCurveTo(20,100,200,20);//（20,100）表示贝塞尔曲线的控制点。（200,20）表示贝塞尔曲线的结束点
ctx.stroke();
/*5、绘制3次贝塞尔曲线*/
ctx.beginPath();
ctx.moveTo(20,20);//贝塞尔曲线的开始点
ctx.quadraticCurveTo(20,100，200,100,200,20);//（20,100）表示贝塞尔曲线的控制点1。（200,100）表示贝塞尔曲线的控制点2。（200,20）表示贝塞尔曲线的结束点
ctx.stroke();

/*6、绘制矩形*/
/*x表示矩形左上角的坐标；y表示左上角的y坐标;width:矩形的宽度，以像素记;height:矩形的高度，以像素记*/
ctx.rect(x,y,width,height);
ctx.fillRect(x,y,width,height);
ctx.strokeRect(x,y,width,height);
ctx.clearRect(x,y,width,height);

/*7、绘制圆*/
ctx.arc(x,y,r,sAngle,eAngle,counterclockwise);
//x:圆的中心x坐标;y:圆的中心y坐标;r:圆的半径;sAngle:起始角，以弧度记（弧的圆形的三点钟位置为0度）。;eAngle:结束角，以弧度记。;counterclockwise:可选。规定应该逆时针还是顺时针绘图。False=顺时针（默认），true=逆时针。
/*创建实心圆*/
const canvas=document.querySelector("#demo");
const ctx=canvas.getctx("2d");
ctx.arc(100,75,50,0,2*Math.PI);
ctx.fillStyle="green"
ctx.fill();
/*创建空心圆*/
ctx.arc(100,75,50,0,2*Math.PI);
ctx.strokeStyle="green";
ctx.stroke();
/*8、创建两个切线之间的弧*/
ctx.beginPath();
ctx.moveTo(20,20);           // 创建开始点
ctx.lineTo(100,20);          // 创建水平线
ctx.arcTo(150,20,150,70,50); // 创建弧
ctx.lineTo(150,120);         // 创建垂直线
ctx.stroke(); 
 ```
### **5、转换设置**
方法 | 描述
-- | --
scale(scalewidth,scaleheight) | 缩放当前绘图至更大或更小。`对绘图进行缩放，所有之后的绘图也会被缩放，定位也会被缩放，线框也会被缩放，都是在原来的基础上进行缩放的`
rotate(angle) | 旋转当前绘图。旋转角度以弧度计。一般使用`degrees*Math.PI/180来计算弧度，是以（0,0）为基准点进行旋转的`
translate() | 重新映射画布上的（0,0）位置。
translate(a,b,c,d,ef) | 替换当前的变换矩阵。a表示水平缩放绘图；b表示水平倾斜绘图；c表示垂直倾斜绘图；d表示垂直缩放绘图；e表示水平移动绘图；f表示垂直移动绘图。
setTransform(ab,c,d,ef) | 将当前转换设置为单位矩阵。然后运行transform。参数意义跟transform的完全一样。`不同的是transform是相对上一次的变换再次进行变换。而setTransform是在最开始的基准上进行变换。`


```javascript
    /*1、缩放*/
    ctx.strokeRect(5,5,25,15);
    ctx.scale(2,2);//x,y轴方向都缩放两倍
    ctx.strokeRect(5,5,25,15);//所以此时实际上运行的代码是ctx.strokeRect(5*2,5*2,25*2,15*2)
    ctx.scale(2,2);//在原来的基础上在x,y轴方向都缩放两倍,
    ctx.strokeRect(5,5,25,15);//所以此时实际上运行的代码是ctx.strokeRect(5*2*2,5*2*2,25*2*2,15*2*2)
    ctx.scale(2,2);
    ctx.strokeRect(5,5,25,15);

     /*2、旋转*/
     //注意：rotate()必须在fillRect（）等方法之前调用，才能起到作用。
    ctx.rotate(20*Math.PI/180);//以（0,0）基准点，将下面的图形旋转20°。
    ctx.fillRect(50,20,100,50);

    /*3、重新设置基准点位置*/
    ctx.fillRect(10,10,100,50);
    ctx.translate(70,70);//将起点设置为（70,70）
    ctx.fillRect(10,10,100,50);//相当于设置（80,80,100,50）

    /*4、变换矩阵*/
    ctx.fillStyle="yellow";
    ctx.fillRect(0,0,250,100)
    //水平缩放参数为1，然后再x，y轴上分别移动10
    ctx.transform(1,1,0,1,10,10);
    ctx.fillStyle="red";
    ctx.fillRect(0,0,250,100);
    //相对于上一次的变换，在x,y轴上分别移动10
    ctx.transform(1,0,0,1,10,10);
    ctx.fillStyle="blue";
    ctx.fillRect(0,0,250,100);
```
### **6、文本设置**
属性 | 描述
-- | --
font | 设置或返回文本内容的当前属性
textAlign | 设置或返回本文内容的当前对齐方式。值有start(文本在指定的位置开始，默认值)、end（文本在指定的位置结束）、center（文本的中心北放在指定位置）、left（文本左对齐）、right（文本右对齐）
textBaseLine | 设置或返回在绘制文本时使用的当前文本基线。属性可以是alphabetIC、top、hanging、middle、ideaographic、bottom

```javascript
//绘制文本
ctx.font="40px Arial";
ctx.fillText("hello world",10,50)
//用渐变色绘制文本
ctx.font="30px Verdana";
ctx.textAlign="center";
const gradient=ctx.createLinearGradient(0,0,300,0);
gradient.addColorStop(0,"red");
gradient.addColorStop(0.5,"blue");
gradient.addColorStop(1,"green");
ctx.strokeStyle=gradient;
ctx.strokeText("hello world",100,90);
//计算文本的宽度
 ctx.fillText("width:"+ctx.measureText("javascript").width,10,50);
```
方法 | 描述
-- | --
fillText(text,x,y,maxWidth) | 在画布上绘制"被填充的"文本。（x,y）表示开始绘制文本的位置。text表示输出到画布上的文本。maxWidth是可选的，表示允许的最大文本宽度，以像素计。
strokeText() | 在画布上绘制文本(无填充)
measureText(txt) | 返回包含指定文本宽度的对象。

### **7、图像操作**
方法 | 描述
-- | --
drawImage() | 在画布上绘制图像、画布或视频
createImageData() | 创建新的、空白的imageData对象。
getImageData（） | 返回ImageData对象，该对象为画布上指定的矩形复制像素元素。
putImageData() | 把图像数据 （从指定的ImageData对象）放回画布上。

### **8、状态保存及恢复**
方法 | 描述
-- | --
save() |  保存当前Canvas画布状态并放在栈的最上面，可以使用restore()方法依次取出。绘图效果本身不会被保存，保存的只是绘画状态。包括当前矩阵变换、当前裁剪区域以及当前虚线设置和一些属性值。
restore() | 依次从堆栈的上方弹出存储的canvas状态，如果没有任何存储的Canvas转态，则执行此方法没有任何变化。

```javascript
    
```



