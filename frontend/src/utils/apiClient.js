import axios from "axios";

const BACKEND_URL = "https://fraudshield-xgpy.onrender.com";
const LOCAL_BACKEND = "http://localhost:5000";
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds
const TIMEOUT = 30000; // 30 seconds

// Determine backend URL
const getBackendURL = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return LOCAL_BACKEND;
  }
  return BACKEND_URL;
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: getBackendURL(),
  timeout: TIMEOUT,
});

/**
 * Retry wrapper for API calls
 * Automatically retries 3 times with 5 second delays
 */
export const apiCallWithRetry = async (
  fn,
  attempt = 1,
  onRetry = null
) => {
  try {
    return await fn();
  } catch (error) {
    if (attempt < RETRY_ATTEMPTS) {
      // Call the onRetry callback if provided
      if (onRetry) {
        onRetry({
          attempt,
          maxAttempts: RETRY_ATTEMPTS,
          nextRetryIn: RETRY_DELAY
        });
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

      // Recursive retry
      return apiCallWithRetry(fn, attempt + 1, onRetry);
    } else {
      // All retries exhausted
      throw new Error(
        "Connecting to servers... This may take up to 30 seconds on first load. Please wait."
      );
    }
  }
};

/**
 * Wrapped GET request with retry logic
 */
export const get = async (url, config = {}, onRetry = null) => {
  return apiCallWithRetry(
    () => axiosInstance.get(url, config),
    1,
    onRetry
  );
};

/**
 * Wrapped POST request with retry logic
 */
export const post = async (url, data = {}, config = {}, onRetry = null) => {
  return apiCallWithRetry(
    () => axiosInstance.post(url, data, config),
    1,
    onRetry
  );
};

/**
 * Wrapped PUT request with retry logic
 */
export const put = async (url, data = {}, config = {}, onRetry = null) => {
  return apiCallWithRetry(
    () => axiosInstance.put(url, data, config),
    1,
    onRetry
  );
};

/**
 * Wrapped DELETE request with retry logic
 */
export const del = async (url, config = {}, onRetry = null) => {
  return apiCallWithRetry(
    () => axiosInstance.delete(url, config),
    1,
    onRetry
  );
};

/**
 * Keep-alive ping to prevent backend from sleeping
 * Should be called every 14 minutes
 * This function is NON-BLOCKING and fails silently - never awaited
 */
export const keepAlive = () => {
  // Fire-and-forget - never block the app, no await
  axiosInstance
    .get("/", { timeout: 8000 })
    .then(() => {
      console.log("[KeepAlive] Backend pinged successfully");
    })
    .catch(() => {
      // Silently fail - this is just a background maintenance ping
    });
};

export default axiosInstance;
