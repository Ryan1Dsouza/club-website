import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Member } from '../types';
import { directoryMembers } from '../lib/people-data';
import { sortTowerMembers } from '../lib/people-tower-motion';
import TeamShowcase from '../components/team/TeamShowcase';
import type { CoreMember, ClubMember } from '../components/team/types';
import './people-tower.css';
import './people-directory.css';

const emptyTeam: Member[] = [];

export default function PeopleDirectoryPage({ kind, members = emptyTeam }: { kind: 'members' | 'alumni'; members?: Member[] }) {
  const people = useMemo(() => sortTowerMembers(directoryMembers(kind, members)), [kind, members]);
  const alumni = kind === 'alumni';

  const coreMembers: CoreMember[] = useMemo(
    () =>
      people.slice(0, 12).map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        image: m.image,
        bio: m.tagline,
        socials: m.socials as Record<string, string | undefined>,
      })),
    [people]
  );

  const clubMembers: ClubMember[] = useMemo(
    () =>
      people.slice(12).map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        team: alumni ? 'Alumni' : 'Members',
        image: m.image,
        bio: m.tagline,
        socials: m.socials as Record<string, string | undefined>,
      })),
    [people, alumni]
  );

  return (
    <div className="people-directory-wrapper">
      <div className="people-directory-page__nav">
        <Link to="/team" state={{ scrollToDirectory: true }} onClick={() => sessionStorage.setItem('people_return_to_directory', 'true')} className="text-link">
          <ArrowLeft size={16} />The people
        </Link>
        <Link to={alumni ? '/members' : '/alumni'} className="text-link">
          {alumni ? 'Members' : 'Alumni'}<ArrowUpRight size={16} />
        </Link>
      </div>

      <TeamShowcase clubName="Nucleus" core={coreMembers} members={clubMembers} isAlumni={alumni} />
    </div>
  );
}
