import type { Member } from '../types';
import { core_team_info } from '../../scripts/team_bio/core/core.mjs';
// @ts-expect-error Team biographies are maintained as plain JavaScript data.
import { members_info } from '../../scripts/team_bio/members/members.mjs';
// @ts-expect-error Team biographies are maintained as plain JavaScript data.
import { alumni_info } from '../../scripts/team_bio/alumni/alumni.mjs';

type Biography = Omit<Member, 'id' | 'initials'> & Partial<Pick<Member, 'id' | 'initials'>>;

function fromBiographies(biographies: Biography[], folder: string): Member[] {
  return biographies.map(bio => ({
    ...bio,
    id: bio.id || bio.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    initials: bio.initials || bio.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2),
    image: bio.image && !bio.image.startsWith('/') && !/^https?:\/\//.test(bio.image)
      ? `/team_images/${folder}/${bio.image}` : bio.image,
  }));
}

export function enrichTowerMembers(members: Member[]): Member[] {
  const core = core_team_info as Biography[];
  const nameKey = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');
  const coreMap = new Map(core.map(member => [nameKey(member.name), member]));
  const base = members.length ? members : fromBiographies(core, 'core');
  return base.map(member => {
    const biography = coreMap.get(nameKey(member.name));
    const rawImage = biography?.image || member.image || '';
    return {
      ...member,
      image: rawImage.startsWith('/team/') ? rawImage.replace('/team/', '/team_images/core/')
        : rawImage && !rawImage.startsWith('/') && !/^(https?:|data:)/.test(rawImage) ? `/team_images/core/${rawImage}` : rawImage,
      tagline: (biography?.tagline || member.tagline || '').trim(),
      socials: { ...member.socials, ...biography?.socials },
    };
  });
}

export function directoryMembers(kind: 'members' | 'alumni', team: Member[]): Member[] {
  if (kind === 'alumni') return fromBiographies(alumni_info as Biography[], 'alumni');
  return members_info.length ? fromBiographies(members_info as Biography[], 'members') : enrichTowerMembers(team);
}
