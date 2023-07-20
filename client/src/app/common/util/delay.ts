export function delay(delayMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, delayMs))
}
