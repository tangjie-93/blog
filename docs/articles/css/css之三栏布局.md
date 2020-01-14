## 三栏布局的实现方式

```HTML
    <div class="container">
        <div class="left"></div>
        <div class="right"></div>
        <div class="center">float解决方案，DOM顺序与视觉顺序不符</div>
    </div>
```
方法1 float+margin/padding
```CSS
    .left {
      width: 300px;
      float: left;
      height: 200px;
      background: #FF79BC;
    }
    .center {
      height: 200px;
      font-size: 30px;
      color: #fff;
      background: #666;
      margin: 0 300px;
    }
    .right {
      width: 300px;
      height: 200px;
      float: right;
      background: #CA8EFF;
    }
```
方法2 float+calc
```CSS
   .left {
      height: 500px;
      width: 300px;
      float: left;
      background: cadetblue;
    }
    .center {
      width: calc(100% - 600px);
      height: 500px;
      display: inline-block;
      /* 将display: inline-block;改为float布局也可以 */
      background: cornflowerblue;
    }
    .right {
      height: 500px;
      width: 300px;
      float: right;
      background: chocolate;
    }
```
方法3 absolute+margin
```CSS
    .container {
            height: 100%;
            position: relative;
        }

        .left {
            position: absolute;
            top: 0;
            left: 0;
            width: 300px;
            height: 100%;
            background: cadetblue;
        }

        .right {
            position: absolute;
            top: 0;
            right: 0;
            width: 300px;
            background: cornflowerblue;
            height: 100%;
        }

        .center {
            margin: 0 300px;
            background: cornsilk;
            height: 100%;
        }
```
方法4 table布局
```CSS
    .container {
        display: table;
        width: 100%;
        background: gray
    }

    .left,.center,.right {
        display: table-cell;
        height: 500px;
    }
    .left{
        background: darkblue
    }
    .right{
        background: darkgreen
    }
```
方法5 flex布局
```CSS
    .left {
        flex: 0 0 300px;
        background: cornflowerblue;
    }

    .center {
        flex: 1;
        background: cadetblue;
    }

    .right {
        flex: 0 0 300px;
        background: cornsilk;
    }
```
方法6 grid布局
```CSS
    .container {
      display: grid;
      grid-template-columns: 300px auto 300px;
    }

    .left {
      background: cadetblue;
    }

    .right {
      background: chocolate;
    }

    .center {
      background: cornsilk;
      height: 200px;
    }
```
方法7 圣杯布局
```CSS
     center {
    width: 100%;
    background: paleturquoise;
    height: 200px;
    float: left;
    padding:0 200px;
  }

  .left {
    background: palevioletred;
    width: 200px;
    height: 200px;
    float: left;
    font-size: 40px;
    color: #fff;
    margin-left:-100%;
  }

  .right {
    width: 200px;
    height: 200px;
    background: purple;
    font-size: 40px;
    float: left;
    color: #fff;
    margin-left:-200px;
  }
```
