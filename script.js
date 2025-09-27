// 游戏变量
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const statsBtn = document.getElementById('statsBtn');

// 移动端控制按钮
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// 统计面板元素
const statsPanel = document.getElementById('statsPanel');
const closeStats = document.querySelector('.close');

// 音频上下文
let audioContext;
let isAudioEnabled = true;
const FoodType = {
    NORMAL: { 
        name: '普通食物', 
        color: '#ff6b6b', 
        points: 10, 
        effect: null,
        probability: 0.6 // 60%概率
    },
    SPEED: { 
        name: '加速食物', 
        color: '#4a90e2', 
        points: 15, 
        effect: 'speed',
        probability: 0.15 // 15%概率
    },
    SLOW: { 
        name: '减速食物', 
        color: '#50c878', 
        points: 15, 
        effect: 'slow',
        probability: 0.15 // 15%概率
    },
    SUPER: { 
        name: '超级食物', 
        color: '#ffd700', 
        points: 50, 
        effect: 'super',
        probability: 0.07 // 7%概率
    },
    SHRINK: { 
        name: '缩小食物', 
        color: '#9370db', 
        points: 20, 
        effect: 'shrink',
        probability: 0.03 // 3%概率
    }
};

// 成就定义
const Achievements = {
    BEGINNER: {
        id: 'beginner',
        name: '初学者',
        description: '首次得分100分',
        icon: 'fas fa-star',
        unlocked: false
    },
    ADVANCED: {
        id: 'advanced',
        name: '进阶者',
        description: '单局得分200分',
        icon: 'fas fa-medal',
        unlocked: false
    },
    EXPERT: {
        id: 'expert',
        name: '专家',
        description: '单局得分500分',
        icon: 'fas fa-crown',
        unlocked: false
    },
    LEGEND: {
        id: 'legend',
        name: '传奇',
        description: '单局得分1000分',
        icon: 'fas fa-trophy',
        unlocked: false
    },
    COLLECTOR: {
        id: 'collector',
        name: '收集家',
        description: '累计收集100个食物',
        icon: 'fas fa-apple-alt',
        unlocked: false
    },
    SURVIVOR: {
        id: 'survivor',
        name: '生存专家',
        description: '单局存活超过5分钟',
        icon: 'fas fa-clock',
        unlocked: false
    },
    PERFECT: {
        id: 'perfect',
        name: '完美主义者',
        description: '单局无碰撞得分300分',
        icon: 'fas fa-heart',
        unlocked: false
    },
    FOODIE: {
        id: 'foodie',
        name: '美食家',
        description: '每种食物类型都收集过',
        icon: 'fas fa-utensils',
        unlocked: false
    }
};

// 游戏统计数据
let gameStats = {
    // 当前游戏数据
    currentScore: 0,
    currentLength: 3,
    gameTime: 0,
    
    // 历史记录
    highScore: 0,
    maxLength: 3,
    totalGames: 0,
    totalScore: 0,
    
    // 食物收集统计
    foodCollected: {
        normal: 0,
        speed: 0,
        slow: 0,
        super: 0,
        shrink: 0
    },
    
    // 成就
    achievements: {},
    
    // 主题设置
    theme: 'classic',
    effects: {
        particle: true,
        animation: true,
        glow: true,
        performance: 'medium'
    }
};

// 游戏计时器
let gameTimer = null;
let gameStartTime = null;

