# Backend API Documentation for Frontend

## Overview
This document describes the complete flow for implementing the coding duel game. Follow these steps to avoid confusion.

## Base Setup
```bash
# Set your base URL (adjust port if needed)
BASE_URL="http://localhost:8000"
```

## 1. Authentication Flow

### Login Endpoint
**POST** `/api/login/`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "player1",
  "password": "password123"
}
```

**Available Credentials:**
- `admin` / `admin123`
- `user` / `user123`  
- `player1` / `password123`
- `player2` / `password123`

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "username": "player1"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

**cURL Example:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username": "player1", "password": "password123"}' \
  "$BASE_URL/api/login/"
```

**IMPORTANT:** Save the `token` value - you'll need it for ALL subsequent requests!

---

## 2. Matchmaking Flow

### Join Matchmaking Queue
**POST** `/api/matchmaking/`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:** `{}` (empty JSON object)

**Possible Responses:**

**Still Waiting (202):**
```json
{
  "status": "waiting_for_opponent"
}
```

**Match Found (201):**
```json
{
  "id": 1,
  "problem": {
    "id": 1,
    "title": "Longest Common Prefix",
    "description": "Write a function to find the longest common prefix...",
    "difficulty": "easy",
    "time_limit": 30,
    "signature": "char* longestCommonPrefix(char** strs, int strsSize);"
  },
  "player1": "player1",
  "player2": "player2",
  "status": "active",
  "winner": null,
  "created_at": "2025-06-19T09:21:30.123456Z",
  "updated_at": "2025-06-19T09:21:30.123456Z"
}
```

**Already in Active Duel (200):**
```json
{
  "id": 1,
  "problem": { ... },
  "player1": "player1",
  "player2": "player2", 
  "status": "active",
  "winner": null,
  "created_at": "2025-06-19T09:21:30.123456Z",
  "updated_at": "2025-06-19T09:21:30.123456Z"
}
```

**cURL Example:**
```bash
# Replace YOUR_TOKEN_HERE with actual token
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "$BASE_URL/api/matchmaking/"
```


---

## 3. Duel Management

### Get Duel Details (with Long Polling)
**GET** `/api/duels/{duel_id}/`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**
```json
{
  "id": 1,
  "problem": {
    "id": 1,
    "title": "Longest Common Prefix",
    "description": "Write a function to find the longest common prefix string amongst an array of strings.",
    "difficulty": "easy",
    "time_limit": 30,
    "signature": "char* longestCommonPrefix(char** strs, int strsSize);"
  },
  "player1": "player1",
  "player2": "player2",
  "status": "active",
  "winner": null,
  "created_at": "2025-06-19T09:21:30.123456Z",
  "updated_at": "2025-06-19T09:21:30.123456Z"
}
```

**cURL Example:**
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  "$BASE_URL/api/duels/1/"
```

**IMPORTANT:** This endpoint uses **long polling** - it will wait up to 30 seconds for changes before responding. Use this to get real-time updates when opponents submit code.

---

## 4. Code Submission

### Submit Code
**POST** `/api/duels/{duel_id}/submit/`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "    if (strsSize == 0) {\n        char* result = malloc(1);\n        result[0] = '\\0';\n        return result;\n    }\n    // ... rest of function body"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "All tests passed!",
  "execution_time": 0.001,
  "test_results": [
    {"input": "[\"flower\",\"flow\",\"flight\"]", "expected": "\"fl\"", "actual": "\"fl\"", "passed": true},
    {"input": "[\"dog\",\"racecar\",\"car\"]", "expected": "\"\"", "actual": "\"\"", "passed": true}
  ]
}
```

**Failure Response (200):**
```json
{
  "status": "failure", 
  "message": "Test case failed",
  "execution_time": 0.002,
  "test_results": [
    {"input": "[\"flower\",\"flow\",\"flight\"]", "expected": "\"fl\"", "actual": "\"flow\"", "passed": false}
  ]
}
```

**Error Responses:**
- **400:** `{"error": "This duel is not active."}`
- **403:** `{"error": "You are not a participant in this duel."}`
- **400:** `{"error": "No code provided."}`

