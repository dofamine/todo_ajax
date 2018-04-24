// function swap(a, b) {
//     var temp = a;
//     a = b;
//     b = temp;
// }
//
// function main() {
//     var x = 1;
//     var y = 2;
//     console.log("x = " + x);
//     console.log("y = " + y);
//     swap(x,y);
//     console.log("x = " + x);
//     console.log("y = " + y);
// }
function createPromise(a) {
    return new Promise((resolve,reject)=>{
        setTimeout(()=>createPromise())
    })
}
let arr = [1,2,3,4];
let asd = Promise.all(arr.map(createPromise));
asd.then(result=>console.log(result));

