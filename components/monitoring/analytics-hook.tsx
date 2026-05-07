export function AnalyticsHook() {
  // Keep analytics server-only until a real provider is configured so the root layout
  // does not ship extra client JavaScript to every route.
  return null;
}
