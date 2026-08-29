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

## 2024-05-24 - [Resilient AI Network Calls]
**Learning:** Simple timeouts for AI API calls lead to frustrating, silent failures due to frequent transient rate limits (HTTP 429) and server overloads (HTTP 5xx) typical with LLM providers.
**Action:** Always wrap `fetch` calls to AI APIs (like Gemini) with a `fetchWithRetry` utility using exponential backoff to handle 429 and 5xx errors gracefully, improving perceived reliability.
## 2024-05-24 - Add Timeout and Retry to AI Tester and Reviewer
**Learning:** Unguarded `fetch` calls to an AI API endpoints without retry or timeout configurations can cause the application to hang indefinitely if the API provider delays the response, limits the rate (429), or encounters transient server errors (500). Also `response.ok` must be checked before attempting to read `response.json()` to avoid silent failures caused by unhandled promises.
**Action:** Always wrap standard `fetch` API calls within AI-dependent functions with an exponential backoff wrapper (such as `executeWithRetry`) and provide it with an `AbortController` timeout logic.

## 2024-05-24 - [Robust AI JSON Extraction]
**Learning:** Using lazy regex matching (`/\[[\s\S]*?\]/`) to extract JSON arrays from AI responses is fragile. The regex will stop at the first closing bracket `]`, causing extraction to fail if the JSON array contains nested arrays. This leads to silent JSON parsing crashes.
**Action:** Extract JSON arrays using `indexOf('[')` and `lastIndexOf(']')` to ensure the entire JSON array, including any nested brackets, is captured before parsing.

## 2025-06-15 - [Failure Resilience: Propagating HTTP Status to Retry Wrappers]
**Learning:** When a fetch helper function (like `proxyFetch` for AI services) doesn't explicitly throw an error with a `status` property attached when `!response.ok`, any higher-level retry wrappers (like `executeWithRetry` using exponential backoff) will either falsely assume success or fail to classify the error as retryable (e.g., 429 Too Many Requests, 5xx Server Errors). This breaks the resilience of the AI integration against transient network issues.
**Action:** Always validate `!response.ok` within custom fetch helpers, and if true, extract the error details and throw an `Error` object that includes the HTTP `.status` property so that downstream retry wrappers can accurately classify and handle the failure.
## 2025-06-15 - [Failure Resilience: API Wrappers Must Throw on HTTP Errors]
**Learning:** Custom fetch helpers that act as API proxies (like `proxyFetch` for Vercel functions) must explicitly check `!response.ok` and `throw new Error`. If they silently return the failed Response object, wrapping them in an exponential backoff utility (like `executeWithRetry`) is useless because the wrapper assumes the promise resolved successfully and won't trigger its retry logic.
**Action:** Always validate `!response.ok` and throw a custom Error inside the innermost fetch wrapper so that outer retry mechanisms can correctly intercept and mitigate transient network/API failures.

## 2025-06-25 - [Preventing Action Conflicts & Enforcing Structured Contracts]
**Learning:** Overloading an AI endpoint action (e.g. `action: 'reviewCode'`) for both unstructured text responses (for UI chat) and structured JSON responses (for the technical code reviewer) leads to collisions. If the prompt does not strictly enforce the expected schema with explicit formatting constraints, the AI model will hallucinate structures or mix plain text with JSON, causing downstream parsing errors.
**Action:** Always use distinct API actions for distinct data expectations (e.g., `reviewCode` for plain text vs `analyzeCode` for structured JSON). Additionally, explicitly provide the required JSON schema in the prompt and sanitize the response text (e.g., removing markdown code blocks) before calling `JSON.parse`.
## 2025-06-25 - [Missing AI Action Handlers Cause 400 Bad Requests]
**Learning:** If an AI service (like `aiGameTester.ts`) attempts to call the proxy endpoint (`/api/gemini`) with an action (e.g., `testGame`) that is not explicitly handled in the proxy's switch or if-statement, it will result in a 400 Bad Request error. This error may trigger frontend retries and fail silently, breaking the feature.
**Action:** When adding or utilizing a new AI integration feature, ensure the corresponding action is fully implemented in the backend proxy API. The implementation must include prompt instructions, strictly enforce output formats (like specific JSON schemas), and validate and sanitize the AI response (e.g. stripping markdown artifacts) before returning it to the frontend.

## 2025-07-08 - [Silent Failures via Missing Structured AI Endpoints]
**Learning:** When adding AI features that require structured JSON (like `testGame`), if the specific action handler is completely omitted from the API proxy (e.g. `api/gemini.ts`), the proxy returns a 400 Bad Request. The client-side retry logic handles this as an error and silently falls back to local processing, masking the fact that the AI capability is totally broken.
**Action:** When implementing new structured AI features, ensure the backend API explicitly handles the new action, enforces the JSON schema within the prompt, and sanitizes the output (removing markdown) before applying `JSON.parse()` to prevent silent fallback failures.
