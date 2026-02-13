import { useEffect, useState } from "react";

/**
 * Safe JSON parse helper.
 * Returns fallback if parsing fails.
 */
function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// PUBLIC_INTERFACE
export function useLocalStorageState(key, initialValue) {
  /**
   * React hook that mirrors state into localStorage.
   * - Initializes from localStorage if present
   * - Persists on change
   *
   * @param {string} key localStorage key
   * @param {*} initialValue initial state value if localStorage is empty
   * @returns {[any, Function]} state tuple like useState
   */
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    const existing = window.localStorage.getItem(key);
    if (existing === null) return initialValue;
    return safeJsonParse(existing, initialValue);
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