// 主题系统
const Themes = {
    CLASSIC: {
        id: 'classic',
        name: '经典主题',
        foodColors: {
            NORMAL: '#ff6b6b',
            SPEED: '#4a90e2',
            SLOW: '#50c878',
            SUPER: '#ffd700',
            SHRINK: '#9370db'
        }
    },
    DEEPSEA: {
        id: 'deepsea',
        name: '深海主题',
        foodColors: {
            NORMAL: '#ff5252',
            SPEED: '#448aff',
            SLOW: '#4caf50',
            SUPER: '#ffd740',
            SHRINK: '#7c4dff'
        }
    },
    SPACE: {
        id: 'space',
        name: '太空主题',
        foodColors: {
            NORMAL: '#ff1744',
            SPEED: '#2979ff',
            SLOW: '#00e676',
            SUPER: '#ffc400',
            SHRINK: '#d500f9'
        }
    },
    NEON: {
        id: 'neon',
        name: '霓虹主题',
        foodColors: {
            NORMAL: '#ff0266',
            SPEED: '#00b8d4',
            SLOW: '#00e676',
            SUPER: '#ffd600',
            SHRINK: '#ea80fc'
        }
    },
    PIXEL: {
        id: 'pixel',
        name: '像素主题',
        foodColors: {
            NORMAL: '#ff0000',
            SPEED: '#0000ff',
            SLOW: '#00ff00',
            SUPER: '#ffff00',
            SHRINK: '#ff00ff'
        }
    },
    CANDY: {
        id: 'candy',
        name: '糖果主题',
        foodColors: {
            NORMAL: '#ff6b9d',
            SPEED: '#6bcaff',
            SLOW: '#7bde87',
            SUPER: '#ffd166',
            SHRINK: '#c191ff'
        }
    }
};

// 当前主题
let currentTheme = Themes.CLASSIC;


// 当前激活的特效
let activeEffect = null;
let effectTimer = null;

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
let collisionFree = true; // 是否无碰撞

// 初始化音频上下文
function initAudio() {
    try {
        // 创建音频上下文
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        isAudioEnabled = true;
    } catch (e) {
        console.warn('音频功能不支持:', e);
        isAudioEnabled = false;
    }
}

// 播放音效
function playSound(frequency, duration, type = 'sine') {
    if (!isAudioEnabled || !audioContext) return;
    
    try {
        // 恢复音频上下文（浏览器限制）
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        // 设置音量包络
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.warn('播放音效失败:', e);
    }
}

// 播放食物音效
function playFoodSound(foodType) {
    if (!isAudioEnabled) return;
    
    switch (foodType) {
        case FoodType.NORMAL:
            playSound(523.25, 0.1, 'sine'); // C5
            break;
        case FoodType.SPEED:
            playSound(659.25, 0.15, 'square'); // E5
            break;
        case FoodType.SLOW:
            playSound(329.63, 0.2, 'triangle'); // E4
            break;
        case FoodType.SUPER:
            playSound(783.99, 0.3, 'sawtooth'); // G5
            break;
        case FoodType.SHRINK:
            playSound(392.00, 0.25, 'square'); // G4
            break;
    }
}

// 播放碰撞音效
function playCollisionSound() {
    if (!isAudioEnabled) return;
    playSound(220, 0.5, 'square'); // A3
}

// 播放开始游戏音效
function playStartSound() {
    if (!isAudioEnabled) return;
    playSound(523.25, 0.1, 'sine'); // C5
    setTimeout(() => playSound(659.25, 0.1, 'sine'), 100); // E5
    setTimeout(() => playSound(783.99, 0.1, 'sine'), 200); // G5
}

// 播放成就解锁音效
function playAchievementSound() {
    if (!isAudioEnabled) return;
    playSound(523.25, 0.1, 'sine'); // C5
    setTimeout(() => playSound(659.25, 0.1, 'sine'), 100); // E5
    setTimeout(() => playSound(783.99, 0.1, 'sine'), 200); // G5
    setTimeout(() => playSound(1046.50, 0.3, 'sine'), 300); // C6
}

// 初始化游戏统计数据
function initGameStats() {
    // 从LocalStorage加载数据
    const savedStats = localStorage.getItem('snakeGameStats');
    if (savedStats) {
        try {
            const parsedStats = JSON.parse(savedStats);
            gameStats = {...gameStats, ...parsedStats};
            
            // 确保成就对象正确初始化
            if (!gameStats.achievements) {
                gameStats.achievements = {};
            }
            
            // 初始化未解锁的成就
            for (const key in Achievements) {
                if (!gameStats.achievements[Achievements[key].id]) {
                    gameStats.achievements[Achievements[key].id] = false;
                }
            }
        } catch (e) {
            console.warn('加载统计数据失败:', e);
        }
    }
    
    // 更新统计面板显示
    updateStatsDisplay();
}

