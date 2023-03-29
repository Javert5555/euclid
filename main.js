"use strict";

// '5()(1*2 -3)(-5*-5)1(1)';
// '4*(1*14  - - 4 *-5)*+4/(15/2)';
// '-1*7 + 15-(-4-4)*(45*6)';
// '5*5*-5*5*-4/0+2';
// '-1 +1 -1 +1 -1 +1 -1 + 0 + 0 + 0 - 0';
// '5-7';

const applyMath = getMathHandler();

// console.log(test0 + ' = ' + applyMath(test0));
// console.log(test0 + ' = eval не работает.');
// console.log(test1 + ' == ' + applyMath(test1));
// console.log(test1 + ' == ' + eval(test1));
// console.log(test2 + ' == ' + applyMath(test2));
// console.log(test2 + ' == ' + eval(test2));
// console.log(test3 + ' == ' + applyMath(test3));
// console.log(test3 + ' == ' + eval(test3));
// console.log(test4 + ' == ' + applyMath(test4));
// console.log(test4 + ' == ' + eval(test4));

console.log(applyMath('5*5*-5*5*-4/0+2'));
console.log(applyMath('4*(1*14  - - 4 *-5)*+4/(15/2)'));


function getMathHandler() {
  // получаем объект, где каждая из 4 операций (* + - /) является ключом для функции
  // модулярных вычислений вместо обычных
  const math = getMathFn();  
  let divByZero = false;

  return applyMath;
  
  /***/

  function applyMath(math_str) {
    divByZero = false;    
    throwUnmatchedScopes(math_str);
    
    math_str = deepRemoveScopes(math_str);    
    math_str = autoCorrect(math_str);

    let result = parseLinearMath(math_str);
    return divByZero ? "Ахтунг, деление на ноль" : result;
  }


  function deepRemoveScopes(str) {
    // очень много replace, делаем корректировку введённой строки 
    str = autoCorrect(str);
    
    // получаем индекс
    let index = str.indexOf("(");
    if( index === -1 ) return parseLinearMath(str);
    
    let scope = "(";
    let open = 1;
    
    for( let i = index + 1; i <= 100000; i++ ) {
      if( i === 100000 ) console.log("Кажется пошел бесконечный цикл");
      
      scope += str[i];
      
      if( str[i] === "(" ) {
        open++;
      } else if( str[i] === ")" ) {
        open--;
      }
      
      if( open === 0 ) {
        // Привет, рекурсия!
        // Показалось проще перезапускать функцию после каждой найденной скобки.
        // При этом учитывая и вложенные скобки scope.slice(1, -1)
        return deepRemoveScopes( str.replace(scope, deepRemoveScopes( scope.slice(1, -1) ) ) );
      }
    }
  }
  
  function parseLinearMath(math_str) { /* уже точно нет скобок */
    math_str = autoCorrect(math_str);
    math_str = mul_div(math_str);
    math_str = plus_minus(math_str);

    return math_str;

    /***/

    function mul_div(math_str) {
      let length = (math_str.match(/\/|\*/g) || []).length;
      if (!length) return math_str;

      for (let i = 0; i < length; i++) {
        math_str = math_str.replace(
          /(\d+(?:\.\d+)?)(\/|\*)(-?\d+(?:\.\d+)?)/,
          function(_, a, oper, b) {
            return math(a, oper, b);
          }
        );

        math_str = autoCorrect(math_str);
        // Строка не из миллиона символов, поэтому после каждой операции
        // На всякий случай исправляется всё, что может пойти не так.
        // В основном, "гасятся" знаки вида ++, +-, --
      }

      return math_str;
    }

    function plus_minus(math_str) {
      let length = (math_str.match(/\+|-/g) || []).length;
      if (!length) return math_str;

      for (let i = 0; i < length; i++) {
        math_str = math_str.replace(
          /((?:^-)?\d+(?:\.\d+)?)(\+|-)(\d+(?:\.\d+)?)/,
          function(_, a, oper, b) {
            return math(a, oper, b);
          }
        );

        math_str = autoCorrect(math_str);
      }

      return math_str;
    }
  }

  function autoCorrect(math_str) {
    return (math_str               // Замены:
      .replace(/\s/g, "")          // Удалить все пробелы
      .replace(/\(\)/g, "")        // Убрать пустые скобки
      .replace(/--/g, "+")         // Два минуса подряд → Плюс
      .replace(/(\+\+|\*\*|\/\/)/g, (_, oper) => oper[0])
               // Двойные плюсы, умножения и пр → на один
      .replace(/\+-|-\+/g, "-")    // Плюс после минуса и наоборот → на минус
      .replace(/\)\(/g, ")*(")     // Две скобки подряд → вставить умножение
      .replace(/(\d)\(/g, "$1*(")  // Число и сразу скобка → умножение
      .replace(/\)(\d)/g, ")*$1")  // Скобка и сразу число → умножение
      .replace(/(\/|\*)\+/g, "$1") // *+ или /+ → убрать плюс
    );
  }

  function throwUnmatchedScopes(math_str) {
    // получаем количество открывающихся скобок
    let scopes_open = (math_str.match(/\(/g) || []).length;
    // получаем количество закрывающихся скобок
    let scopes_close = (math_str.match(/\)/g) || []).length;

    // если количество открывающихся скобок не равно количеству закрывающихся скобок, то пробрасываем ошибку
    if (scopes_open !== scopes_close) {
      throw new Error("Непарная скобка в " + math_str);
    }
  }

  function getMathFn() {
    let local_math = {
      "+": (a, b, p=11) => {
        let result = Number(a) + Number(b)
        while (result < 0) {
          result += p
        }
        return result % p
      },
      "-": (a, b, p=11) => {
        let result = a - b
        while (result < 0) {
            result += p
        }
        return result % p
      },
      "*": (a, b, p=11) => {
        let result = a * b
        while (result < 0) {
          result += p
        }
        return result % p
      },
      "/": (a, b, p=11) => {

        if( b === "0" ) {
          divByZero = true;
          // задать вопрос, что делать если делим на 0, ибо тогда верхнее комментим и раскомменчиваем нижнее
          // return 0
        }
        // Расширенный алгоритм евклида (через рекурсию) \\
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
            // console.log(g,x,_)
            if (g == 1) {
                return x % n
            }
        }

        let b_reversed = mulinv(Number(b),Number(p))
        while (b_reversed < 0) {
          b_reversed += p
        }
        return (a * b_reversed % p)
        // ********************************************* \\
      },
    };

    return function math(a, operation, b) {
      return local_math[operation](a, b);
    }
  }
}