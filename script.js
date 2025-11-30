// 游戏状态管理
const gameState = {
    currentGame: 'sudoku',
    sudoku: {
        board: [],
        solution: [],
        selectedCell: null,
        timer: null,
        timeElapsed: 0,
        isPlaying: false
    },
    nonogram: {
        board: [],
        solution: [],
        size: 5
    },
    math: {
        currentProblem: null,
        score: 0,
        correct: 0,
        total: 0
    }
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSudoku();
    initializeNonogram();
    initializeMathGame();
});

// 导航功能
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const game = this.getAttribute('data-game');
            
            // 更新导航按钮状态
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 切换游戏显示
            document.querySelectorAll('.game-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${game}-game`).classList.add('active');
            
            gameState.currentGame = game;
        });
    });
}

// 数独游戏功能
function initializeSudoku() {
    const newGameBtn = document.getElementById('new-sudoku');
    const checkBtn = document.getElementById('check-sudoku');
    const solveBtn = document.getElementById('solve-sudoku');
    const difficultySelect = document.getElementById('difficulty');
    
    newGameBtn.addEventListener('click', generateSudoku);
    checkBtn.addEventListener('click', checkSudoku);
    solveBtn.addEventListener('click', showSudokuSolution);
    difficultySelect.addEventListener('change', generateSudoku);
    
    // 初始生成数独
    generateSudoku();
}

function generateSudoku() {
    const difficulty = document.getElementById('difficulty').value;
    const cellsToRemove = {
        easy: 30,
        medium: 40,
        hard: 50
    };
    
    // 生成完整数独
    const solution = generateSudokuSolution();
    gameState.sudoku.solution = solution;
    
    // 创建游戏板（移除一些数字）
    const board = solution.map(row => [...row]);
    removeNumbers(board, cellsToRemove[difficulty]);
    gameState.sudoku.board = board;
    
    // 渲染棋盘
    renderSudokuBoard(board);
    
    // 重置游戏状态
    gameState.sudoku.selectedCell = null;
    gameState.sudoku.timeElapsed = 0;
    gameState.sudoku.isPlaying = true;
    
    // 启动计时器
    if (gameState.sudoku.timer) {
        clearInterval(gameState.sudoku.timer);
    }
    startSudokuTimer();
    
    updateSudokuStatus('游戏开始！');
}

function generateSudokuSolution() {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    
    // 简单的数独生成算法
    function solve(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                    for (let num of numbers) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solve(board)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    function isValid(board, row, col, num) {
        // 检查行
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) return false;
        }
        
        // 检查列
        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) return false;
        }
        
        // 检查3x3宫
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) return false;
            }
        }
        
        return true;
    }
    
    solve(board);
    return board;
}

function removeNumbers(board, count) {
    let removed = 0;
    while (removed < count) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            removed++;
        }
    }
}

function renderSudokuBoard(board) {
    const boardElement = document.getElementById('sudoku-board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (board[row][col] !== 0) {
                cell.textContent = board[row][col];
                cell.classList.add('fixed');
            } else {
                cell.classList.add('user-input');
                cell.addEventListener('click', handleSudokuCellClick);
            }
            
            boardElement.appendChild(cell);
        }
    }
}

function handleSudokuCellClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // 移除之前选中的单元格样式
    document.querySelectorAll('.sudoku-cell.selected').forEach(c => {
        c.classList.remove('selected');
    });
    
    // 添加选中样式
    cell.classList.add('selected');
    gameState.sudoku.selectedCell = { row, col };
    
    // 添加键盘输入监听
    document.addEventListener('keydown', handleSudokuKeyPress);
}

function handleSudokuKeyPress(event) {
    if (!gameState.sudoku.selectedCell) return;
    
    const { row, col } = gameState.sudoku.selectedCell;
    const key = event.key;
    
    if (key >= '1' && key <= '9') {
        const num = parseInt(key);
        gameState.sudoku.board[row][col] = num;
        
        // 更新显示
        const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = num;
        
        // 检查是否正确
        if (num !== gameState.sudoku.solution[row][col]) {
            cell.classList.add('error');
        } else {
            cell.classList.remove('error');
        }
        
        // 检查是否完成
        checkSudokuCompletion();
    } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        gameState.sudoku.board[row][col] = 0;
        const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = '';
        cell.classList.remove('error');
    }
}

