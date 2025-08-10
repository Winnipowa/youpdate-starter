export function cn(...cls: Array<string | number | false | null | undefined>): string {
  return cls.filter(Boolean).join(" ");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
