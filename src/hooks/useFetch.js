import { useCallback, useEffect, useState } from "react";

/**
 * Runs `load` (a stable function returning a promise) on mount.
 * Returns { status: "loading" | "success" | "error", data, error, retry }.
 * While retrying, `error` keeps the previous failure so the UI can stay in place.
 * In dev, data refreshes in place when a file in server/data is saved (see vite.config.js).
 */
export function useFetch(load) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    let ignore = false;
    setState((s) => ({ ...s, status: "loading" }));
    load().then(
      (data) => !ignore && setState({ status: "success", data, error: null }),
      (error) => !ignore && setState({ status: "error", data: null, error }),
    );
    return () => {
      ignore = true;
    };
  }, [load, attempt]);

  // Dev only: refetch quietly (no skeleton) when a data file changes.
  // A broken file still shows the error state, so typos are easy to spot.
  useEffect(() => {
    if (!import.meta.hot) return;
    let ignore = false;
    const refresh = () =>
      load().then(
        (data) => !ignore && setState({ status: "success", data, error: null }),
        (error) => !ignore && setState({ status: "error", data: null, error }),
      );
    import.meta.hot.on("api-data-changed", refresh);
    return () => {
      ignore = true;
      import.meta.hot.off("api-data-changed", refresh);
    };
  }, [load]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