function checkSudoku() {
    let hasErrors = false;
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
            const userValue = gameState.sudoku.board[row][col];
            const correctValue = gameState.sudoku.solution[row][col];
            
            if (userValue !== 0 && userValue !== correctValue) {
                cell.classList.add('error');
                hasErrors = true;
            } else {
                cell.classList.remove('error');
            }
        }
    }
    
    if (hasErrors) {
        updateSudokuStatus('发现错误，请检查！');
    } else {
        updateSudokuStatus('恭喜！答案正确！');
    }
}

function checkSudokuCompletion() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (gameState.sudoku.board[row][col] !== gameState.sudoku.solution[row][col]) {
                return false;
            }
        }
    }
    
    // 游戏完成
    gameState.sudoku.isPlaying = false;
    clearInterval(gameState.sudoku.timer);
    updateSudokuStatus('恭喜！您已完成数独！');
    return true;
}

function showSudokuSolution() {
    const board = gameState.sudoku.solution;
    renderSudokuBoard(board);
    gameState.sudoku.isPlaying = false;
    clearInterval(gameState.sudoku.timer);
    updateSudokuStatus('已显示完整答案');
}

function startSudokuTimer() {
    gameState.sudoku.timer = setInterval(() => {
        gameState.sudoku.timeElapsed++;
        const minutes = Math.floor(gameState.sudoku.timeElapsed / 60);
        const seconds = gameState.sudoku.timeElapsed % 60;
        document.getElementById('sudoku-timer').textContent = 
            `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function updateSudokuStatus(message) {
    document.getElementById('sudoku-status').textContent = message;
}

// 数织游戏功能
function initializeNonogram() {
    const newGameBtn = document.getElementById('new-nonogram');
    const checkBtn = document.getElementById('check-nonogram');
    const clearBtn = document.getElementById('clear-nonogram');
    const sizeSelect = document.getElementById('nonogram-size');
    
    newGameBtn.addEventListener('click', generateNonogram);
    checkBtn.addEventListener('click', checkNonogram);
    clearBtn.addEventListener('click', clearNonogram);
    sizeSelect.addEventListener('change', generateNonogram);
    
    // 初始生成数织
    generateNonogram();
}

function generateNonogram() {
    const size = parseInt(document.getElementById('nonogram-size').value);
    gameState.nonogram.size = size;
    
    // 生成随机数织图案
    const solution = generateNonogramSolution(size);
    gameState.nonogram.solution = solution;
    
    // 创建空的游戏板
    const board = Array(size).fill().map(() => Array(size).fill(0));
    gameState.nonogram.board = board;
    
    // 渲染棋盘
    renderNonogramBoard(board, solution);
    
    updateNonogramStatus('游戏开始！点击格子填充或标记');
}

function generateNonogramSolution(size) {
    const solution = Array(size).fill().map(() => Array(size).fill(0));
    
    // 生成随机图案（简单的随机填充）
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            // 增加填充概率，使图案更有趣
            const fillProbability = 0.4 + (Math.random() * 0.2);
            if (Math.random() < fillProbability) {
                solution[row][col] = 1;
            }
        }
    }
    
    return solution;
}

function renderNonogramBoard(board, solution) {
    const boardElement = document.getElementById('nonogram-board');
    boardElement.innerHTML = '';
    
    // 设置网格大小
    boardElement.style.gridTemplateColumns = `repeat(${gameState.nonogram.size}, 1fr)`;
    
    for (let row = 0; row < gameState.nonogram.size; row++) {
        for (let col = 0; col < gameState.nonogram.size; col++) {
            const cell = document.createElement('div');
            cell.className = 'nonogram-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            cell.addEventListener('click', (e) => handleNonogramCellClick(e, 1)); // 左键填充
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleNonogramCellClick(e, 2); // 右键标记
            });
            
            boardElement.appendChild(cell);
        }
    }
}

function handleNonogramCellClick(event, action) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    if (action === 1) { // 左键：填充/取消填充
        if (cell.classList.contains('filled')) {
            cell.classList.remove('filled');
            gameState.nonogram.board[row][col] = 0;
        } else {
            cell.classList.add('filled');
            cell.classList.remove('marked');
            gameState.nonogram.board[row][col] = 1;
        }
    } else if (action === 2) { // 右键：标记/取消标记
        if (cell.classList.contains('marked')) {
            cell.classList.remove('marked');
            gameState.nonogram.board[row][col] = 0;
        } else {
            cell.classList.add('marked');
            cell.classList.remove('filled');
            gameState.nonogram.board[row][col] = 2; // 2 表示标记
        }
    }
    
    checkNonogramCompletion();
}

function checkNonogram() {
    let correct = true;
    const size = gameState.nonogram.size;
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.querySelector(`.nonogram-cell[data-row="${row}"][data-col="${col}"]`);
            const userValue = gameState.nonogram.board[row][col];
            const correctValue = gameState.nonogram.solution[row][col];
            
            if (userValue === 1 && correctValue !== 1) {
                cell.style.backgroundColor = '#ffcccc';
                correct = false;
            } else if (userValue !== 1 && correctValue === 1) {
                cell.style.backgroundColor = '#ffffcc';
                correct = false;
            } else {
                cell.style.backgroundColor = '';
            }
        }
    }
    
    if (correct) {
        updateNonogramStatus('恭喜！答案正确！');
    } else {
        updateNonogramStatus('发现错误，请检查！');
    }
}

function checkNonogramCompletion() {
    const size = gameState.nonogram.size;
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const userValue = gameState.nonogram.board[row][col];
            const correctValue = gameState.nonogram.solution[row][col];
            
            // 只检查填充的格子（标记的格子不算错误）
            if (userValue === 1 && correctValue !== 1) {
                return false;
            }
            if (userValue !== 1 && correctValue === 1) {
                return false;
            }
        }
    }
    
    updateNonogramStatus('恭喜！您已完成数织！');
    return true;
}

function clearNonogram() {
    const size = gameState.nonogram.size;
    const board = Array(size).fill().map(() => Array(size).fill(0));
    gameState.nonogram.board = board;
    
    document.querySelectorAll('.nonogram-cell').forEach(cell => {
        cell.classList.remove('filled', 'marked');
        cell.style.backgroundColor = '';
    });
    
    updateNonogramStatus('已清空棋盘');
}

function updateNonogramStatus(message) {
    document.getElementById('nonogram-status').textContent = message;
}

// 数学挑战游戏功能
function initializeMathGame() {
    const newGameBtn = document.getElementById('new-math');
    const checkBtn = document.getElementById('check-math');
    const submitBtn = document.getElementById('submit-math');
    const answerInput = document.getElementById('math-answer');
    
    newGameBtn.addEventListener('click', generateMathProblem);
    checkBtn.addEventListener('click', checkMathAnswer);
    submitBtn.addEventListener('click', checkMathAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkMathAnswer();
        }
    });
    
    // 初始生成数学题目
    generateMathProblem();
}

function generateMathProblem() {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            break;
        case '*':
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            answer = num1 * num2;
            break;
    }
    
    gameState.math.currentProblem = {
        num1,
        num2,
        operation,
        answer
    };
    
    document.getElementById('math-problem').textContent = `${num1} ${operation} ${num2} = ?`;
    document.getElementById('math-answer').value = '';
    document.getElementById('math-answer').focus();
}

function checkMathAnswer() {
    const userAnswer = parseInt(document.getElementById('math-answer').value);
    const correctAnswer = gameState.math.currentProblem.answer;
    
    gameState.math.total++;
    
    if (userAnswer === correctAnswer) {
        gameState.math.correct++;
        gameState.math.score += 10;
        document.getElementById('math-problem').textContent = '正确！✓';
        document.getElementById('math-problem').style.color = '#4CAF50';
    } else {
        document.getElementById('math-problem').textContent = `错误！正确答案是 ${correctAnswer}`;
        document.getElementById('math-problem').style.color = '#f44336';
    }
    
    // 更新分数显示
    updateMathScore();
    
    // 1秒后生成新题目
    setTimeout(() => {
        generateMathProblem();
    }, 1000);
}

function updateMathScore() {
    document.getElementById('math-score').textContent = gameState.math.score;
    document.getElementById('math-correct').textContent = gameState.math.correct;
    document.getElementById('math-total').textContent = gameState.math.total;
}
