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

  // вы зывается эта функция в случае, если в переданной строке или подстроке нет скобок
  function parseLinearMath(math_str) {

    /***/

    function mul_div(math_str) {
      // подсчитываем количество знаков / и *
      let length = (math_str.match(/\/|\*/g) || []).length
      // console.log(length)

      // если в полученной строке нет знаков / и *, то возвращаем исходную строку
      if (!length) return math_str

      // сколько встреченных операций * или / столько раз и перебираем строку
      // чтобы подсчитать результаты для подстрок(кусочков) с умножениями и делениями
      for (let i = 0; i < length; i++) {
        math_str = math_str.replace(
          // если полученная строка, подстрока этой строки соответствует следующему регулярному выражению,
          // (вещественное число) (* или /) (вещественное число)
          // то заменяем эту строку/подстроку на результат функции math, (по сути результат функции getMathFn)
          // то есть по сути: '5+6*2+3' => '5+12+3'
          // или: '5+6/2+3' => '5+3+3'
          /(\d+(?:\.\d+)?)(\/|\*)(-?\d+(?:\.\d+)?)/,
          function(_, a, oper, b) {
            return math(a, oper, b)
          }
        )

        // Исправляем всё, что может пойти не так.
        // В основном, исправляем знаки вида ++, +-, --
        math_str = autoCorrect(math_str)
      }
      // возвращаем полученну строку
      return math_str
    }

    function plus_minus(math_str) {
      // подсчитываем количество знаков + и -
      let length = (math_str.match(/\+|-/g) || []).length

      // если в полученной строке нет знаков / и *, то возвращаем исходную строку
      if (!length) return math_str

      // сколько встреченных операций + или - столько раз и перебираем строку
      // чтобы подсчитать результаты для подстрок(кусочков) со сложениями и вычитаниями
      for (let i = 0; i < length; i++) {
        math_str = math_str.replace(
          // если полученная строка, подстрока этой строки соответствует следующему регулярному выражению,
          // (вещественное число) (+ или -) (вещественное число)
          // то заменяем эту строку/подстроку на результат функции math, (по сути результат функции getMathFn)
          // то есть по сути: '5+6' => '11'
          // или: '5-3' => '2'
          /((?:^-)?\d+(?:\.\d+)?)(\+|-)(\d+(?:\.\d+)?)/,
          function(_, a, oper, b) {
            return math(a, oper, b)
          }
        )
        // Исправляем всё, что может пойти не так.
        // В основном, исправляем знаки вида ++, +-, --
        math_str = autoCorrect(math_str)
      }
      // возвращаем полученну строку
      return math_str
    }
    // Исправляем всё, что может пойти не так.
    math_str = autoCorrect(math_str)

    // заменяем в строке все произведения и деления на их результаты:
    // '2*3' => '6'
    // '6/3' => '2'
    math_str = mul_div(math_str)

    // заменяем в строке все суммы и разности на их результаты:
    // '2+3' => '5'
    // '6-3' => '3'
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
    let p = Number(document.querySelector('#field-value').value)

    let local_math = {
      "+": (a, b) => {
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

      "-": (a, b) => {
        console.log(p)
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

      "*": (a, b) => {
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

      "/": (a, b) => {
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
        // например b = 7
        // например p = 11
        const egcd = (b, p) => {
          if (b == 0) {
            // console.log(`b: ${b}, p: ${p}`)
              return [p, 0, 1]
          }
          else {
              // передаём:
              // b, p
              // 7, 11
              // 4, 7
              // 3, 4
              // 1, 3
              // 0, 1
              // пока не дойдём до условия (b == 0), потом функция вернёт [p, 0, 1]
              // так как рекурсия мы только сейчас начали выходить из функции последней
              // вложенной функции с аргументами 0, 1; возвращают эти функии следующее:
              // g, x, y
              // 1, 0, 1
              // 1, 1 - (3 / 1) * 0, 0
              // 1, 0 - (4 / 3) * 1, 1
              // 1, 1 - (7 / 4) * -1, -1
              // 1, -1 - (11 / 7) * 2, 2
              
              // console.log(p % b, b)
              let [g, x, y] = egcd(p % b, b)
              // console.log(g,x,y)
              // console.log(g, y - Math.floor(p / b) * x, x)
              console.log(y, p, b, x, '|||', y - Math.floor(p / b) * x)
              // y, p, b, x ||| y - Math.floor(p / b) * x)
              // 1, 3, 1, 0 ||| 1
              // 0, 4, 3, 1 ||| -1
              // 1, 7, 4, -1 ||| 2
              // -1, 11, 7, 2 ||| -3
              // из выражения g = p * x1 + a * a^-1, (g=1)
              // x1 и есть в данном случае y-Math.floor(p / b) * x
              // 
              // пример из тетради:
              // 1=4-3*1 ==> здесь 1=g, y=1, 3=Math.floor(p / b) (где p=3, b=1), x=0, 1=y-Math.floor(p / b) * x
              return [g, y - Math.floor(p / b) * x, x]
          }
        }
       
        //  x = mulinv(b) mod n, (x * b) % n == 1
        const mulinv = (b, p) => {
            let [g, x, _] = egcd(b, p)
            // console.log(g,x,_)
            // если результат x получился отрицательным, это условие просто вернёт этот x
            if (g == 1) {
                return x % p
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

// const applyMath = getMathHandler()

// console.log(applyMath('5*7*-5*5*-4/1+2'))
// console.log(applyMath('4*(1*14  - - 4 *-5)*+4/(15/2)'))
// console.log(applyMath('(8*5)/2'))
// console.log(applyMath('5()(1*2 -3)(-5*-5)1(1)'))

// функция проверки на простое число
function primality(n) {
  for(let i = 2; i < n; i++) {
     if(n % i === 0) return false;
  }
  return n > 1;
 }


document.querySelector('#submit-solution').addEventListener('click', () => {

  try {
    // если число - не простое, то прокидываем ошибку
    if (!primality(Number(document.querySelector('#field-value').value))) {
      throw new Error('Значение поля не является простым число')
    }

    const applyMath = getMathHandler()
    // console.log('awdawd', document.querySelector('#math-expr').value)

    // Удаляем все пробелы, заменяем все \ на /
    let mathStr = document.querySelector('#math-expr').value.replace(/\\/g, "/").replaceAll(' ', "")


    // если хотя бы 1 символ из введённой строки не соответствуют необходимому символу, то прокидываем ошибку
    for (let el of mathStr) {
      if (['(', ')', '+', '-', '*', '/', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(el) === -1) {
        // console.log(el)
        throw new Error('Введите корректное значение выражения')
      }
    }

    let result = applyMath(mathStr)
    document.querySelector('#response').innerHTML = `Ответ: ${result}`
  } catch (error) {
    // console.log(error)
    // ловим ошибку
    document.querySelector('#response').innerHTML = `Ошибка: ${error.message}`
  }

  // document.querySelector('#response').innerHTML = '123123123'
}) 