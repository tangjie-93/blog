# css实现等分布局的几种方式

```HTML
    <div class="parent">
        <div class="child" style="background: lightblue"></div>
        <div class="child" style="background: lightgreen"></div>
        <div class="child"  style="background: red"></div>
        <div class="child"></div>
    </div>
```
方式1 float+box-sizing+border
```HTML
    .parent{
            overflow: hidden;
            background: gray
        }
        .child{
            float: left;
            height: 100px;
            width: 25%;
            padding: 20px;
            border: 5px solid;
            box-sizing: border-box;
        }
```
方式2 float+margin+calc
```HTML
    .parent {
            overflow: hidden;
            background: gray
        }

        .child {
            float: left;
            height: 100px;
            width: calc(25% - 10px);
            border: 5px solid;
        }
```
方式3 inline-block+box-sizing+border+font-size=0
```HTML
   .parent {
                font-size: 0;
                overflow: hidden;
                background: gray
            }
    
            .child {
                display: inline-block;
                height: 100px;
                width: 25%;
                box-sizing: border-box;
                border: 5px solid;
            }
```
方式4 inline-block+calc+border+font-size=0
```HTML
    .parent {
                font-size: 0;
                overflow: hidden;
                background: gray
            }
    
            .child {
                display: inline-block;
                height: 100px;
                width: calc(25% - 10px);
                border: 5px solid;
            }
```
方式5  flex布局
```HTML
    .parent {
            overflow: hidden;
            background: gray;
            display: flex;
        }

        .child {
            flex: 1;
            height: 100px;
            border: 5px solid;
        }
```
方式6 table布局
```HTML
   .parent {
            overflow: hidden;
            background: gray;
            display: table;
        }

        .child {
            display: table-cell;
            height: 100px;
            border: 5px solid;
        }
```
方式7 grid布局
```HTML
   .parent {
            overflow: hidden;
            background: gray;
            display: grid;
            grid-template-columns: 25% 25% 25% 25%;
        }

        .child {
            height: 100px;
            border: 5px solid;
        }
```