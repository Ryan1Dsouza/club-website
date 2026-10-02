import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import MemberPhoto from './MemberPhoto';
import type { ProfileSubject } from './types';

export default function MemberCard({
  member,
  index,
  total,
  onSelect,
  reducedMotion = false,
}: {
  member: ProfileSubject;
  index?: number;
  total?: number;
  onSelect: (member: ProfileSubject) => void;
  reducedMotion?: boolean;
}) {
  const domain = 'domain' in member && member.domain
    ? member.domain
    : 'team' in member && member.team
    ? member.team
    : undefined;

  return (
    <motion.button
      type="button"
      className="member-card-surface"
      data-member-id={member.id}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : Math.min((index || 0) * 0.04, 0.24) }}
      onClick={() => onSelect(member)}
      aria-label={`${member.name}, ${member.role}`}
      aria-haspopup="dialog"
    >
      {/* Full-bleed portrait image */}
      <div className="member-card-photo-area">
        <MemberPhoto src={member.image} name={member.name} priority={index === 0} />
        <span className="member-card-photo-gradient" />
      </div>

      {/* Top badges & icons */}
      <div className="member-card-topbar">
        {index !== undefined && total !== undefined && (
          <span className="member-card-badge">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        )}
        <ArrowUpRight className="member-card-arrow" size={18} aria-hidden="true" />
      </div>

      {/* Info overlay positioned at the BOTTOM of the image */}
      <div className="member-card-bottom-overlay">
        <span className="member-card-kicker">
          <span className="status-dot" aria-hidden="true" />
          {member.role}
        </span>
        <h3 className="member-card-name">{member.name}</h3>
        {domain && <span className="member-card-domain">{domain}</span>}
        {member.bio && <p className="member-card-bio">“{member.bio}”</p>}
        <div className="member-card-footer">
          <span className="member-card-action">View Profile →</span>
        </div>
      </div>
    </motion.button>
  );
}
