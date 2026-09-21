
## 2024-05-24 - [Robust JSON Array Extraction from AI Responses]
**Learning:** Naive regex parsing (e.g. replacing ````json`) frequently fails to parse AI JSON responses if the AI output contains leading conversational preamble (e.g., "Here is the code you requested:\n```json\n[...]"). Also, lazy non-greedy regex matching (`/\[[\s\S]*?\]/`) can truncate nested JSON arrays at the first closing bracket.
**Action:** Always use `indexOf('[')` and `lastIndexOf(']')` (or `{` and `}`) to extract the bounds of the JSON block before running `JSON.parse()`.

## 2024-05-24 - [Deterministic Model Refusals (Safety/Blocked Content)]
**Learning:** Returning a 500 Internal Server Error from backend AI proxies for deterministic AI safety or content blocks causes client-side retry wrappers to uselessly enter exponential backoff loops, wasting resources on unrecoverable requests.
**Action:** Catch safety and content block errors specifically (e.g., checking if `error.message` includes 'SAFETY' or 'content was blocked') in the backend proxy and return them as a 400 Bad Request to prevent infinite client-side retries.
