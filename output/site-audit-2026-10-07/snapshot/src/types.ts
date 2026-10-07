export type Domain = 'aiml' | 'web' | 'dsa';
export interface EventPhoto { id: string; name: string; url: string; }
export interface ClubEvent { id: string; title: string; description: string; startsAt: string; endsAt: string; location: string; category: string; registrationUrl: string; albumUrl?: string; published: boolean; photos?: EventPhoto[]; trackPosition?: number; managed?: boolean; }
export interface Project { id: string; title: string; description: string; domain: string; status: string; url: string; repositoryUrl: string; published: boolean; }
export interface Member { id: string; name: string; role: string; initials: string; status?: 'member' | 'alumni'; createdAt?: string; image?: string; tagline?: string; socials?: Partial<Record<'linkedin' | 'github' | 'leetcode' | 'instagram' | 'website', string>>; }
export interface SiteSettings { recruitmentOpen: boolean; recruitmentMessage: string; recruitmentNextOpening?: string; recruitmentDeadline: string; cycle: string; contactEmail: string; instagramUrl: string; githubUrl: string; linkedinUrl: string; }
export interface SiteData { settings: SiteSettings; events: ClubEvent[]; projects: Project[]; team: Member[]; }
export interface Application { id: string; name: string; email: string; year: string; domain: Domain; motivation: string; portfolio: string; linkedin: string; github: string; leetcode: string; status: string; cycle: string; createdAt: string; }
