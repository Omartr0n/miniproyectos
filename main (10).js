// sudoku_game_node.js
// Ejecutar en OnlineGDB con Node.js
const readline = require('readline');

function rlPromise(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Comprueba si un número se puede colocar en (r,c) según estado actual
function isSafe(board, r, c, num) {
  const n = 9;
  for (let i = 0; i < n; i++) if (board[r][i] === num) return false;
  for (let i = 0; i < n; i++) if (board[i][c] === num) return false;
  const sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (board[sr + i][sc + j] === num) return false;
  return true;
}

// Genera una solución completa mediante backtracking
function solveBoard(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        let nums = shuffle([1,2,3,4,5,6,7,8,9].slice());
        for (let num of nums) {
          if (isSafe(board, r, c, num)) {
            board[r][c] = num;
            if (solveBoard(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true; // completado
}

function generateFullSolution() {
  const board = Array.from({length:9}, () => Array(9).fill(0));
  solveBoard(board);
  return board;
}

// Crea un puzzle removiendo números según cantidad de pistas (clues)
function makePuzzleFromSolution(solution, clues) {
  const puzzle = solution.map(row => row.slice());
  const removals = 81 - clues;
  const positions = [];
  for (let r=0;r<9;r++) for (let c=0;c<9;c++) positions.push([r,c]);
  shuffle(positions);
  let removed = 0;
  for (let pos of positions) {
    if (removed >= removals) break;
    const [r,c] = pos;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    // NOTA: No comprobamos unicidad por rendimiento; generará puzzles jugables
    removed++;
  }
  return puzzle;
}

// Mostrar tablero en consola (0 => .)
function displayBoard(board) {
  console.log('    1 2 3   4 5 6   7 8 9');
  console.log('  +-------+-------+-------+');
  for (let r = 0; r < 9; r++) {
    let line = (r+1) + ' | ';
    for (let c = 0; c < 9; c++) {
      line += (board[r][c] === 0 ? '.' : board[r][c]) + ' ';
      if ((c+1) % 3 === 0) line += '| ';
    }
    console.log(line);
    if ((r+1) % 3 === 0) console.log('  +-------+-------+-------+');
  }
}

function copyBoard(b) { return b.map(row => row.slice()); }
function boardsEqual(a,b) {
  for (let r=0;r<9;r++) for (let c=0;c<9;c++) if (a[r][c] !== b[r][c]) return false;
  return true;
}
function isComplete(board) {
  for (let r=0;r<9;r++) for (let c=0;c<9;c++) if (board[r][c] === 0) return false;
  return true;
}

// Configuración de dificultad: número de pistas (clues)
const difficultySettings = {
  "muy facil": 45,
  "facil": 36,
  "medio": 30,
  "dificil": 25,
  "muy dificil": 22
};
const levelsOrder = ["muy facil","facil","medio","dificil","muy dificil"];

async function playSudokuGame() {
  console.clear();
  console.log('--- Juego de Sudoku (Consola) ---');
  console.log('Reglas: 9x9, 5 sudokus por nivel. 5 vidas por juego. 3 intentos por sudoku.');
  console.log('Entrada para colocar número: fila columna valor  (ejemplo: 3 5 9)');
  console.log('Para salir escribe "salir" en cualquier momento.\n');

  let lives = 5;
  let currentLevelIndex = 0;

  gameLoop:
  while (true) {
    let levelName = levelsOrder[currentLevelIndex];
    console.log(`\nNivel actual: ${levelName.toUpperCase()}  (vidas: ${lives})`);
    let clues = difficultySettings[levelName];
    let puzzlesCompletedThisLevel = 0;

    // Generar 5 puzzles para este nivel
    const puzzles = [];
    for (let i=0;i<5;i++) {
      const sol = generateFullSolution();
      const puzzle = makePuzzleFromSolution(sol, clues);
      puzzles.push({puzzle, solution: sol});
    }

    for (let p=0; p<5; p++) {
      let attempts = 3;
      let {puzzle, solution} = puzzles[p];
      let board = copyBoard(puzzle);

      console.log(`\nSudoku ${p+1} / 5 - Nivel ${levelName} (Intentos disponibles: ${attempts})`);

      puzzleLoop:
      while (true) {
        displayBoard(board);
        if (isComplete(board)) {
          console.log('¡Felicidades! Resolviste este sudoku.');
          puzzlesCompletedThisLevel++;
          break;
        }
        console.log(`Intentos restantes para este sudoku: ${attempts}  | Vidas: ${lives}`);
        let input = await rlPromise('Ingresa "fila columna valor" o "salir": ');
        input = input.trim().toLowerCase();
        if (input === 'salir') {
          console.log('Saliendo del juego. ¡Hasta luego!');
          break gameLoop;
        }
        const parts = input.split(/\s+/);
        if (parts.length !== 3) {
          console.log('Formato inválido. Usa: fila(1-9) columna(1-9) valor(1-9).');
          continue;
        }
        let [rs, cs, vs] = parts;
        const r = parseInt(rs, 10) - 1;
        const c = parseInt(cs, 10) - 1;
        const v = parseInt(vs, 10);
        if (![r,c,v].every(Number.isFinite) || r<0 || r>8 || c<0 || c>8 || v<1 || v>9) {
          console.log('Valores fuera de rango. fila y columna 1..9, valor 1..9.');
          continue;
        }
        // No permitir cambiar pistas iniciales
        if (puzzle[r][c] !== 0) {
          console.log('Esa celda es una pista inicial y no puede cambiarse.');
          continue;
        }
        // comparar con solución
        if (solution[r][c] === v) {
          board[r][c] = v;
          console.log('Movimiento correcto ✅');
        } else {
          attempts--;
          console.log('Movimiento incorrecto ❌');
          if (attempts <= 0) {
            lives--;
            console.log(`Has agotado los 3 intentos. Pierdes 1 vida. Vidas restantes: ${lives}`);
            if (lives <= 0) {
              console.log('¡Has perdido todas las vidas! El juego se reinicia desde el principio.');
              // reiniciar todo
              lives = 5;
              currentLevelIndex = 0;
              continue gameLoop;
            } else {
              // pasar al siguiente sudoku sin bajar de nivel
              break puzzleLoop;
            }
          }
        }
      } // end puzzleLoop

      // Si se completó con éxito se sigue al siguiente puzzle. Si no (fallo) también.
      if (puzzlesCompletedThisLevel >= 5) {
        console.log(`\nCompletaste los 5 sudokus del nivel ${levelName}. Subes de nivel!`);
        currentLevelIndex++;
        if (currentLevelIndex >= levelsOrder.length) {
          console.log('¡Has completado todos los niveles! ¡Ganaste el juego! 🎉');
          // reiniciar o salir
          let again = await rlPromise('¿Jugar de nuevo desde "muy facil"? (si/no): ');
          if (again.trim().toLowerCase().startsWith('s')) {
            lives = 5;
            currentLevelIndex = 0;
            continue gameLoop;
          } else {
            console.log('Gracias por jugar. Hasta pronto.');
            break gameLoop;
          }
        }
        // romper para empezar generación en nuevo nivel
        break;
      }
      // si aun quedan puzzles, continúa con el siguiente
    } // end for puzzles
  } // end gameLoop
}

// Ejecutar juego
playSudokuGame().catch(err => console.error(err));
