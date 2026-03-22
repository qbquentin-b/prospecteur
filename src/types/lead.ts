export interface ContactInfo {
  phone?: string[];
  email?: string[];
  linkedin?: string;
  facebook?: string;
  instagram?: string;
}

export interface GoogleBusiness {
  isClaimed: boolean;
  rating: number;
  reviewCount: number;
  category: string;
}

export interface TechAudit {
  website?: string;
  hasWebsite: boolean;
  cms?: string;
  pageSpeedScore?: number;
  isMobileOptimized?: boolean;
  technologies: string[];
}

export interface Lead {
  id: string;
  name: string;
  address: string;
  contact: ContactInfo;
  googleBusiness: GoogleBusiness;
  techAudit: TechAudit;
  opportunityScore: number;
  lat?: number;
  lng?: number;
}
