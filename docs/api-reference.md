# API 参考文档

## 概述

Web3.0 DeFi词汇大作战应用的API接口文档，包含词汇数据、用户进度、音频服务等相关接口。

## 基础信息

- **Base URL**: `https://api.web3vocab.com/v1`
- **认证方式**: Bearer Token (可选)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-12-08T10:00:00Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2024-12-08T10:00:00Z"
}
```

## 词汇管理 API

### 获取词汇列表

**GET** `/vocabulary`

获取Web3.0和DeFi词汇列表。

#### 查询参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `page` | number | 否 | 页码，默认1 |
| `limit` | number | 否 | 每页数量，默认20，最大100 |
| `category` | string | 否 | 词汇分类：`defi`, `blockchain`, `trading`, `protocol` |
| `difficulty` | string | 否 | 难度级别：`beginner`, `intermediate`, `advanced` |
| `search` | string | 否 | 搜索关键词 |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "vocab_001",
        "word": "DeFi",
        "pronunciation": "/diːfaɪ/",
        "definition": "去中心化金融，指基于区块链技术的金融服务",
        "example": "DeFi protocols allow users to lend and borrow without intermediaries.",
        "category": "defi",
        "difficulty": "beginner",
        "tags": ["finance", "blockchain", "decentralized"],
        "audioUrl": "https://cdn.web3vocab.com/audio/defi.mp3",
        "createdAt": "2024-12-08T10:00:00Z",
        "updatedAt": "2024-12-08T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000,
      "totalPages": 50
    }
  }
}
```

### 获取单个词汇

**GET** `/vocabulary/{id}`

获取指定词汇的详细信息。

