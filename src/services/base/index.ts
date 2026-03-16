// Planned: base service class or factory for domain API services.
// Current approach: domain hooks (e.g. usePressRelease, useEvent) call
// http.get/post/patch/delete directly via useApiQuery / useApiMutation.
// If a shared base abstraction is needed in the future, implement it here.
