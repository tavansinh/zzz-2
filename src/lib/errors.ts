const toErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const obj = err as {
      message?: unknown;
      msg?: unknown;
      error_description?: unknown;
    };
    const candidate = obj.message ?? obj.msg ?? obj.error_description;
    if (typeof candidate === 'string' && candidate.length > 0) return candidate;
  }
  return String(err);
};

const toError = (err: unknown): Error => new Error(toErrorMessage(err));

export { toError, toErrorMessage };
