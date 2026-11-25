const DEFAULT_AVATAR = {
  url: 'https://cdn.aurora-profiles.dev/avatars/default.png',
  initials: '?',
  source: 'fallback',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(error) {
  // TODO: retry transient errors only: AbortError, 429, 5xx, or network errors.
  // Never retry 4xx client errors other than 429.
   if (error.name === 'AbortError') {
    return true;
   }

  const status = error.status ?? error.statusCode;

  // Network errors have no HTTP status
  if (status === undefined || status === null) {
    return true;
  }

  // Retry 429 (Too Many Requests)
  if (status === 429) {
    return true;
  }

  // Retry server errors (500-599)
  if (status >= 500 && status <= 599) {
    return true;
  }

  // Never retry ordinary 4xx errors
  return false;
}

async function withTimeout(operation, timeoutMs) {
  // TODO: create AbortController, abort after timeoutMs,
  // call operation(controller.signal), always clear timer in finally.
  const controller = new AbortController();

  let timer;

  try {
    return await Promise.race([
      operation(controller.signal),

      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();

          const error = new Error('Request timed out');
          error.name = 'AbortError';

          reject(error);
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry(operation, options = {}) {
  // TODO: maxAttempts defaults to 3.
  // Run operation, retry only isRetryable errors.
  // Between attempts await sleep(baseDelayMs * 2 ** attempt).
  // Throw final error after max attempts or non-retryable error.
   const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 25;

  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryable(error)) {
        throw error;
      }

      if (attempt === maxAttempts - 1) {
        throw lastError;
      }

      await sleep(baseDelayMs * 2 ** attempt);
    }
  }

  throw lastError;
}

async function getProfileWithAvatar(authorId, avatarClient, options = {}) {
  const timeoutMs = options.timeoutMs || 200;
  const maxAttempts = options.maxAttempts || 3;
  const baseDelayMs = options.baseDelayMs || 25;

  try {
    // TODO: compose retry around timeout around avatarClient.getAvatar.
    // Return { authorId, avatar, degraded: false } on success.
    const avatar = await withRetry(
      () =>
        withTimeout(
          signal => avatarClient.getAvatar(authorId, { signal }),
          timeoutMs
        ),
      {
        maxAttempts,
        baseDelayMs,
      }
    );

    return {
      authorId,
      avatar,
      degraded: false,
    };
  } catch (error) {
    // TODO: return { authorId, avatar: DEFAULT_AVATAR, degraded: true }.
    // Keep fallback local; do not throw for avatar failure.
    return {
      authorId,
      avatar: DEFAULT_AVATAR,
      degraded: true,
    };
  }
}

module.exports = {
  DEFAULT_AVATAR,
  sleep,
  isRetryable,
  withTimeout,
  withRetry,
  getProfileWithAvatar,
};
