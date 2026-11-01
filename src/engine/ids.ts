let n = 1;

export function nid(prefix: string): string {
  n += 1;
  return `${prefix}_${n}`;
}

export function resetIds(): void {
  n = 1;
}
