

<h3 id="a15">15、浅拷贝和深拷贝的区别</h3>

  在说拷贝之前需要说一下赋值的问题。

  >**基本类型赋值：** 赋值之后两个变量互不干扰。    
  >**引用类型赋值：** 复制的是指针，两个对象指同一个内存地址，所有互相影响。

  <h4>&#8195;1、浅拷贝</h4>

  有以下两个特点：      

  >1、重新在堆中开辟内存，**拷贝前后对象的基本数据类型**互不影响。   
  >2、**只拷贝一层**，不能对对象中的子对象进行拷贝,子对象还会互相影响（复制）。

        var person={
        	name:"李明",
        	age:40,
        	arr:[1,2,3,4]			
        }
        function shallowCopy(objData){
        	var obj={};
        	for(var prop in objData){//按字母大小升序排序循环
        		if(objData.hasOwnProperty(prop)){
        			obj[prop]=objData[prop]
        		}
        	}
        	return obj;
        }
        var sCopyData=shallowCopy(person);
        sCopyData["name"]="张三";
        sCopyData["arr"][0]=23;		
        console.log(sCopyData);
        console.log(person);

输出结果如下：

<img width="300px"  src="https://user-gold-cdn.xitu.io/2019/4/9/16a02ca9220fdf5b?w=459&h=260&f=png&s=27003">

​		**分析：可以看出修改拷贝后对象的name属性，没有改变原来对象的name属性。改变拷贝后对象的arr属性后，拷贝前对象的arr属性也改变了。这是因为name属性对应的值是你基本数据类型，所以互不影响。而arr对应的属性是数组是引用类型，拷贝前后对象的arr属性指向的还是同一个内存地址。所以互相影响。**

<h4>&#8195;2、深拷贝</h4>

有以下两个特点：

>1.	在堆中开辟空间，**拷贝前后的两个对象互不影响。**
>2.	不止拷贝一层，对对象中的子对象进行递归拷贝。

```js
window.onload=function(){
    var person={
        name:"李明",
        age:40,
        arr:[1,2,3,4]			
    }
    function deepCopy(objData,obj){
        obj = obj||{};
        for(var prop in objData){
            if(typeof objData[prop] === 'object'){
                //要考虑深复制问题了
                if(Object.prototype.toString.call(objData[prop]) == "[object Array]"){
                    //这是数组
                    obj[prop] =[];
                }else{
                    //这是对象
                    obj[prop] = {};
                }
                deepCopy(objData[prop],obj[prop]);
            }else{
                obj[prop] = objData[prop];
            }
        }
        return obj;
    }
    var sCopyData=deepCopy(person);
    sCopyData["name"]="张三";
    sCopyData["arr"][0]=23;		
    console.log(sCopyData);
    console.log(person);
}
```

输出结果如下所示：

<img width="300px"  src="https://user-gold-cdn.xitu.io/2019/4/10/16a02e517d94498d?w=472&h=264&f=png&s=27078">

从输出结果可以看出，name属性和arr属性都改变了，但是拷贝前后对象互不影响。