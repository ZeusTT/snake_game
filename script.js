// 游戏变量
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// 移动端控制按钮
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// 游戏设置
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const baseSpeed = 200; // 初始速度（毫秒）
const speedIncrement = 2; // 每增长一节身体增加的速度
const minSpeed = 80; // 最大速度（最小间隔毫秒）

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval;
let currentSpeed; // 当前速度
let gameStarted = false;
let pendingDirection = null; // 用于存储待处理的方向变化

// 初始化游戏
function initGame() {
    // 初始化蛇的位置（放在画布中央偏左，避免初始方向问题）
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    
    // 初始化食物位置
    placeFood();
    
    // 重置移动方向（向右）
    dx = 1;
    dy = 0;
    
    // 重置分数和速度
    score = 0;
    currentSpeed = baseSpeed;
    scoreDisplay.textContent = score;
    
    // 重置游戏状态
    gameStarted = false;
    
    // 清空待处理方向
    pendingDirection = null;
    
    // 更新按钮文本
    startBtn.innerHTML = '<i class="fas fa-play"></i> 开始游戏';
}

// 放置食物
function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // 确保食物不会出现在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
            break;
        }
    }
}

// 绘制游戏元素
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tileCount; i++) {
        for (let j = 0; j < tileCount; j++) {
            ctx.strokeRect(i * gridSize, j * gridSize, gridSize, gridSize);
        }
    }
    
    // 绘制蛇
    // 蛇头
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 1, gridSize - 1);
    
    // 蛇身
    ctx.fillStyle = '#7bb3f0';
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 1, gridSize - 1);
    }
    
    // 绘制食物
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2, 
        food.y * gridSize + gridSize/2, 
        gridSize/2 - 1, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
}

// 移动蛇
function moveSnake() {
    // 应用待处理的方向变化（如果有的话）
    if (pendingDirection) {
        // 防止反向移动
        if (!(dx === -pendingDirection.dx && dy === -pendingDirection.dy)) {
            dx = pendingDirection.dx;
            dy = pendingDirection.dy;
        }
        pendingDirection = null;
    }
    
    // 计算新头部位置
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // 将新头部添加到蛇数组开头
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreDisplay.textContent = score;
        
        // 放置新食物
        placeFood();
        
        // 根据蛇的长度增加速度（限制最小间隔）
        if (currentSpeed > minSpeed) {
            currentSpeed = Math.max(minSpeed, baseSpeed - (snake.length - 3) * speedIncrement);
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, currentSpeed);
            }
        }
    } else {
        // 移除尾部（如果没有吃到食物）
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏循环
function gameLoop() {
    moveSnake();
    
    if (checkCollision()) {
        clearInterval(gameInterval);
        gameInterval = null;
        gameStarted = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> 开始游戏';
        alert(`游戏结束！你的得分是：${score}`);
        return;
    }
    
    drawGame();
}

// 开始游戏
function startGame() {
    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, currentSpeed);
        gameStarted = true;
        startBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停游戏';
    } else {
        clearInterval(gameInterval);
        gameInterval = null;
        startBtn.innerHTML = '<i class="fas fa-play"></i> 继续游戏';
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    initGame();
    drawGame();
    startBtn.innerHTML = '<i class="fas fa-play"></i> 开始游戏';
}

// 处理键盘输入
function handleKeyPress(e) {
    // 阻止方向键的默认行为（防止页面滚动）
    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
    }
    
    // 只有在游戏开始后才响应按键
    if (!gameStarted) return;
    
    // 存储待处理的方向变化
    switch(e.key) {
        case 'ArrowLeft':
            pendingDirection = {dx: -1, dy: 0};
            break;
        case 'ArrowUp':
            pendingDirection = {dx: 0, dy: -1};
            break;
        case 'ArrowRight':
            pendingDirection = {dx: 1, dy: 0};
            break;
        case 'ArrowDown':
            pendingDirection = {dx: 0, dy: 1};
            break;
    }
}

// 处理移动端按钮控制
function handleMobileControl(direction) {
    // 只有在游戏开始后才响应按键
    if (!gameStarted) return;
    
    // 存储待处理的方向变化
    switch(direction) {
        case 'left':
            pendingDirection = {dx: -1, dy: 0};
            break;
        case 'up':
            pendingDirection = {dx: 0, dy: -1};
            break;
        case 'right':
            pendingDirection = {dx: 1, dy: 0};
            break;
        case 'down':
            pendingDirection = {dx: 0, dy: 1};
            break;
    }
}

// 事件监听器
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

// 移动端按钮事件监听器
upBtn.addEventListener('click', () => handleMobileControl('up'));
downBtn.addEventListener('click', () => handleMobileControl('down'));
leftBtn.addEventListener('click', () => handleMobileControl('left'));
rightBtn.addEventListener('click', () => handleMobileControl('right'));

// 初始化游戏
initGame();
drawGame();