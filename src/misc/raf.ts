export interface StartRafLoopConfig {
  signal?: AbortSignal;
  onError?: (error: unknown) => void;
}
export function startRafLoop(
  fn: () => void,
  config?: StartRafLoopConfig,
): () => void {
  const { signal, onError } = config ?? {};
  if (signal?.aborted) return () => {};
  let id: number | undefined;
  const stop = () => {
    if (id != null) cancelAnimationFrame(id);
    id = undefined;
  };
  function loop() {
    if (signal?.aborted) return;
    try {
      fn();
    } catch (error) {
      onError?.(error);
    } finally {
      if (signal?.aborted) return;
      id = requestAnimationFrame(loop);
    }
  }
  signal?.addEventListener("abort", stop, { once: true });
  id = requestAnimationFrame(loop);
  return stop;
}
