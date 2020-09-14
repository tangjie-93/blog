let obj = {
    fn: function () {
        console.log(this);//window
    }
};
//括号表达式中有多项，也只取最后一项，但是this是window
(0, 0, obj.fn)()