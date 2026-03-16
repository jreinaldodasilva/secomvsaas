// Planned: request/response interceptors for cross-cutting concerns
// (e.g. auth header injection, response normalisation, error logging).
// Current approach: token refresh and error handling are implemented
// directly in src/services/http.ts. Extract here when the logic grows
// beyond a single concern.