**cURL Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"code": "    if (strsSize == 0) {\n        char* result = malloc(1);\n        result[0] = '\''\\0'\'';\n        return result;\n    }\n    \n    if (strsSize == 1) {\n        char* result = malloc(strlen(strs[0]) + 1);\n        strcpy(result, strs[0]);\n        return result;\n    }\n    \n    int minLen = strlen(strs[0]);\n    for (int i = 1; i < strsSize; i++) {\n        int len = strlen(strs[i]);\n        if (len < minLen) minLen = len;\n    }\n    \n    for (int i = 0; i < minLen; i++) {\n        char c = strs[0][i];\n        for (int j = 1; j < strsSize; j++) {\n            if (strs[j][i] != c) {\n                char* result = malloc(i + 1);\n                if (i > 0) strncpy(result, strs[0], i);\n                result[i] = '\''\\0'\'';\n                return result;\n            }\n        }\n    }\n    \n    char* result = malloc(minLen + 1);\n    strncpy(result, strs[0], minLen);\n    result[minLen] = '\''\\0'\'';\n    return result;"}' \
  "$BASE_URL/api/duels/1/submit/"
```

**CODE FORMAT:** Only submit the **function body** (the code inside the curly braces). Do NOT include:
- Function signature
- `#include` statements  
- The opening/closing braces

---

## 5. Complete Flow Implementation

### JavaScript Example:
```javascript
class DuelGame {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = null;
    this.currentDuel = null;
  }

  async login(username, password) {
    const response = await fetch(`${this.baseUrl}/api/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (response.ok) {
      this.token = data.token;
      return data;
    }
    throw new Error(data.error);
  }

  async findMatch() {
    while (true) {
      const response = await fetch(`${this.baseUrl}/api/matchmaking/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (response.status === 201 || response.status === 200) {
        this.currentDuel = data;
        return data;
      }
      
      // Wait 2 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async submitCode(code) {
    const response = await fetch(`${this.baseUrl}/api/duels/${this.currentDuel.id}/submit/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });
    
    return await response.json();
  }

  async pollDuelStatus() {
    const response = await fetch(`${this.baseUrl}/api/duels/${this.currentDuel.id}/`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    const data = await response.json();
    this.currentDuel = data;
    return data;
  }
}

// Usage:
const game = new DuelGame('http://localhost:8000');

// 1. Login
await game.login('player1', 'password123');

// 2. Find match
const duel = await game.findMatch();
console.log('Match found!', duel);

// 3. Submit code
const result = await game.submitCode('    return "hello";');
console.log('Submission result:', result);

// 4. Check if game is won
const updatedDuel = await game.pollDuelStatus();
if (updatedDuel.winner) {
  console.log('Game over! Winner:', updatedDuel.winner);
}
```

## 6. Game States

**Duel Status Values:**
- `"active"` - Game in progress
- `"completed"` - Game finished (check `winner` field)

**Submission Result Status:**
- `"success"` - All tests passed (you win!)
- `"failure"` - Tests failed
- `"error"` - Compilation/runtime error
- `"timeout"` - Code took too long to execute

## 7. Error Handling

**Authentication Errors:**
- **401:** Token expired or invalid - need to login again
- **403:** Not authorized for this duel

**Common HTTP Status Codes:**
- **200:** Success
- **201:** Created (match found)
- **202:** Accepted (still waiting)
- **400:** Bad request (missing data)
- **401:** Unauthorized (bad/missing token)
- **403:** Forbidden (not your duel)
- **404:** Not found (invalid duel ID)

**Always check response status before processing data!**

---

## Bonus
## User Match History

Get match statistics and recent game history for any user by username. No authentication required.

### Endpoint
```
GET /api/users/{username}/history/
```

### Usage
```bash
# Get match history for a specific user
curl -s "$BASE_URL/api/users/player1/history/" | jq .
```

### Response Format
```json
{
  "username": "player1",
  "statistics": {
    "total_games": 12,
    "wins": 8,
    "losses": 4,
    "win_rate": 66.7
  },
  "recent_matches": [
    {
      "duel_id": 15,
      "problem_title": "Longest Common Prefix",
      "problem_difficulty": "Easy",
      "opponent": "player2",
      "result": "win",
      "completed_at": "2025-06-19T09:30:15.123456Z"
    }
  ]
}
```

### Features
- Returns last 5 completed matches
- Calculates total win/loss statistics and win rate
- Shows problem details and opponent for each match
- Public endpoint (no authentication required)
- Returns 404 for non-existent users