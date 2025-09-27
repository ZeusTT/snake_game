// 提交分数的云函数
const cloud = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloud.init({});
const db = app.database();

// 主函数
exports.main = async (event) => {
  const { playerData, action } = event;
  
  try {
    switch (action) {
      case 'submit':
        return await submitScore(playerData);
      case 'getLeaderboard':
        return await getLeaderboard();
      case 'getPlayerStats':
        return await getPlayerStats(playerData.playerId);
      default:
        return { success: false, message: '未知操作' };
    }
  } catch (error) {
    console.error('云函数执行错误:', error);
    return { success: false, message: '服务器错误' };
  }
};

// 提交分数
async function submitScore(playerData) {
  const { playerId, playerName, score, snakeLength, gameTime, device } = playerData;
  
  // 数据验证
  if (!playerId || typeof score !== 'number') {
    return { success: false, message: '数据格式错误' };
  }
  
  // 检查是否是新纪录
  const existingRecord = await db.collection('snake_scores')
    .where({ playerId })
    .get();
  
  const timestamp = new Date();
  
  if (existingRecord.data.length > 0) {
    const oldRecord = existingRecord.data[0];
    
    // 只有新分数更高时才更新
    if (score > oldRecord.score) {
      await db.collection('snake_scores')
        .doc(oldRecord._id)
        .update({
          playerName,
          score,
          snakeLength,
          gameTime,
          device,
          timestamp,
          updatedAt: timestamp
        });
      
      return { 
        success: true, 
        message: '新纪录已更新',
        isNewRecord: true,
        oldScore: oldRecord.score
      };
    } else {
      return { 
        success: true, 
        message: '分数未超越历史记录',
        isNewRecord: false,
        bestScore: oldRecord.score
      };
    }
  } else {
    // 新玩家，直接插入
    await db.collection('snake_scores').add({
      playerId,
      playerName: playerName || '匿名玩家',
      score,
      snakeLength,
      gameTime,
      device,
      timestamp,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    return { 
      success: true, 
      message: '新玩家记录已创建',
      isNewRecord: true
    };
  }
}

// 获取排行榜
async function getLeaderboard() {
  const result = await db.collection('snake_scores')
    .orderBy('score', 'desc')
    .limit(50)
    .get();
  
  return {
    success: true,
    data: result.data.map((item, index) => ({
      rank: index + 1,
      ...item
    })),
    lastUpdate: new Date().toISOString()
  };
}

// 获取玩家统计信息
async function getPlayerStats(playerId) {
  const result = await db.collection('snake_scores')
    .where({ playerId })
    .get();
  
  if (result.data.length === 0) {
    return { success: false, message: '玩家不存在' };
  }
  
  const playerData = result.data[0];
  
  // 获取总体排名
  const allPlayers = await db.collection('snake_scores')
    .orderBy('score', 'desc')
    .get();
  
  const rank = allPlayers.data.findIndex(p => p.playerId === playerId) + 1;
  
  return {
    success: true,
    data: {
      ...playerData,
      rank,
      totalPlayers: allPlayers.data.length
    }
  };
}