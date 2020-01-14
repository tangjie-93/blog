**Object.freeze()**

​		顾名思义是冻结对象,一个冻结的对象再也不能被修改。冻结之后**不能添加新的属性，不能删除已有属性，也不会修改已有属性的值**。此外，冻结一个对象后该对象的原型也不能被修改。

```js
let obj={
    a:1,
    b:2,
};
Object.freeze(obj);
obj.a=123;
obj["c"]=123;
delete obj.a
console.log(obj);
//{a:1,b:2}
```

**Object.seal()**

​		顾名思义是密封对象。阻止添加新属性并将所有现有属性标记为不可配置。密封之后**不能添加新属性，不能删除已有属性，但是可以修改已有属性的值。**

```ts
let obj1={
  a:1,
  b:2
}
Object.seal(obj1)
obj1.a=123;
obj1["c"]=123;
delete obj.a;
console.log(obj1);//{a:123,b:2}
```

<Valine></Valine>