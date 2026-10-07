import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Asterisk } from "lucide-react";
import type { AchievementProfile } from "../../content/achievements";
import { storageImageAttributes, restoreOriginalImage } from '../../lib/responsive-images';

export interface AchievementCardProps {
  profile: AchievementProfile;
  index: number;
  totalProfiles: number;
  isPreview: boolean;
  activeCategory: string;
  onClick: () => void;
}

const number = (value: number) => String(value).padStart(2, '0');

export function AchievementCard({ profile, index, totalProfiles, isPreview, activeCategory, onClick }: AchievementCardProps) {
  const [failedImage, setFailedImage] = React.useState<string>();
  const portrait = profile.member.image; // Wait, createTeamProfiles was used before. Let's adapt this.
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { width, height, left, top } = rect;
    const xPct = (e.clientX - left) / width - 0.5;
    const yPct = (e.clientY - top) / height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.article 
      className="ach-record 3d-card-wrapper" 
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        cursor: "pointer",
        position: "relative"
      }}
    >
      <div 
        className="ach-record-inner"
        style={{
          transform: "translateZ(30px)",
          transformStyle: "preserve-3d",
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div className="ach-record__topline" style={{ transform: "translateZ(40px)" }}>
          <span>No. {number(index + 1)}</span>
          <span>{isPreview ? 'SAMPLE RECORD' : 'MEMBER RECORD'}</span>
          <Asterisk size={15} aria-hidden="true" />
        </div>
        
        <div className="ach-record__person" style={{ transform: "translateZ(50px)" }}>
          <span className="ach-portrait">
            <span aria-hidden="true">{profile.member.initials}</span>
            {portrait && failedImage !== portrait && (
              <img 
                src={portrait} 
                {...storageImageAttributes(portrait, [160, 320], '100px')} 
                alt={profile.member.name} 
                width="120" height="144" 
                loading="lazy" decoding="async" 
                onError={event => { if (!restoreOriginalImage(event.currentTarget)) setFailedImage(portrait); }} 
              />
            )}
          </span>
          <div>
            <span className="ach-record__role">{profile.member.role}</span>
            <h3>{profile.member.name}</h3>
          </div>
        </div>
        
        <ul className="ach-honours" style={{ transform: "translateZ(40px)", flex: 1 }}>
          {profile.achievements.map(record => (
            <li key={record.id} data-category-match={activeCategory === 'All' || record.category === activeCategory}>
              <span className={`ach-honours__symbol ach-honours__symbol--${record.category === 'Hackathons' ? 'award' : record.category === 'Open source' ? 'code' : record.category === 'Research' ? 'research' : 'rank'}`} aria-hidden="true">
                {record.category === 'Hackathons' ? '✳' : record.category === 'Open source' ? '↗' : record.category === 'Research' ? '✦' : '#'}
              </span>
              <div>
                <span className="ach-honours__title">{record.title}<span>’{record.year.slice(-2)}</span></span>
                <span className="ach-honours__result">{record.result}</span>
              </div>
            </li>
          ))}
        </ul>
        
        <button type="button" className="ach-record__open" style={{ transform: "translateZ(60px)" }} aria-label={`View ${profile.member.name}'s achievements`} aria-haspopup="dialog">
          <span>{number(profile.achievements.length)} {isPreview ? 'sample achievements' : 'achievements'}</span>
          <span className="ach-record__arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
        </button>
      </div>
    </motion.article>
  );
}
