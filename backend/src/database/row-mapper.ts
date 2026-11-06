function toCamelCase(value: string): string {
  return value.replace(/_([a-z0-9])/g, (_, letra: string) =>
    letra.toUpperCase(),
  );
}

export function mapRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map(
    (row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [toCamelCase(key), value]),
      ) as T,
  );
}
