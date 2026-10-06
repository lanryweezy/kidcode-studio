
## 2024-05-24 - [Robust JSON Array Extraction from AI Responses]
**Learning:** Naive regex parsing (e.g. replacing ````json`) frequently fails to parse AI JSON responses if the AI output contains leading conversational preamble (e.g., "Here is the code you requested:\n```json\n[...]"). Also, lazy non-greedy regex matching (`/\[[\s\S]*?\]/`) can truncate nested JSON arrays at the first closing bracket.
**Action:** Always use `indexOf('[')` and `lastIndexOf(']')` (or `{` and `}`) to extract the bounds of the JSON block before running `JSON.parse()`.

## 2024-05-17 - Prevent Infinite Retries on Deterministic AI Refusals
**Learning:** In backend AI proxies (e.g., `api/gemini.ts`), deterministic model refusals (such as safety or content blocks) must be caught and returned as a 400 Bad Request instead of a 500 Internal Server Error. This prevents client-side fetch wrappers from uselessly and infinitely retrying unrecoverable errors. Identify these refusals by checking if `error.message` includes 'SAFETY' or 'content was blocked'.
**Action:** Always parse AI provider error messages in proxy endpoints. If a deterministic block is identified, explicitly set `response.status` to 400 so exponential backoff logic is bypassed.

## 2024-09-26 - Unhandled Promise Rejections in AI Streams
**Learning:** In async generation streams (like `model.generateContentStream`), transient errors (e.g., network drops, mid-stream safety blockages) within the `for await` loop can cause unhandled promise rejections. This bypasses the outer request-level try/catch, resulting in the backend stream hanging open indefinitely without closing the client controller.
**Action:** Always wrap `for await` iteration blocks inside stream controllers with a local `try/catch/finally` block. Log the error in the `catch` and optionally enqueue a friendly fallback message. Critically, ensure `controller.close()` is always called in the `finally` block to guarantee the stream resolves and prevents the client UI from hanging.

## 2026-09-27 - [Enforce Fetch Timeouts in Service Proxies]
**Learning:** Unprotected `fetch` calls inside proxy wrappers (like `proxyFetch` in `ai3DService.ts`) can hang indefinitely if the network drops or the server doesn't respond. This permanently locks up the client UI because it bypasses the timeout logic in the outer retry wrapper (e.g., `executeWithRetry`), which only checks the timeout *between* retry attempts, not during the fetch execution itself.
**Action:** Always inject an `AbortController` with a definitive timeout (e.g., 60 seconds) into raw `fetch` calls inside backend proxies, and ensure the timeout is cleared in a `finally` block.
## 2026-10-02 - [Enforce Fetch Timeouts in Service Proxies]
**Learning:** Unprotected `fetch` calls inside proxy wrappers (like `proxyFetch` in `ai3DService.ts`) can hang indefinitely if the network drops or the server doesn't respond. This permanently locks up the client UI because it bypasses the timeout logic in the outer retry wrapper (e.g., `executeWithRetry`), which only checks the timeout *between* retry attempts, not during the fetch execution itself.
**Action:** Always inject an `AbortController` with a definitive timeout (e.g., 60 seconds) into raw `fetch` calls inside backend proxies, and ensure the timeout is cleared in a `finally` block.

## 2024-10-25 - [Enforce Stream Read Timeouts in AI Services]
**Learning:** In streaming scenarios (e.g. `reader.read()` after a successful fetch), outer request timeouts like `fetchWithTimeout` only cover the initial header response. If the network drops or the AI provider hangs mid-stream, `reader.read()` can block indefinitely and lock up the client UI because it is not bound by the initial fetch's abort signal timeout.
**Action:** Always wrap `reader.read()` calls in a `Promise.race` against a local timeout (e.g. 15-20 seconds) and ensure `clearTimeout` is called in a `finally` block to prevent lingering timers.
