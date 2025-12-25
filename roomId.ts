// Deterministic room id for two users
export function deterministicRoomId(uidA: string, uidB: string) {
  if (!uidA || !uidB) throw new Error('uids required');
  return [uidA, uidB].sort().join('::'); // stable and deterministic
}