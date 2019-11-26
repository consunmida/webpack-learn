import add from './add';
console.log(124);
console.log(add);
add();
require('./index.css');


const a = 123;

const fn = () => {
    console.log(a);
}
@log
class A{
    b = 123;
}
 function log(target) {
    console.log(target);
 }
 var nums = [1, 2, 3, 4, 5];
 var b = nums.reduce((pre, curr) => {
    console.log(pre, 'pre');
    console.log(curr, 'curr');
    return curr;
 }, 10)
 console.log(b);
