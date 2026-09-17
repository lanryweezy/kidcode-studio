
## 2024-05-24 - [Robust JSON Array Extraction from AI Responses]
**Learning:** Naive regex parsing (e.g. replacing ````json`) frequently fails to parse AI JSON responses if the AI output contains leading conversational preamble (e.g., "Here is the code you requested:\n```json\n[...]"). Also, lazy non-greedy regex matching (`/\[[\s\S]*?\]/`) can truncate nested JSON arrays at the first closing bracket.
**Action:** Always use `indexOf('[')` and `lastIndexOf(']')` (or `{` and `}`) to extract the bounds of the JSON block before running `JSON.parse()`.

## 2026-09-17 - [Graceful Handling of Model Refusals]
**Learning:** Deterministic AI model refusals (such as content safety blocks or 'candidate was blocked' errors) should not be returned as 500 Internal Server Errors from backend proxies. Doing so causes client-side retry wrappers (like `executeWithRetry`) to indefinitely and uselessly retry unrecoverable errors.
**Action:** Always intercept safety blocks and deterministic refusals in backend proxies and return them as a 400 Bad Request to immediately halt client-side retry loops.
