"use strict"

function getMathHandler() {
  
  /***********************************/

  function applyMath(math_str) {
    // ставим флаг на false
    divByZero = false

    // проверяем количество открывающихся и закрывающихся скобок
    throwUnmatchedScopes(math_str)
    
    // сначала раскрываем все скобки, получая из них результат
    // то есть: ...+(...)/...-(...+(...)) => ...+.../...-...
    math_str = deepRemoveScopes(math_str)

    // исправляем всё, что может пойти не так.
    // в основном, исправляем знаки вида ++, +-, --
    // по сути убираем всякие невнятности когда в выражении уже нет скобок
    math_str = autoCorrect(math_str)

    // когда в выражении уже нет скобок просто получаем результат, производя
    // необходимые модулярные вычисления
    let result = parseLinearMath(math_str)

    // если где-то начали делить на 0, то выводим ошибку,
    //  в противном случае возвращаем результат вычислений всего выражения
    return divByZero ? "Ахтунг, деление на ноль" : result
  }


  function deepRemoveScopes(str) {
    // очень много replace, делаем корректировку введённой строки 
    str = autoCorrect(str)
    
    // получаем индекс первой входящей скобки
    let index = str.indexOf("(")

    // если скобок нет в полученном выражении нет, то возвращаем результат этого выражения,
    // подсчитанный с помощью функции parseLinearMath
    if( index === -1 ) return parseLinearMath(str)
    

    let scope = "("

    // вводим счётчик для подсчёта вхождений открывающихся скобок
    let open = 1
    
    for( let i = index + 1; i <= 100000; i++ ) {
      if( i === 100000 ) console.log("Кажется пошел бесконечный цикл")
      
      // добавляем следующий символ, идущий после скобки
      scope += str[i]
      
      // если следующий символ, после предыдущего, является открывающейся скобкой,
      // то увеличиваем счётчик для подсчёта вхождений скобок на 1
      if( str[i] === "(" ) {
        open++
      // если следующий символ, после предыдущего, является закрывающейся скобкой,
      // то уменьшаем счётчик для подсчёта вхождений скобок на 1
      } else if( str[i] === ")" ) {
        open--
      }
      
      // если по итогу мы получили выражение скобках по типу: (...) или (...(...)) или по типу этого,
      // то есть число открывающихся скобок равно числу закрывающихся скобок
      if( open === 0 ) {
        // то рекурсивно вызаваем функцию, передавая ей ту же строку, только заменяя
        // вложенную часть со скобками на результат полученный позже из подсчитанного выражения scope,
        // то есть: deepRemoveScopes( scope.slice(1, -1) )
        // При этом учитываем и вложенные скобки scope.slice(1, -1), то есть мы просто
        // обрезаем выражение следующим образом (...) => ... или  (...(...)) => ...(...),
        // то есть просто выбрасываем внешние скобки
        return deepRemoveScopes( str.replace(scope, deepRemoveScopes( scope.slice(1, -1) ) ) )
      }
    }
  }
  
  function parseLinearMath(math_str) {
    // вы зывается эта функция в случае, если в переданной строке или подстроке нет скобок

    /***/

    function mul_div(math_str) {
      let length = (math_str.match(/\/|\*/g) || []).length
      if (!length) return math_str

      for (let i = 0; i < length; i++) {
        math_str = math_str.replace(
          /(\d+(?:\.\d+)?)(\/|\*)(-?\d+(?:\.\d+)?)/,
          function(_, a, oper, b) {
            return math(a, oper, b)
          }
        )

        // Исправляем всё, что может пойти не так.
        // В основном, исправляем знаки вида ++, +-, --
        math_str = autoCorrect(math_str)
      }

      return math_str
    }

    function plus_minus(math_str) {
      let length = (math_str.match(/\+|-/g) || []).length
      if (!length) return math_str

      for (let i = 0; i < length; i++) {
        math_str = math_str.replace(
          /((?:^-)?\d+(?:\.\d+)?)(\+|-)(\d+(?:\.\d+)?)/,
          function(_, a, oper, b) {
            return math(a, oper, b)
          }
        )

        math_str = autoCorrect(math_str)
      }

      return math_str
    }
    math_str = autoCorrect(math_str)

    math_str = mul_div(math_str)
    
    math_str = plus_minus(math_str)

    return math_str
  }

  function autoCorrect(math_str) {
    return (math_str               // замены:
      .replace(/\s/g, "")          // удаляем все пробелы
      .replace(/\(\)/g, "")        // убрать пустые скобки
      .replace(/--/g, "+")         // два минуса подряд → плюс
      .replace(/(\+\+|\*\*|\/\/)/g, (_, oper) => oper[0])
               // двойные плюсы, умножения и пр → на один
      .replace(/\+-|-\+/g, "-")    // плюс после минуса и наоборот → на минус
      .replace(/\)\(/g, ")*(")     // две скобки подряд → вставить умножение
      .replace(/(\d)\(/g, "$1*(")  // число и сразу скобка → умножение
      .replace(/\)(\d)/g, ")*$1")  // скобка и сразу число → умножение
      .replace(/(\/|\*)\+/g, "$1") // *+ или /+ → убрать плюс
    )
  }

  function throwUnmatchedScopes(math_str) {
    // получаем количество открывающихся скобок
    let scopes_open = (math_str.match(/\(/g) || []).length
    // получаем количество закрывающихся скобок
    let scopes_close = (math_str.match(/\)/g) || []).length

    // если количество открывающихся скобок не равно количеству закрывающихся скобок, то пробрасываем ошибку
    if (scopes_open !== scopes_close) {
      throw new Error("Непарная скобка в " + math_str)
    }
  }

  function getMathFn() {
    let local_math = {
      "+": (a, b, p=11) => {
        while (a < 0) {
          a = Number(a) + p
        }
        while (b < 0) {
          b = Number(b) + p
        }
        let result = Number(a) + Number(b)
        while (result < 0) {
          result += p
        }
        return result % p
      },
      "-": (a, b, p=11) => {
        while (a < 0) {
          a = Number(a) + p
        }
        while (b < 0) {
          b = Number(b) + p
        }
        let result = a - b
        while (result < 0) {
            result += p
        }
        return result % p
      },
      "*": (a, b, p=11) => {
        while (a < 0) {
          a = Number(a) + p
        }
        while (b < 0) {
          b = Number(b) + p
        }
        let result = a * b
        while (result < 0) {
          result += p
        }
        return result % p
      },
      "/": (a, b, p=11) => {
        while (a < 0) {
          a = Number(a) + p
        }
        while (b < 0) {
          b = Number(b) + p
        }

        if( b === "0" ) {
          divByZero = true
          // задать вопрос, что делать если делим на 0, ибо тогда верхнее комментим и раскомменчиваем нижнее
          // return 0
        }
        // Расширенный алгоритм евклида (через рекурсию) \\
        const egcd = (a, b) => {
          if (a == 0) {
              return [b, 0, 1]
          }
          else {
              // пока не дойдём до условия (a == 0), потом функция вернёт [b, 0, 1]
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
    }

    return function math(a, operation, b) {
      return local_math[operation](a, b)
    }
  }

  /***********************************/

  // получаем объект, где каждая из 4 операций (* + - /) является ключом для функции
  // модулярных вычислений вместо обычных
  const math = getMathFn()  
  let divByZero = false

  return applyMath
}

// '5()(1*2 -3)(-5*-5)1(1)'
// '4*(1*14  - - 4 *-5)*+4/(15/2)'
// '-1*7 + 15-(-4-4)*(45*6)'
// '5*5*-5*5*-4/0+2'
// '-1 +1 -1 +1 -1 +1 -1 + 0 + 0 + 0 - 0'
// '5-7'

const applyMath = getMathHandler()

console.log(applyMath('5*5*-5*5*-4/0+2'))
console.log(applyMath('4*(1*14  - - 4 *-5)*+4/(15/2)'))
console.log(applyMath('3/-7'))