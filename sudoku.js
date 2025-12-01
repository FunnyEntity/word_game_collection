// 数独游戏状态管理
const sudokuState = {
    board: [],
    solution: [],
    selectedCell: null,
    timer: null,
    timeElapsed: 0,
    isPlaying: false
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeSudoku();
});

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
    
    // 初始化数字键盘
    initializeNumberPad();
    
    // 初始生成数独
    generateSudoku();
}

// 初始化数字键盘
function initializeNumberPad() {
    const numberPad = document.getElementById('number-pad');
    numberPad.addEventListener('click', handleNumberPadClick);
}

// 处理数字键盘点击
function handleNumberPadClick(event) {
    if (!sudokuState.selectedCell) {
        updateSudokuStatus('请先选择一个单元格');
        return;
    }
    
    const button = event.target.closest('.number-btn');
    if (!button) return;
    
    const number = parseInt(button.dataset.number);
    const { row, col } = sudokuState.selectedCell;
    
    if (number === 0) {
        // 清除单元格
        sudokuState.board[row][col] = 0;
        const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = '';
        cell.classList.remove('error');
    } else if (number >= 1 && number <= 9) {
        // 输入数字
        sudokuState.board[row][col] = number;
        
        // 更新显示
        const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = number;
        
        // 检查是否正确
        if (number !== sudokuState.solution[row][col]) {
            cell.classList.add('error');
        } else {
            cell.classList.remove('error');
        }
        
        // 检查是否完成
        checkSudokuCompletion();
    }
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
    sudokuState.solution = solution;
    
    // 创建游戏板（移除一些数字）
    const board = solution.map(row => [...row]);
    removeNumbers(board, cellsToRemove[difficulty]);
    sudokuState.board = board;
    
    // 渲染棋盘
    renderSudokuBoard(board);
    
    // 重置游戏状态
    sudokuState.selectedCell = null;
    sudokuState.timeElapsed = 0;
    sudokuState.isPlaying = true;
    
    // 启动计时器
    if (sudokuState.timer) {
        clearInterval(sudokuState.timer);
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
    sudokuState.selectedCell = { row, col };
    
    // 添加键盘输入监听
    document.addEventListener('keydown', handleSudokuKeyPress);
}

function handleSudokuKeyPress(event) {
    if (!sudokuState.selectedCell) return;
    
    const { row, col } = sudokuState.selectedCell;
    const key = event.key;
    
    if (key >= '1' && key <= '9') {
        const num = parseInt(key);
        sudokuState.board[row][col] = num;
        
        // 更新显示
        const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = num;
        
        // 检查是否正确
        if (num !== sudokuState.solution[row][col]) {
            cell.classList.add('error');
        } else {
            cell.classList.remove('error');
        }
        
        // 检查是否完成
        checkSudokuCompletion();
    } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        sudokuState.board[row][col] = 0;
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
            const userValue = sudokuState.board[row][col];
            const correctValue = sudokuState.solution[row][col];
            
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
            if (sudokuState.board[row][col] !== sudokuState.solution[row][col]) {
                return false;
            }
        }
    }
    
    // 游戏完成
    sudokuState.isPlaying = false;
    clearInterval(sudokuState.timer);
    updateSudokuStatus('恭喜！您已完成数独！');
    return true;
}

function showSudokuSolution() {
    const board = sudokuState.solution;
    renderSudokuBoard(board);
    sudokuState.isPlaying = false;
    clearInterval(sudokuState.timer);
    updateSudokuStatus('已显示完整答案');
}

function startSudokuTimer() {
    sudokuState.timer = setInterval(() => {
        sudokuState.timeElapsed++;
        const minutes = Math.floor(sudokuState.timeElapsed / 60);
        const seconds = sudokuState.timeElapsed % 60;
        document.getElementById('sudoku-timer').textContent = 
            `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function updateSudokuStatus(message) {
    document.getElementById('sudoku-status').textContent = message;
}
