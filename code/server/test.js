var name = '321';
function test() {
    var name = '123';
    var obj = {
        name: '123'
    };
    this.obj = obj;
    function foo() {
        console.log(obj.name);
    }
    function run() {
        foo();
    }
    this.run = function () {
        foo();
    };
}

var f = new test;
f.obj.name = '1';
f.run();
