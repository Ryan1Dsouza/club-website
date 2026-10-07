import portraits from './team-portraits.json';
import type { Member } from '../types';
import { sortTeamMembers } from './team-members';

export type SocialPlatform = 'linkedin' | 'github' | 'leetcode' | 'instagram' | 'website';
export type TeamSocial = { platform: SocialPlatform; label: string; url: string };
export type TeamProfile = Omit<Member, 'tagline' | 'socials'> & {
  cardImage?: string;
  profileImage?: string;
  previewImage?: string;
  tagline: string;
  socials: TeamSocial[];
};
type PortraitMetadata = {
  small: string;
  large: string;
  preview?: string;
  tagline?: string;
  socials?: Partial<Record<SocialPlatform, string>>;
};
const labels: Record<SocialPlatform, string> = {
  linkedin: 'LinkedIn', github: 'GitHub', leetcode: 'LeetCode', instagram: 'Instagram', website: 'Website',
};

export function createTeamProfiles(members: Member[]): TeamProfile[] {
  return sortTeamMembers(members).map(member => {
    const metadata = (portraits as Record<string, PortraitMetadata>)[member.image ?? ''];
    const socials: TeamSocial[] = [];
    for (const platform of Object.keys(labels) as SocialPlatform[]) {
      const value = member.socials?.[platform] ?? metadata?.socials?.[platform];
      if (!value) continue;
      if (value === '#') { socials.push({ platform, label: labels[platform], url: '#' }); continue; }
      try {
        const url = new URL(value);
        if (url.protocol === 'https:') socials.push({ platform, label: labels[platform], url: url.href });
      } catch { /* A missing or invalid profile must not create a broken link. */ }
    }
    return {
      ...member,
      cardImage: metadata?.small ?? member.image,
      profileImage: metadata?.large ?? member.image,
      previewImage: metadata?.preview,
      tagline: member.tagline?.trim() || metadata?.tagline?.trim() || 'turning coffee into algorithms',
      socials: socials.length ? socials : (['linkedin', 'github', 'leetcode'] as const).map(platform => ({ platform, label: labels[platform], url: '#' })),
    };
  });
}
