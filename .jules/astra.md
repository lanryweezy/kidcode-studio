
## 2024-05-24 - [Robust JSON Array Extraction from AI Responses]
**Learning:** Naive regex parsing (e.g. replacing ````json`) frequently fails to parse AI JSON responses if the AI output contains leading conversational preamble (e.g., "Here is the code you requested:\n```json\n[...]"). Also, lazy non-greedy regex matching (`/\[[\s\S]*?\]/`) can truncate nested JSON arrays at the first closing bracket.
**Action:** Always use `indexOf('[')` and `lastIndexOf(']')` (or `{` and `}`) to extract the bounds of the JSON block before running `JSON.parse()`.
## 2026-09-22 - [Graceful Handling of Model Refusals]
**Learning:** Deterministic AI model refusals (like SAFETY blocks) thrown as server errors (500) will cause client-side wrappers with exponential backoff to infinitely retry unrecoverable failures.
**Action:** Always map AI content refusals to 400 Bad Request instead of 500 Internal Server Error in proxy API handlers so clients fail fast and display appropriate UI feedback.
