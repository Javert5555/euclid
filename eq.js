// let test5 = '-2*((15)+(-2*-2)-(-2/(-(2))))';
// console.log(test5 + ' == ' + applyMath(test5));
// console.log(test5 + ' == ' + eval(test5));

// const euclid_ext = (a, b, p) => {

//     if( b === "0" ) {
//       divByZero = true;
//     }

//     function euclid_ext(a, b){
//       let d, x, y
//       // console.log(a, b)
//         if (b == 0) {
//             return [a, 1, 0]
//         }
//         else {
//             console.log(b, a)
//             // console.log(a)
//             [d, x, y] = euclid_ext(b, a % b)

//         }
//         return d, y, x - y * Math.floor(a/b)
//     }

//     let b_reversed = euclid_ext(Number(b),Number(p))[1] + p
//     return (a * b_reversed % p)
// }

// euclid_ext(5, 7, 11)

const egcd = (a, b) => {
    if (a == 0) {
        return [b, 0, 1]
    }
    else {
        let [g, x, y] = egcd(b % a, a)
        return [g, y - Math.floor(b / a) * x, x]
    }
}
 
//  x = mulinv(b) mod n, (x * b) % n == 1
const mulinv = (b, n) => {
    let [g, x, _] = egcd(b, n)
    console.log(g,x,_)
    if (g == 1) {
        return x % n
    }
}

console.log(mulinv(7, 11))