let queue: Promise<unknown> = Promise.resolve();

/** Serialize locker assignment so two agents cannot get the same locker. */
export function withLock<T>(fn: () => T | Promise<T>): Promise<T> {
  const run = queue.then(() => fn());
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}
