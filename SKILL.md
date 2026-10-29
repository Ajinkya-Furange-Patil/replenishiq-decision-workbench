---
name: infinisynapse-vibe-coding
description: Run multi-turn AI data-analysis tasks via the InfiniSynapse CLI (agent_infini) or the Server HTTP API, manage data sources and RAG knowledge bases, read task workspace artifacts, and integrate InfiniSynapse into your own application as a long-task Agent layer. Use when the user mentions InfiniSynapse, agent_infini, the Vibe Coding contest, or wants to build apps on InfiniSynapse.
---

# InfiniSynapse Vibe Coding Skill & Reference

`agent_infini` is the official CLI tool that communicates with the InfiniSynapse backend REST API to run multi-turn AI tasks, manage data sources, manage RAG knowledge bases, and handle task workspace files.

Binary location on Windows: `%USERPROFILE%\.infini\bin\agent_infini.exe`.

## Credentials & Config
Credentials are saved in `~/.agent_infini/config.txt`:
```yaml
global:
  server: "https://app.infinisynapse.com"
  api-key: "YOUR_INFINISYNAPSE_API_KEY"
  console: "https://api.infinisynapse.com/api"
  prefer-language: "en"
  default-output: "json"
```

## Recommended CLI Workflow
1. Initialize: `agent_infini init --api-key "sk-..."`
2. Inspect Databases: `agent_infini db ls`
3. Enable Database: `agent_infini db enable <id>`
4. Verify Context: `agent_infini task context`
5. Create Task: `agent_infini task new "Analyze inventory stockout risks"`
6. Follow-up: `agent_infini task ask <taskId> "Generate purchase order summary"`
7. Manage Workspace Files:
   - List files: `agent_infini task file <taskId>`
   - Preview file: `agent_infini task preview <taskId> <filename>`
   - Download file: `agent_infini task download <taskId> <filename> -o ./results`

## InfiniSynapse Server HTTP API Reference
The InfiniSynapse Server API provides real-time SSE streaming for long-running AI data analysis:

### 1. Open Event Stream
```http
GET /api/ai/events?connId=<uuid>
Authorization: Bearer <API_KEY>
```

### 2. Dispatch Task Message
```http
POST /api/ai/message
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "type": "newTask",
  "connId": "<uuid>",
  "text": "Analyze stockouts and generate purchase orders...",
  "chatSettings": {
    "mode": "act"
  }
}
```

### 3. Events Received via SSE
- `message.partial`: Real-time streaming chunks and tokens
- `message.ask`: When the agent requests clarifications or tool executions
- `message.say` / `completion_result`: Final synthesized recommendation
