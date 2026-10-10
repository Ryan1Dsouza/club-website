import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import type { AchievementProfile } from "../../content/achievements";
import { storageImageAttributes, restoreOriginalImage } from "../../lib/responsive-images";

export interface AchievementCardProps {
  profile: AchievementProfile;
  index: number;
  totalProfiles: number;
  isPreview: boolean;
  activeCategory: string;
  onClick: () => void;
}

export function AchievementCard({ profile, index, totalProfiles, isPreview, activeCategory, onClick }: AchievementCardProps) {
  const [failedImage, setFailedImage] = React.useState<string>();
  const portrait = profile.member.image;
  
  return (
    <article 
      className="ach-record" 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
    >
      <div className="witcher-card-corner top-left" />
      <div className="witcher-card-corner top-right" />
      <div className="witcher-card-corner bottom-left" />
      <div className="witcher-card-corner bottom-right" />

      <div className="ach-record-inner">
        <div className="ach-record__person">
          <span className="ach-portrait">
            <span aria-hidden="true">{profile.member.initials}</span>
            {portrait && failedImage !== portrait && (
              <img 
                src={portrait} 
                {...storageImageAttributes(portrait, [160, 320], "100px")} 
                alt={profile.member.name} 
                width="120" height="144" 
                loading={index < 3 ? "eager" : "lazy"} decoding="async" fetchPriority={index === 0 ? "high" : "auto"}
                onError={event => { if (!restoreOriginalImage(event.currentTarget)) setFailedImage(portrait); }} 
              />
            )}
          </span>
          <div>
            <span className="ach-record__role">{profile.member.role}</span>
            <h3>{profile.member.name}</h3>
          </div>
        </div>
        
        <ul className="ach-honours">
          {profile.achievements.map(record => (
            <li key={record.id} data-category-match={activeCategory === "All" || record.category === activeCategory}>
              <span className={`ach-honours__symbol ach-honours__symbol--${record.category === "Hackathons" ? "award" : record.category === "Open source" ? "code" : record.category === "Research" ? "research" : "rank"}`} aria-hidden="true">
                {record.category === "Hackathons" ? "✳" : record.category === "Open source" ? "↗" : record.category === "Research" ? "✦" : "#"}
              </span>
              <div>
                <span className="ach-honours__title">{record.title}<span>’{record.year.slice(-2)}</span></span>
                <span className="ach-honours__result">{record.result}</span>
              </div>
            </li>
          ))}
        </ul>
        
        <button type="button" className="ach-record__open" aria-label={`View ${profile.member.name}s achievements`} aria-haspopup="dialog">
          <span className="ach-record__arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
        </button>
      </div>
    </article>
  );
}
