// 数织游戏状态管理
const nonogramState = {
    board: [],
    solution: [],
    size: 5,
    rowHints: [],
    colHints: []
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeNonogram();
});

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
    nonogramState.size = size;
    
    // 生成随机数织图案
    const solution = generateNonogramSolution(size);
    nonogramState.solution = solution;
    
    // 计算行和列的数字提示
    nonogramState.rowHints = calculateRowHints(solution);
    nonogramState.colHints = calculateColHints(solution);
    
    // 创建空的游戏板
    const board = Array(size).fill().map(() => Array(size).fill(0));
    nonogramState.board = board;
    
    // 渲染棋盘和数字提示
    renderNonogramBoard(board, solution);
    
    updateNonogramStatus('游戏开始！左键填充格子，右键标记格子');
}

function generateNonogramSolution(size) {
    const solution = Array(size).fill().map(() => Array(size).fill(0));
    
    // 生成随机图案（增加填充概率，使图案更有趣）
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

function calculateRowHints(solution) {
    const hints = [];
    const size = solution.length;
    
    for (let row = 0; row < size; row++) {
        const rowHints = [];
        let count = 0;
        
        for (let col = 0; col < size; col++) {
            if (solution[row][col] === 1) {
                count++;
            } else if (count > 0) {
                rowHints.push(count);
                count = 0;
            }
        }
        
        if (count > 0) {
            rowHints.push(count);
        }
        
        hints.push(rowHints.length > 0 ? rowHints : [0]);
    }
    
    return hints;
}

function calculateColHints(solution) {
    const hints = [];
    const size = solution.length;
    
    for (let col = 0; col < size; col++) {
        const colHints = [];
        let count = 0;
        
        for (let row = 0; row < size; row++) {
            if (solution[row][col] === 1) {
                count++;
            } else if (count > 0) {
                colHints.push(count);
                count = 0;
            }
        }
        
        if (count > 0) {
            colHints.push(count);
        }
        
        hints.push(colHints.length > 0 ? colHints : [0]);
    }
    
    return hints;
}

function renderNonogramBoard(board, solution) {
    const boardElement = document.getElementById('nonogram-board');
    const colHintsElement = document.getElementById('col-hints');
    const rowHintsElement = document.getElementById('row-hints');
    
    // 清空现有内容
    boardElement.innerHTML = '';
    colHintsElement.innerHTML = '';
    rowHintsElement.innerHTML = '';
    
    // 设置CSS变量来控制网格大小
    document.documentElement.style.setProperty('--size', nonogramState.size);
    
    // 渲染列提示（垂直显示）
    nonogramState.colHints.forEach((hints, col) => {
        const hintCell = document.createElement('div');
        hintCell.className = 'col-hint-cell';
        
        // 为每个数字创建单独的元素，实现垂直排列
        hints.forEach(hint => {
            const hintNumber = document.createElement('div');
            hintNumber.className = 'col-hint-number';
            hintNumber.textContent = hint;
            hintCell.appendChild(hintNumber);
        });
        
        colHintsElement.appendChild(hintCell);
    });
    
    // 渲染行提示（垂直显示）
    nonogramState.rowHints.forEach((hints, row) => {
        const hintCell = document.createElement('div');
        hintCell.className = 'row-hint-cell';
        
        // 将提示数字连接成字符串显示
        hintCell.textContent = hints.join(' ');
        rowHintsElement.appendChild(hintCell);
    });
    
    // 渲染棋盘
    for (let row = 0; row < nonogramState.size; row++) {
        for (let col = 0; col < nonogramState.size; col++) {
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
            nonogramState.board[row][col] = 0;
        } else {
            cell.classList.add('filled');
            cell.classList.remove('marked');
            nonogramState.board[row][col] = 1;
        }
    } else if (action === 2) { // 右键：标记/取消标记
        if (cell.classList.contains('marked')) {
            cell.classList.remove('marked');
            nonogramState.board[row][col] = 0;
        } else {
            cell.classList.add('marked');
            cell.classList.remove('filled');
            nonogramState.board[row][col] = 2; // 2 表示标记
        }
    }
    
    checkNonogramCompletion();
}

function checkNonogram() {
    let correct = true;
    const size = nonogramState.size;
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.querySelector(`.nonogram-cell[data-row="${row}"][data-col="${col}"]`);
            const userValue = nonogramState.board[row][col];
            const correctValue = nonogramState.solution[row][col];
            
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
    const size = nonogramState.size;
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const userValue = nonogramState.board[row][col];
            const correctValue = nonogramState.solution[row][col];
            
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
    const size = nonogramState.size;
    const board = Array(size).fill().map(() => Array(size).fill(0));
    nonogramState.board = board;
    
    document.querySelectorAll('.nonogram-cell').forEach(cell => {
        cell.classList.remove('filled', 'marked');
        cell.style.backgroundColor = '';
    });
    
    updateNonogramStatus('已清空棋盘');
}

function updateNonogramStatus(message) {
    document.getElementById('nonogram-status').textContent = message;
}
