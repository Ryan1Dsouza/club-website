const ROLE_RANK: Record<string, number> = {
  president: 0, 'vice president': 1, vp: 1, secretary: 2, treasurer: 3,
  'plan & strategy lead': 4, 'technical lead': 5, 'tech lead': 5,
  'ai & ml lead': 6, 'development lead': 7, 'dsa lead': 8,
  'event lead': 9, 'media lead': 10, 'discipline head': 11,
};

/** Keep established officers first, followed by dated additions in API order. */
export function sortTeamMembers<T extends { role: string; createdAt?: string }>(members: readonly T[]): T[] {
  const created = (member: T) => Date.parse(member.createdAt ?? '') || 0;
  const rank = (role: string) => {
    const key = role.trim().toLowerCase();
    return ROLE_RANK[key] ?? (/lead|head/.test(key) ? 50 : 100);
  };
  return [...members].sort((a, b) => rank(a.role) - rank(b.role) || created(a) - created(b));
}