// 保存游戏统计数据
function saveGameStats() {
    try {
        localStorage.setItem('snakeGameStats', JSON.stringify(gameStats));
    } catch (e) {
        console.warn('保存统计数据失败:', e);
    }
}

// 更新统计数据
function updateStats() {
    // 更新当前游戏数据
    gameStats.currentScore = score;
    gameStats.currentLength = snake.length;
    
    // 更新历史记录
    if (score > gameStats.highScore) {
        gameStats.highScore = score;
    }
    
    if (snake.length > gameStats.maxLength) {
        gameStats.maxLength = snake.length;
    }
    
    // 更新食物收集统计
    switch (food.type) {
        case FoodType.NORMAL:
            gameStats.foodCollected.normal++;
            break;
        case FoodType.SPEED:
            gameStats.foodCollected.speed++;
            break;
        case FoodType.SLOW:
            gameStats.foodCollected.slow++;
            break;
        case FoodType.SUPER:
            gameStats.foodCollected.super++;
            break;
        case FoodType.SHRINK:
            gameStats.foodCollected.shrink++;
            break;
    }
    
    // 检查成就
    checkAchievements();
    
    // 更新显示
    updateStatsDisplay();
    
    // 保存数据
    saveGameStats();
}

// 检查成就解锁
function checkAchievements() {
    let newAchievementUnlocked = false;
    
    // 初学者：首次得分100分
    if (score >= 100 && !gameStats.achievements.beginner) {
        gameStats.achievements.beginner = true;
        newAchievementUnlocked = true;
    }
    
    // 进阶者：单局得分200分
    if (score >= 200 && !gameStats.achievements.advanced) {
        gameStats.achievements.advanced = true;
        newAchievementUnlocked = true;
    }
    
    // 专家：单局得分500分
    if (score >= 500 && !gameStats.achievements.expert) {
        gameStats.achievements.expert = true;
        newAchievementUnlocked = true;
    }
    
    // 传奇：单局得分1000分
    if (score >= 1000 && !gameStats.achievements.legend) {
        gameStats.achievements.legend = true;
        newAchievementUnlocked = true;
    }
    
    // 收集家：累计收集100个食物
    const totalFood = Object.values(gameStats.foodCollected).reduce((a, b) => a + b, 0);
    if (totalFood >= 100 && !gameStats.achievements.collector) {
        gameStats.achievements.collector = true;
        newAchievementUnlocked = true;
    }
    
    // 生存专家：单局存活超过5分钟
    if (gameStats.gameTime >= 300 && !gameStats.achievements.survivor) {
        gameStats.achievements.survivor = true;
        newAchievementUnlocked = true;
    }
    
    // 完美主义者：单局无碰撞得分300分
    if (score >= 300 && collisionFree && !gameStats.achievements.perfect) {
        gameStats.achievements.perfect = true;
        newAchievementUnlocked = true;
    }
    
    // 美食家：每种食物类型都收集过
    const allFoodCollected = Object.values(gameStats.foodCollected).every(count => count > 0);
    if (allFoodCollected && !gameStats.achievements.foodie) {
        gameStats.achievements.foodie = true;
        newAchievementUnlocked = true;
    }
    
    // 如果有新成就解锁，播放音效
    if (newAchievementUnlocked) {
        playAchievementSound();
    }
}

