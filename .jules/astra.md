## 2025-02-14 - [Silent Crash on AI JSON Parsing]
**Learning:** [Raw `JSON.parse` on model outputs can cause silent downstream crashes. AI models may return valid JSON that does not conform to the expected schema (e.g. returning an array of strings instead of an array of objects). The UI would attempt to render these invalid blocks causing silent crashes]
**Action:** [Always wrap AI JSON parsing with a validation step to ensure the parsed structure matches the required schema. Ensure objects contain the expected required keys (like `type` in `CommandBlock`) and fallback gracefully when validation fails.]

## 2026-06-10 - [Missing Context in Secondary Actions & Uncaught API Errors]
**Learning:** AI quality degrades when secondary features (like "review" or "fix") omit the domain-specific system prompt (DSL) provided to the primary feature. This leads to hallucinated structures. Additionally, directly extracting `data.text` or similar from a `fetch` response without `!response.ok` validation masks underlying network/API errors (e.g. rate limits), passing `undefined` into the system and creating silent downstream crashes or misleading fallbacks.
**Action:** Always inject the primary domain `SYSTEM_PROMPT` into all related AI actions using the model. Always wrap AI `fetch` response JSON parsing with an explicit `if (!response.ok) throw new Error(...)` check to trigger intended error handling and graceful UI fallbacks.
## 2025-05-18 - Missing context in secondary AI tasks & missing response validation

**Learning:** Secondary AI generation tasks (like reviewing or fixing code blocks) can hallucinate invalid outputs if they do not include the same foundational `systemInstruction` context as the primary generation tasks. Also, `fetch` calls without `!response.ok` checks silently crash downstream when `JSON.parse` encounters unexpected network error responses (like 500 or 504 errors).

**Action:** Always inject `systemInstruction: SYSTEM_PROMPT` into the `getGenerativeModel` config for *all* AI operations that need context on domain-specific boundaries (e.g., KidCode blocks). Always wrap `await response.json()` calls in an explicit HTTP response validation block (`if (!response.ok) throw new Error(...)`) to prevent unhandled parse exceptions.

## 2025-06-13 - [Resilience to API Timeouts]
**Learning:** Unguarded fetch calls to AI endpoints can hang indefinitely if the API or network stalls, leading to a blocked or unresponsive UI. The native `fetch` API doesn't have a built-in timeout mechanism.
**Action:** Always wrap `fetch` calls with an `AbortController`-based timeout mechanism to ensure the application fails fast and can trigger graceful error states or fallbacks instead of hanging forever.

## 2025-06-14 - [Failure Resilience: Validating AI Proxy Status]
**Learning:** Unguarded response parsing like `await response.json()` inside an AI polling loop will silently crash if the AI proxy returns an unexpected status code (e.g. 500, 502 HTML error pages). The application's fallback and error-handling logic won't trigger.
**Action:** Always insert a `!response.ok` check before reading `.json()` in fetch-based API calls, throwing a custom `Error` to ensure the application's native retry and fallback mechanisms activate.
