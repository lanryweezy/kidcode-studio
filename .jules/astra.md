
## 2024-05-24 - [Robust JSON Array Extraction from AI Responses]
**Learning:** Naive regex parsing (e.g. replacing ````json`) frequently fails to parse AI JSON responses if the AI output contains leading conversational preamble (e.g., "Here is the code you requested:\n```json\n[...]"). Also, lazy non-greedy regex matching (`/\[[\s\S]*?\]/`) can truncate nested JSON arrays at the first closing bracket.
**Action:** Always use `indexOf('[')` and `lastIndexOf(']')` (or `{` and `}`) to extract the bounds of the JSON block before running `JSON.parse()`.

## $(date +%Y-%m-%d) - Prevent Infinite Retries on Model Refusals
**Learning:** Deterministic AI model refusals (such as safety or content blocks) often return as standard errors. If these are handled as generic 500 Internal Server Errors in backend proxies (like `api/gemini.ts`), downstream client retry mechanisms (e.g., exponential backoff) will endlessly retry an unrecoverable request, wasting resources and causing UI hangs.
**Action:** Catch specific refusal indicators (e.g., `error.message.includes('SAFETY')`) in backend proxies and return them with a `400 Bad Request` status to explicitly signal to frontend wrappers that the request should not be retried.
