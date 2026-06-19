export function normalizeProfile<T extends { profiles: any }>(row: T) {
  return {
    ...row,
    profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
  };
}