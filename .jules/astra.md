
## 2024-05-24 - [Robust JSON Array Extraction from AI Responses]
**Learning:** Naive regex parsing (e.g. replacing ````json`) frequently fails to parse AI JSON responses if the AI output contains leading conversational preamble (e.g., "Here is the code you requested:\n```json\n[...]"). Also, lazy non-greedy regex matching (`/\[[\s\S]*?\]/`) can truncate nested JSON arrays at the first closing bracket.
**Action:** Always use `indexOf('[')` and `lastIndexOf(']')` (or `{` and `}`) to extract the bounds of the JSON block before running `JSON.parse()`.

## 2024-05-24 - [Robust API Error Handling & Exponential Backoff for AI Integrations]
**Learning:** `fetchWithRetry` and AI API wrapper logic must explicitly throw an error mapping to `!response.ok` with the HTTP status attached (e.g., `error.status = response.status`). If they fail to do so or swallow the error locally, centralized retry mechanisms (`executeWithRetry`) fail to apply exponential backoff properly for transient 429/5xx errors or correctly abort on 4xx failures.
**Action:** Always wrap API fetching mechanisms using a centralized runner (like `executeWithRetry`) with a specific abort controller, explicitly checking for `!response.ok` and appending `error.status` before throwing the error.
