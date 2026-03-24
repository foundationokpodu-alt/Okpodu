export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'staff' | 'student' | 'volunteer' | 'sponsor';
}

export interface TeamMember {
  id: string;
  full_name: string;
  position: string;
  department?: string;
  bio?: string;
  photo_url?: string;
  linkedin_url?: string;
}

export interface Trustee {
  id: string;
  full_name: string;
  title?: string;
  professional_background?: string;
  governance_role?: string;
  years_of_service?: number;
  photo_url?: string;
}

export interface ProgramTrack {
  id: string;
  title: string;
  ageRange: string;
  description: string;
  icon: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  image_url: string;
  tags: string[];
  status: 'draft' | 'published';
}

export interface BlogComment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  date: string;
  isFlagged: boolean;
}

export interface Locality {
  id: string;
  name: string;
  lga: string;
  state: string;
  description: string;
  history: string;
  image_url: string;
  coordinates: { lat: number; lng: number };
}

export interface School {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  studentCount: number;
  partnershipDate: string;
  description?: string;
  image_url?: string;
  coordinates?: { lat: number; lng: number };
  type: 'Primary' | 'Secondary';
}

export interface Student {
  id: string;
  schoolId: string;
  name: string;
  grade: string;
  performance: string;
  status: 'active' | 'graduated' | 'inactive';
}

export interface Facilitator {
  id: string;
  name: string;
  expertise: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface Document {
  id: string;
  title: string;
  type: 'blog' | 'course' | 'internal' | 'report';
  url: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface Asset {
  id: string;
  name: string;
  category: 'tech' | 'furniture' | 'books' | 'other';
  quantity: number;
  condition: 'new' | 'good' | 'fair' | 'poor';
  location: string;
}

export interface GalleryMedia {
  id: string;
  url: string;
  caption: string;
  category: string;
  date: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  totalDonated: number;
  lastDonationDate: string;
  status: 'active' | 'inactive';
}
