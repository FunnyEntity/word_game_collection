// 数学挑战游戏状态管理
const mathState = {
    currentProblem: null,
    score: 0,
    correct: 0,
    total: 0
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeMathGame();
});

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
    
    mathState.currentProblem = {
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
    const correctAnswer = mathState.currentProblem.answer;
    
    mathState.total++;
    
    if (userAnswer === correctAnswer) {
        mathState.correct++;
        mathState.score += 10;
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
    document.getElementById('math-score').textContent = mathState.score;
    document.getElementById('math-correct').textContent = mathState.correct;
    document.getElementById('math-total').textContent = mathState.total;
}
