// 腾讯云开发配置文件
module.exports = {
  envId: "snake-game-env", // 您需要替换为实际的云开发环境ID
  region: "ap-shanghai", // 上海区域，国内访问速度快
  
  // 数据库集合配置
  collections: [
    {
      collectionName: "snake_scores",
      description: "贪吃蛇游戏分数记录",
      // 自动创建索引
      indexes: [
        {
          name: "score_desc",
          key: {
            score: -1 // 按分数降序排列
          }
        },
        {
          name: "timestamp_desc", 
          key: {
            timestamp: -1 // 按时间降序排列
          }
        }
      ]
    }
  ],
  
  // 云函数配置（可选，用于更复杂的业务逻辑）
  functions: [
    {
      name: "submit-score",
      timeout: 5,
      envVariables: {},
      runtime: "Nodejs16.13"
    }
  ],
  
  // 静态网站托管配置
  static: {
    host: "snake-game",
    root: "./",
    index: "index.html",
    error: "index.html"
  }
};