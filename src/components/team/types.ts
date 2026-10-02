export interface CoreMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  bio?: string;
  socials?: Record<string, string | undefined>;
}

export interface ClubMember {
  id: string;
  name: string;
  role: string;
  team: string;
  image?: string;
  bio?: string;
  socials?: Record<string, string | undefined>;
}

export interface AlumniMember {
  id: string;
  name: string;
  role: string;
  graduationYear?: number;
  organization?: string;
  jobTitle?: string;
  domain?: string;
  image?: string;
  bio?: string;
  socials?: Record<string, string | undefined>;
}

export type ProfileSubject = CoreMember | ClubMember | AlumniMember;
