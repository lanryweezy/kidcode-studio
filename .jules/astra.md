
## 2024-05-24 - [Robust JSON Array Extraction from AI Responses]
**Learning:** Naive regex parsing (e.g. replacing ````json`) frequently fails to parse AI JSON responses if the AI output contains leading conversational preamble (e.g., "Here is the code you requested:\n```json\n[...]"). Also, lazy non-greedy regex matching (`/\[[\s\S]*?\]/`) can truncate nested JSON arrays at the first closing bracket.
**Action:** Always use `indexOf('[')` and `lastIndexOf(']')` (or `{` and `}`) to extract the bounds of the JSON block before running `JSON.parse()`.

## 2026-09-16 - [Model Safety Blocks Retry Prevention]
**Learning:** In backend AI proxies (e.g., api/gemini.ts), deterministic model refusals (such as safety or content blocks) that Google Generative AI throws with messages like 'blocked due to SAFETY' were being caught and returned as a 500 Internal Server Error. This caused client-side fetch wrappers to falsely identify it as a transient error and infinitely retry unrecoverable errors.
**Action:** Detect safety/content blocks in the catch block of AI proxies and return a 400 Bad Request instead of 500 to prevent useless retries.