// 更新统计面板显示
function updateStatsDisplay() {
    // 当前游戏数据
    document.getElementById('currentScore').textContent = gameStats.currentScore;
    document.getElementById('currentLength').textContent = gameStats.currentLength;
    document.getElementById('gameTime').textContent = formatTime(gameStats.gameTime);
    
    // 历史记录
    document.getElementById('highScore').textContent = gameStats.highScore;
    document.getElementById('maxLength').textContent = gameStats.maxLength;
    document.getElementById('totalGames').textContent = gameStats.totalGames;
    document.getElementById('totalScore').textContent = gameStats.totalScore;
    
    // 食物收集
    document.getElementById('normalFood').textContent = gameStats.foodCollected.normal;
    document.getElementById('speedFood').textContent = gameStats.foodCollected.speed;
    document.getElementById('slowFood').textContent = gameStats.foodCollected.slow;
    document.getElementById('superFood').textContent = gameStats.foodCollected.super;
    document.getElementById('shrinkFood').textContent = gameStats.foodCollected.shrink;
    
    // 成就
    renderAchievements();
}

// 格式化时间显示
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 渲染成就
function renderAchievements() {
    const container = document.getElementById('achievementsContainer');
    container.innerHTML = '';
    
    for (const key in Achievements) {
        const achievement = Achievements[key];
        const unlocked = gameStats.achievements[achievement.id] || false;
        
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${unlocked ? 'unlocked' : 'locked'}`;
        achievementElement.innerHTML = `
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
        `;
        
        container.appendChild(achievementElement);
    }
}

// 开始游戏计时器
function startGameTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    
    gameStartTime = Date.now();
    gameStats.gameTime = 0;
    
    gameTimer = setInterval(() => {
        gameStats.gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
        updateStatsDisplay();
    }, 1000);
}

// 停止游戏计时器
function stopGameTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

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
    
    // 清除激活的特效
    clearEffect();
    
    // 重置统计数据
    gameStats.currentScore = 0;
    gameStats.currentLength = 3;
    gameStats.gameTime = 0;
    collisionFree = true;
    
    // 更新按钮文本
    startBtn.innerHTML = '<i class="fas fa-play"></i>';
    
    // 更新显示
    updateStatsDisplay();
    
    // 绘制游戏画面
    drawGame();
}

// 放置食物
function placeFood() {
    // 随机选择食物类型
    const foodTypes = Object.values(FoodType);
    const random = Math.random();
    
    let cumulativeProbability = 0;
    let selectedFoodType = FoodType.NORMAL; // 默认类型
    
    for (const foodType of foodTypes) {
        cumulativeProbability += foodType.probability;
        if (random <= cumulativeProbability) {
            selectedFoodType = foodType;
            break;
        }
    }
    
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        type: selectedFoodType
    };
    
    // 确保食物不会出现在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
            break;
        }
    }
}

// 清除激活的特效
function clearEffect() {
    if (effectTimer) {
        clearTimeout(effectTimer);
        effectTimer = null;
    }
    activeEffect = null;
    
    // 恢复原始速度
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, currentSpeed);
    }
}

// 应用食物特效
function applyFoodEffect(foodType) {
    const effect = foodType.effect;
    if (!effect) return; // 普通食物没有特效
    
    // 清除之前的特效
    clearEffect();
    
    // 设置新的特效
    activeEffect = effect;
    
    switch (effect) {
        case 'speed':
            // 临时提升速度20%，持续5秒
            const speedBoost = Math.max(50, currentSpeed * 0.8);
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, speedBoost);
            }
            
            effectTimer = setTimeout(() => {
                if (gameInterval) {
                    clearInterval(gameInterval);
                    gameInterval = setInterval(gameLoop, currentSpeed);
                }
                activeEffect = null;
            }, 5000);
            break;
            
        case 'slow':
            // 临时降低速度30%，持续5秒
            const slowSpeed = currentSpeed * 1.3;
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, slowSpeed);
            }
            
            effectTimer = setTimeout(() => {
                if (gameInterval) {
                    clearInterval(gameInterval);
                    gameInterval = setInterval(gameLoop, currentSpeed);
                }
                activeEffect = null;
            }, 5000);
            break;
            
        case 'super':
            // 临时无敌状态，持续3秒
            // 无敌状态的处理在碰撞检测中实现
            effectTimer = setTimeout(() => {
                activeEffect = null;
            }, 3000);
            break;
            
        case 'shrink':
            // 临时缩小蛇身长度2节
            if (snake.length > 3) {
                snake = snake.slice(0, Math.max(3, snake.length - 2));
            }
            break;
    }
}

// 创建蛇头图像对象
const snakeHeadImg = new Image();
let snakeHeadLoaded = false;
// 使用1.jpg作为蛇头图像
snakeHeadImg.onload = function() {
    snakeHeadLoaded = true;
    // 如果游戏已经初始化，重新绘制游戏
    if (typeof drawGame === 'function') {
        drawGame();
    }
};
snakeHeadImg.onerror = function() {
    // 如果图片加载失败，设置一个标志并使用备用方案
    console.warn('蛇头图片加载失败，使用备用绘制');
    snakeHeadLoaded = true; // 仍然设置为true以避免无限等待
};
snakeHeadImg.src = '1.jpg';

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
    // 蛇头（始终绘制，保持正面朝向）
    if (snake.length > 0) {
        const head = snake[0];
        
        // 如果图片已加载，绘制图片；否则使用备用绘制
        if (snakeHeadLoaded && snakeHeadImg.complete && snakeHeadImg.naturalWidth !== 0) {
            // 直接绘制蛇头图像，不进行任何旋转，保持正面朝向
            ctx.drawImage(snakeHeadImg, head.x * gridSize, head.y * gridSize, gridSize - 1, gridSize - 1);
        } else {
            // 图片未加载完成时的备用绘制方案
            ctx.fillStyle = '#4a90e2'; // 使用主题的主色
            ctx.beginPath();
            ctx.arc(
                head.x * gridSize + gridSize/2, 
                head.y * gridSize + gridSize/2, 
                gridSize/2 - 1, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            // 绘制眼睛让蛇头更有辨识度
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(
                head.x * gridSize + gridSize/2 - 3, 
                head.y * gridSize + gridSize/2 - 2, 
                2, 
                0, 
                Math.PI * 2
            );
            ctx.arc(
                head.x * gridSize + gridSize/2 + 3, 
                head.y * gridSize + gridSize/2 - 2, 
                2, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    // 蛇身
    ctx.fillStyle = '#7bb3f0';
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 1, gridSize - 1);
    }
    
    // 绘制食物
    if (food.type) {
        ctx.fillStyle = food.type.color;
        
        // 根据食物类型绘制不同形状
        switch (food.type) {
            case FoodType.NORMAL:
                // 圆形
                ctx.beginPath();
                ctx.arc(
                    food.x * gridSize + gridSize/2, 
                    food.y * gridSize + gridSize/2, 
                    gridSize/2 - 1, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
                break;
                
            case FoodType.SPEED:
                // 菱形
                ctx.beginPath();
                ctx.moveTo(food.x * gridSize + gridSize/2, food.y * gridSize + 1);
                ctx.lineTo(food.x * gridSize + gridSize - 1, food.y * gridSize + gridSize/2);
                ctx.lineTo(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize - 1);
                ctx.lineTo(food.x * gridSize + 1, food.y * gridSize + gridSize/2);
                ctx.closePath();
                ctx.fill();
                break;
                
            case FoodType.SLOW:
                // 三角形
                ctx.beginPath();
                ctx.moveTo(food.x * gridSize + gridSize/2, food.y * gridSize + 1);
                ctx.lineTo(food.x * gridSize + gridSize - 1, food.y * gridSize + gridSize - 1);
                ctx.lineTo(food.x * gridSize + 1, food.y * gridSize + gridSize - 1);
                ctx.closePath();
                ctx.fill();
                break;
                
            case FoodType.SUPER:
                // 星星形状
                drawStar(ctx, food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 1);
                break;
                
            case FoodType.SHRINK:
                // 方形
                ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);
                break;
        }
    }
}

// 绘制星星形状
function drawStar(ctx, cx, cy, outerRadius) {
    const innerRadius = outerRadius * 0.5;
    const points = 5;
    
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = Math.PI * i / points - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
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
        // 播放食物音效
        playFoodSound(food.type);
        
        // 增加分数
        score += food.type.points;
        scoreDisplay.textContent = score;
        
        // 分数跳动动画
        scoreDisplay.classList.add('score-bounce');
        setTimeout(() => {
            scoreDisplay.classList.remove('score-bounce');
        }, 500);
        
        // 更新统计数据
        updateStats();
        
        // 应用食物特效
        applyFoodEffect(food.type);
        
        // 放置新食物
        placeFood();
        
        // 根据蛇的长度增加速度（限制最小间隔）
        if (currentSpeed > minSpeed) {
            currentSpeed = Math.max(minSpeed, baseSpeed - (snake.length - 3) * speedIncrement);
            if (gameInterval && !activeEffect) {
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
        collisionFree = false;
        return true;
    }
    
    // 检查是否撞到自己
    // 如果有超级食物特效，可以穿越自身
    if (activeEffect !== 'super') {
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                collisionFree = false;
                return true;
            }
        }
    }
    
    return false;
}

// 游戏循环
function gameLoop() {
    moveSnake();
    
    if (checkCollision()) {
        // 播放碰撞音效
        playCollisionSound();
        
        // 更新游戏统计数据
        gameStats.totalGames++;
        gameStats.totalScore += score;
        
        // 停止游戏计时器
        stopGameTimer();
        
        clearInterval(gameInterval);
        gameInterval = null;
        gameStarted = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i>';
        clearEffect(); // 清除所有特效
        
        // 保存统计数据
        saveGameStats();
        
        alert(`游戏结束！你的得分是：${score}`);
        return;
    }
    
    drawGame();
}

// 开始游戏
function startGame() {
    if (!gameInterval) {
        // 播放开始音效
        playStartSound();
        
        // 开始游戏计时器
        startGameTimer();
        
        gameInterval = setInterval(gameLoop, currentSpeed);
        gameStarted = true;
        startBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        clearInterval(gameInterval);
        gameInterval = null;
        startBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    initGame();
    drawGame();
    startBtn.innerHTML = '<i class="fas fa-play"></i>';
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
document.addEventListener('keydown', handleKeyPress);

// 移动端按钮事件监听器
upBtn.addEventListener('click', () => handleMobileControl('up'));
downBtn.addEventListener('click', () => handleMobileControl('down'));
leftBtn.addEventListener('click', () => handleMobileControl('left'));
rightBtn.addEventListener('click', () => handleMobileControl('right'));

// 开始和重置按钮事件监听器
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// 统计面板控制函数
function initStatsPanel() {
    const statsBtn = document.getElementById('statsBtn');
    const statsPanel = document.getElementById('statsPanel');
    const closeStats = statsPanel.querySelector('.close');
    
    // 统计按钮点击事件
    statsBtn.addEventListener('click', () => {
        // 更新统计数据
        updateStatsDisplay();
        
        statsPanel.style.display = 'block';
        statsPanel.classList.add('show');
    });
    
    // 关闭统计面板
    closeStats.addEventListener('click', () => {
        statsPanel.classList.remove('show');
        setTimeout(() => {
            statsPanel.style.display = 'none';
        }, 300);
    });
    
    // 点击面板外部关闭
    statsPanel.addEventListener('click', (e) => {
        if (e.target === statsPanel) {
            statsPanel.classList.remove('show');
            setTimeout(() => {
                statsPanel.style.display = 'none';
            }, 300);
        }
    });
}

// 主题控制函数
function initThemeSystem() {
    const themeBtn = document.getElementById('themeBtn');
    const themePanel = document.getElementById('themePanel');
    const closeTheme = themePanel.querySelector('.close');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // 主题按钮点击事件
    themeBtn.addEventListener('click', () => {
        themePanel.style.display = 'block';
        themePanel.classList.add('show');
    });
    
    // 关闭主题面板
    closeTheme.addEventListener('click', () => {
        themePanel.classList.remove('show');
        setTimeout(() => {
            themePanel.style.display = 'none';
        }, 300);
    });
    
    // 主题选择事件
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 移除其他选项的选中状态
            themeOptions.forEach(opt => opt.classList.remove('selected'));
            // 设置当前选中
            option.classList.add('selected');
            
            const themeId = option.dataset.theme;
            changeTheme(themeId);
        });
    });
    
    // 效果设置
    const particleEffect = document.getElementById('particleEffect');
    const animationEffect = document.getElementById('animationEffect');
    const glowEffect = document.getElementById('glowEffect');
    const performanceMode = document.getElementById('performanceMode');
    
    // 加载保存的设置
    const savedTheme = localStorage.getItem('snakeGameTheme');
    const savedEffects = localStorage.getItem('snakeGameEffects');
    
    if (savedTheme) {
        changeTheme(savedTheme);
        // 设置对应的主题选项为选中状态
        themeOptions.forEach(option => {
            if (option.dataset.theme === savedTheme) {
                option.classList.add('selected');
            }
        });
    }
    
    if (savedEffects) {
        const effects = JSON.parse(savedEffects);
        particleEffect.checked = effects.particle !== false;
        animationEffect.checked = effects.animation !== false;
        glowEffect.checked = effects.glow !== false;
        performanceMode.value = effects.performance || 'medium';
        
        // 更新游戏统计中的设置
        gameStats.effects = effects;
    }
    
    // 监听设置变化
    particleEffect.addEventListener('change', saveEffects);
    animationEffect.addEventListener('change', saveEffects);
    glowEffect.addEventListener('change', saveEffects);
    performanceMode.addEventListener('change', saveEffects);
}

// 切换主题
function changeTheme(themeId) {
    const theme = Object.values(Themes).find(t => t.id === themeId) || Themes.CLASSIC;
    currentTheme = theme;
    
    // 更新DOM属性
    document.documentElement.setAttribute('data-theme', themeId);
    
    // 更新食物颜色
    updateFoodColors();
    
    // 保存主题设置
    localStorage.setItem('snakeGameTheme', themeId);
    
    // 重绘游戏
    drawGame();
}

// 更新食物颜色
function updateFoodColors() {
    FoodType.NORMAL.color = currentTheme.foodColors.NORMAL;
    FoodType.SPEED.color = currentTheme.foodColors.SPEED;
    FoodType.SLOW.color = currentTheme.foodColors.SLOW;
    FoodType.SUPER.color = currentTheme.foodColors.SUPER;
    FoodType.SHRINK.color = currentTheme.foodColors.SHRINK;
}

// 保存效果设置
function saveEffects() {
    const particleEffect = document.getElementById('particleEffect');
    const animationEffect = document.getElementById('animationEffect');
    const glowEffect = document.getElementById('glowEffect');
    const performanceMode = document.getElementById('performanceMode');
    
    const effects = {
        particle: particleEffect.checked,
        animation: animationEffect.checked,
        glow: glowEffect.checked,
        performance: performanceMode.value
    };
    
    // 更新游戏统计中的设置
    gameStats.effects = effects;
    
    // 保存到本地存储
    localStorage.setItem('snakeGameEffects', JSON.stringify(effects));
    
    // 应用效果设置
    applyEffectsSettings();
}

// 应用效果设置
function applyEffectsSettings() {
    const effects = gameStats.effects;
    
    // 根据性能模式调整效果
    switch (effects.performance) {
        case 'low':
            // 降低动画复杂度
            break;
        case 'medium':
            // 标准效果
            break;
        case 'high':
            // 增强效果
            break;
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    drawGame(); // 确保在页面加载时绘制游戏
    
    // 初始化音频
    initAudio();
    
    // 初始化游戏统计数据
    initGameStats();
    
    // 初始化统计面板
    initStatsPanel();
    
    // 初始化主题系统
    initThemeSystem();
});