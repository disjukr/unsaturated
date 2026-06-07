export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitSingleTick(): Promise<void> {
  return wait(0);
}

export function waitIndefinitely<T = void>(): Promise<T> {
  return new Promise<T>(() => void 0);
}
