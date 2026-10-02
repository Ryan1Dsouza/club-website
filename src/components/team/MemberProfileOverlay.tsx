import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Code2, Database, Globe, Github, Linkedin, Terminal, X } from 'lucide-react';
import MemberPhoto from './MemberPhoto';
import type { ProfileSubject } from './types';

const platformLabels: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  leetcode: 'LeetCode',
  gfg: 'GeeksforGeeks',
  kaggle: 'Kaggle',
  codeforces: 'Codeforces',
};

const platformIcons: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  github: Github,
  leetcode: Code2,
  gfg: Globe,
  kaggle: Database,
  codeforces: Terminal,
};

function getSocialLinks(socials: ProfileSubject['socials']) {
  if (!socials) return [];
  return Object.entries(socials).flatMap(([platform, value]) => {
    if (!value || value === '#') return [];
    const label = platformLabels[platform.toLowerCase()] || platform;
    const Icon = platformIcons[platform.toLowerCase()] || ArrowUpRight;
    if (platform.toLowerCase() === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? [{ platform, label, href: `mailto:${value}`, Icon }] : [];
    }
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        return [{ platform, label, href: url.href, Icon }];
      }
      return [];
    } catch {
      return [{ platform, label, href: value, Icon }];
    }
  });
}

export default function MemberProfileOverlay({
  member,
  index,
  total,
  group = 'THE CORE',
  clubName = 'NUCLEUS',
  onClose,
  reducedMotion = false,
  returnFocus = null,
}: {
  member: ProfileSubject;
  index: number;
  total: number;
  group?: string;
  clubName?: string;
  onClose: () => void;
  reducedMotion?: boolean;
  returnFocus?: HTMLElement | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const links = getSocialLinks(member.socials);
  const domain = 'domain' in member && member.domain
    ? member.domain
    : 'team' in member && member.team
    ? member.team
    : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) {
      dialog.showModal();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (returnFocus?.isConnected) {
        returnFocus.focus({ preventScroll: true });
      }
    };
  }, [onClose, returnFocus]);

  return createPortal(
    <motion.dialog
      ref={dialogRef}
      className="fullscreen-profile-dialog"
      aria-labelledby="fullscreen-profile-name"
      aria-describedby={member.bio ? 'fullscreen-profile-bio' : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.35 }}
    >
      <motion.div
        className="fullscreen-profile-surface"
        initial={{ y: reducedMotion ? 0 : 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: reducedMotion ? 0 : 30, opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="fullscreen-profile-topbar">
          <span className="meta-tag">{clubName.toUpperCase()} / {group.toUpperCase()}</span>
          <button className="fullscreen-profile-close" onClick={onClose} autoFocus aria-label="Close profile">
            <span>CLOSE</span>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Left Column: Member Photograph */}
        <div className="fullscreen-profile-portrait">
          <MemberPhoto src={member.image} name={member.name} sizes="(max-width: 767px) 100vw, 50vw" priority />
          <div className="fullscreen-portrait-shade" />
        </div>

        {/* Right Column: Member Introduction */}
        <div className="fullscreen-profile-content">
          <div className="fullscreen-profile-watermark" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </div>

          <div className="fullscreen-profile-body">
            <span className="meta-tag profile-kicker">
              <span className="status-dot" aria-hidden="true" />
              NUCLEUS MEMBER
            </span>

            <h1 id="fullscreen-profile-name" className="fullscreen-profile-name">{member.name}</h1>
            <p className="fullscreen-profile-role">{member.role}</p>

            {domain && <span className="fullscreen-profile-domain">{domain}</span>}

            {member.bio && (
              <p id="fullscreen-profile-bio" className="fullscreen-profile-bio">
                “{member.bio}”
              </p>
            )}

            {links.length > 0 && (
              <nav className="fullscreen-profile-socials" aria-label={`${member.name}'s social links`}>
                {links.map(({ platform, label, href, Icon }) => (
                  <a key={platform} href={href} target="_blank" rel="noopener noreferrer">
                    <Icon size={16} aria-hidden="true" />
                    <span>{label}</span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ))}
              </nav>
            )}

            <button className="fullscreen-profile-back" onClick={onClose}>
              <ArrowLeft size={16} aria-hidden="true" />
              <span>BACK TO MEMBERS</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.dialog>,
    document.body
  );
}