#### 路径参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `id` | string | 是 | 词汇ID |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "vocab_001",
    "word": "DeFi",
    "pronunciation": "/diːfaɪ/",
    "definition": "去中心化金融，指基于区块链技术的金融服务",
    "example": "DeFi protocols allow users to lend and borrow without intermediaries.",
    "category": "defi",
    "difficulty": "beginner",
    "tags": ["finance", "blockchain", "decentralized"],
    "audioUrl": "https://cdn.web3vocab.com/audio/defi.mp3",
    "relatedWords": ["blockchain", "protocol", "smart-contract"],
    "etymology": "Decentralized Finance的缩写",
    "createdAt": "2024-12-08T10:00:00Z",
    "updatedAt": "2024-12-08T10:00:00Z"
  }
}
```

### 添加自定义词汇

**POST** `/vocabulary`

用户添加自定义词汇。

#### 请求体

```json
{
  "word": "Yield Farming",
  "pronunciation": "/jiːld ˈfɑːrmɪŋ/",
  "definition": "通过提供流动性获得代币奖励的策略",
  "example": "Yield farming can provide high returns but comes with risks.",
  "category": "defi",
  "difficulty": "intermediate",
  "tags": ["farming", "liquidity", "rewards"]
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "vocab_custom_001",
    "word": "Yield Farming",
    "status": "pending_review",
    "createdAt": "2024-12-08T10:00:00Z"
  },
  "message": "词汇已提交，等待审核"
}
```

## 用户进度 API

### 获取学习进度

**GET** `/progress`

获取用户的学习进度统计。

#### 查询参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `period` | string | 否 | 统计周期：`day`, `week`, `month`, `year` |
| `userId` | string | 否 | 用户ID（匿名用户可选） |

#### 响应示例

```json
{
  "success": true,
  "data": {
    "userId": "user_001",
    "totalWords": 1000,
    "learnedWords": 250,
    "masteredWords": 180,
    "currentStreak": 7,
    "longestStreak": 15,
    "totalStudyTime": 3600,
    "dailyGoal": 20,
    "weeklyStats": [
      {
        "date": "2024-12-01",
        "wordsLearned": 15,
        "studyTime": 300,
        "accuracy": 0.85
      }
    ],
    "achievements": [
      {
        "id": "first_week",
        "name": "坚持一周",
        "description": "连续学习7天",
        "unlockedAt": "2024-12-08T10:00:00Z"
      }
    ]
  }
}
```

### 更新学习进度

**POST** `/progress/update`

更新用户的学习进度。

#### 请求体

```json
{
  "userId": "user_001",
  "sessionData": {
    "wordsStudied": ["vocab_001", "vocab_002"],
    "correctAnswers": 8,
    "totalQuestions": 10,
    "studyTime": 300,
    "sessionType": "practice"
  }
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "updatedProgress": {
      "totalWords": 1000,
      "learnedWords": 252,
      "currentStreak": 8
    },
    "newAchievements": [
      {
        "id": "accuracy_master",
        "name": "准确率大师",
        "description": "单次练习准确率达到90%"
      }
    ]
  },
  "message": "进度更新成功"
}
```

## 练习测试 API

### 生成练习题目

**POST** `/practice/generate`

根据用户水平生成练习题目。

#### 请求体

```json
{
  "userId": "user_001",
  "questionType": "multiple_choice",
  "difficulty": "intermediate",
  "count": 10,
  "categories": ["defi", "blockchain"]
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "sessionId": "session_001",
    "questions": [
      {
        "id": "q_001",
        "type": "multiple_choice",
        "word": "DeFi",
        "question": "What does DeFi stand for?",
        "options": [
          "Decentralized Finance",
          "Digital Finance",
          "Distributed Finance",
          "Deferred Finance"
        ],
        "correctAnswer": 0,
        "audioUrl": "https://cdn.web3vocab.com/audio/defi.mp3"
      }
    ],
    "timeLimit": 600,
    "createdAt": "2024-12-08T10:00:00Z"
  }
}
```

### 提交练习答案

**POST** `/practice/submit`

提交练习答案并获取结果。

#### 请求体

```json
{
  "sessionId": "session_001",
  "answers": [
    {
      "questionId": "q_001",
      "answer": 0,
      "timeSpent": 15
    }
  ],
  "totalTime": 150
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "sessionId": "session_001",
    "score": 80,
    "correctAnswers": 8,
    "totalQuestions": 10,
    "results": [
      {
        "questionId": "q_001",
        "correct": true,
        "userAnswer": 0,
        "correctAnswer": 0,
        "explanation": "DeFi是Decentralized Finance的缩写"
      }
    ],
    "recommendations": [
      {
        "type": "review",
        "words": ["smart-contract", "liquidity"],
        "reason": "这些词汇需要加强练习"
      }
    ]
  }
}
```

## 音频服务 API

### 获取发音音频

**GET** `/audio/{wordId}`

获取指定词汇的发音音频文件。

#### 路径参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `wordId` | string | 是 | 词汇ID |

#### 查询参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `format` | string | 否 | 音频格式：`mp3`, `wav`, `ogg` |
| `quality` | string | 否 | 音质：`low`, `medium`, `high` |

#### 响应

返回音频文件的二进制数据，Content-Type为相应的音频MIME类型。

### 批量获取音频URL

**POST** `/audio/batch`

批量获取多个词汇的音频URL。

#### 请求体

```json
{
  "wordIds": ["vocab_001", "vocab_002", "vocab_003"],
  "format": "mp3",
  "quality": "medium"
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "audioUrls": {
      "vocab_001": "https://cdn.web3vocab.com/audio/defi.mp3",
      "vocab_002": "https://cdn.web3vocab.com/audio/blockchain.mp3",
      "vocab_003": "https://cdn.web3vocab.com/audio/smart-contract.mp3"
    },
    "expiresAt": "2024-12-08T11:00:00Z"
  }
}
```

## 错误代码

| 错误代码 | HTTP状态码 | 描述 |
|----------|------------|------|
| `INVALID_REQUEST` | 400 | 请求参数无效 |
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `FORBIDDEN` | 403 | 禁止访问 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `SERVICE_UNAVAILABLE` | 503 | 服务不可用 |

## 速率限制

- **词汇查询**: 100次/分钟
- **进度更新**: 50次/分钟
- **练习生成**: 20次/分钟
- **音频下载**: 200次/分钟

## SDK 和示例

### JavaScript SDK

```javascript
import { Web3VocabAPI } from '@web3vocab/sdk';

const api = new Web3VocabAPI({
  baseURL: 'https://api.web3vocab.com/v1',
  apiKey: 'your-api-key'
});

// 获取词汇列表
const vocabulary = await api.vocabulary.list({
  category: 'defi',
  limit: 20
});

// 更新学习进度
await api.progress.update({
  userId: 'user_001',
  sessionData: {
    wordsStudied: ['vocab_001'],
    correctAnswers: 1,
    totalQuestions: 1
  }
});
```

### cURL 示例

```bash
# 获取词汇列表
curl -X GET "https://api.web3vocab.com/v1/vocabulary?category=defi&limit=10" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json"

# 提交练习答案
curl -X POST "https://api.web3vocab.com/v1/practice/submit" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_001",
    "answers": [{"questionId": "q_001", "answer": 0}]
  }'
```

## 更新日志

### v1.0.0 (2024-12-08)
- 初始版本发布
- 支持词汇管理、进度追踪、练习测试
- 提供音频服务API

---

如有问题或建议，请联系技术支持：api-support@web3vocab.com