import { ProgramTrack, GalleryMedia, BlogPost, School, Facilitator, Locality } from './types';

export const PROGRAM_TRACKS: ProgramTrack[] = [
  {
    id: 'education-support',
    title: 'Education Support',
    ageRange: '',
    description: 'OETF supports schools by helping improve learning environments and providing access to essential educational resources. Many schools in underserved communities face shortages of learning materials and infrastructure challenges.\n\nOur education support initiatives focus on strengthening classrooms and supporting school-based learning in practical ways that improve student experience and educational outcomes.',
    icon: 'GraduationCap'
  },
  {
    id: 'tech-literacy',
    title: 'Technology & Digital Literacy',
    ageRange: '',
    description: 'OETF is committed to preparing students for a technology-driven future. Through digital learning initiatives, students are introduced to the foundational skills needed to understand and use technology effectively.\n\nBeginning at the primary school level, students develop digital awareness, logical thinking, and early exposure to coding concepts. As students progress, they gain stronger skills in problem-solving, digital learning, and technology-based thinking.',
    icon: 'Zap'
  },
  {
    id: 'stem-innovation',
    title: 'STEM & Innovation',
    ageRange: '',
    description: 'OETF promotes science, technology, engineering, and mathematics learning as part of preparing students to think critically and engage with the future.\n\nOur goal is to help students move from simply learning concepts to thinking creatively about how knowledge can be applied to solve real-world challenges.',
    icon: 'Target'
  },
  {
    id: 'community-partnerships',
    title: 'Community Partnerships',
    ageRange: '',
    description: 'OETF believes lasting educational progress requires collaboration. We work with schools, educators, and community stakeholders to identify needs and support initiatives that strengthen educational opportunities.',
    icon: 'Users'
  }
];

export const GALLERY_MEDIA: GalleryMedia[] = [
  { id: '2', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800', caption: 'Workshop session', category: 'Events', date: '2023-11-20', type: 'image' },
  { id: '3', url: 'https://images2.imgbox.com/86/38/pLZqVlia_o.jpeg', caption: 'Community outreach', category: 'Community', date: '2023-12-05', type: 'image' },
  { id: '4', url: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&q=80&w=800', caption: 'Graduation ceremony', category: 'Programs', date: '2024-01-10', type: 'image' },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Bridging the Digital Divide in Nigeria',
    excerpt: 'How technology is changing the landscape of education in underserved communities.',
    content: 'Full content here...',
    author: 'Admin',
    date: '2024-02-15',
    image_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800',
    tags: ['Education', 'Tech'],
    status: 'published'
  }
];

export const MOCK_LOCALITIES: Locality[] = [
  {
    id: 'oviorie-ovu',
    name: 'Oviorie-Ovu',
    lga: 'Ethiope East',
    state: 'Delta',
    description: 'Oviorie-Ovu is a vibrant community in the Ethiope East Local Government Area of Delta State, Nigeria. It is known for its rich agricultural heritage and strong community spirit.',
    history: 'The community has a long-standing history of trade and education, serving as a hub for the surrounding Agbon Kingdom. It has produced many notable leaders and scholars over the decades.',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200',
    coordinates: { lat: 5.7833, lng: 6.0833 }
  },
  {
    id: 'ethiope-east',
    name: 'Ethiope East LGA',
    lga: 'Ethiope East',
    state: 'Delta',
    description: 'Ethiope East is a Local Government Area of Delta State, Nigeria, with its headquarters in the town of Isiokolo. It is a region characterized by its agricultural productivity and emerging educational centers.',
    history: 'Ethiope East has historically been a significant administrative and cultural center within the Urhobo ethnic group. The LGA was created to bring governance closer to the people and foster local development.',
    image_url: 'https://hotelmanagementandtourism.wordpress.com/wp-content/uploads/2018/03/abraka-resort-2.jpg',
    coordinates: { lat: 5.7667, lng: 6.1000 }
  }
];

export const MOCK_SCHOOLS: School[] = [
  { 
    id: '1', 
    name: 'Oviorie Secondary School', 
    location: 'Oviorie-Ovu, Ethiope East LGA', 
    contactPerson: 'Principal', 
    studentCount: 450, 
    partnershipDate: '2023-01-15',
    type: 'Secondary',
    description: 'A leading secondary institution in Oviorie-Ovu dedicated to academic excellence and character development.',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    coordinates: { lat: 5.7850, lng: 6.0850 }
  },
  { 
    id: '2', 
    name: 'Ovu Grammar School', 
    location: 'Oviorie-Ovu, Ethiope East LGA', 
    contactPerson: 'Principal', 
    studentCount: 380, 
    partnershipDate: '2023-03-20',
    type: 'Secondary',
    description: 'A historic grammar school with a strong focus on classical education and community leadership.',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800',
    coordinates: { lat: 5.7820, lng: 6.0820 }
  },
  { 
    id: '3', 
    name: 'Oviorie Model Primary School', 
    location: 'Oviorie-Ovu, Ethiope East LGA', 
    contactPerson: 'Head Teacher', 
    studentCount: 320, 
    partnershipDate: '2023-05-10',
    type: 'Primary',
    description: 'A model primary school providing foundational education with modern teaching methodologies.',
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    coordinates: { lat: 5.7840, lng: 6.0840 }
  },
  { 
    id: '4', 
    name: 'T. A Salubi Primary School', 
    location: 'Oviorie-Ovu, Ethiope East LGA', 
    contactPerson: 'Head Teacher', 
    studentCount: 280, 
    partnershipDate: '2023-06-15',
    type: 'Primary',
    description: 'Named after the legendary T.A. Salubi, this school continues his legacy of educational empowerment.',
    image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    coordinates: { lat: 5.7810, lng: 6.0810 }
  },
  { 
    id: '5', 
    name: 'Eziegbe Primary School', 
    location: 'Oviorie-Ovu, Ethiope East LGA', 
    contactPerson: 'Head Teacher', 
    studentCount: 210, 
    partnershipDate: '2023-07-20',
    type: 'Primary',
    description: 'A community-focused primary school serving the Eziegbe quarters of Oviorie-Ovu.',
    image_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800',
    coordinates: { lat: 5.7860, lng: 6.0860 }
  },
];

export const MOCK_FACILITATORS: Facilitator[] = [
  { id: '1', name: 'Sarah Williams', expertise: 'Web Development', email: 'sarah@example.com', phone: '08012345678', status: 'active' },
  { id: '2', name: 'David Okoro', expertise: 'Data Science', email: 'david@example.com', phone: '08087654321', status: 'active' },
];

export const COLORS = {
  primary: '#003366', // Deep Blue
  accent: '#D4AF37',  // Gold
  white: '#FFFFFF',
  background: '#F8FAFC'
};
