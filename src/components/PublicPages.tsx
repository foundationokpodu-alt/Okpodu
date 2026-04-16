import React from 'react';
import { 
  CheckCircle2, Globe, Users, Heart, 
  MapPin, School, History, Target, 
  ChevronRight, ArrowRight, Zap, GraduationCap,
  Gamepad2, Code2, Briefcase, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GALLERY_MEDIA, PROGRAM_TRACKS, MOCK_LOCALITIES, MOCK_SCHOOLS } from '../constants';
import { ChevronLeft, Map as MapIcon } from 'lucide-react';

import { GalleryMedia } from '../types';

export const GalleryPage = ({ images, loading }: { images: GalleryMedia[], loading?: boolean }) => {
  const categories = ['All', 'Programs', 'Events', 'Community', 'Impact', 'General'];
  const [activeCategory, setActiveCategory] = React.useState('All');

  const filteredMedia = activeCategory === 'All' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4">Our Gallery</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Capturing moments of impact, learning, and community growth across Nigeria.</p>
        </header>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-[15px] bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredMedia.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative aspect-[4/3] rounded-[15px] overflow-hidden shadow-xl bg-white"
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-slate-900 relative">
                      {item.thumbnail ? (
                        <img 
                          src={item.thumbnail} 
                          alt={item.caption} 
                          width="800"
                          height="600"
                          className="w-full h-full object-cover opacity-60"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play size={48} className="text-white/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <Play size={32} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.caption} 
                      width="800"
                      height="600"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-white font-bold text-lg mb-1">{item.caption}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">{item.category}</span>
                      <span className="text-white/70 text-sm">{item.date}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export const WhatWeDoPage = () => {
  const activities = [
    {
      title: 'Technology Training',
      description: 'We provide hands-on training in coding, web development, data science, and digital literacy to children and young adults.',
      icon: Code2,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Academic Support',
      description: 'Supplementing formal education with specialized tutoring in STEM subjects to ensure global competitiveness.',
      icon: GraduationCap,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Mentorship Programs',
      description: 'Connecting students with industry professionals to guide their career paths and personal development.',
      icon: Users,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Community Empowerment',
      description: 'Engaging with families and local leaders to create a supportive environment for educational growth.',
      icon: Heart,
      color: 'bg-red-50 text-red-600'
    }
  ];

  return (
    <div className="pt-32 pb-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20">
          <h1 className="text-5xl font-bold text-primary mb-6">What We Do</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            We bridge the gap between traditional education and the digital future. Our programs are designed to empower the next generation of Nigerian leaders with the tools they need to succeed.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 mb-24">
          {activities.map((activity, idx) => (
            <motion.div
              key={activity.title}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:shadow-2xl transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl ${activity.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <activity.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">{activity.title}</h3>
              <p className="text-slate-600 leading-relaxed text-lg">{activity.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-primary rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Impact Strategy</h2>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                We don't just teach skills; we build ecosystems. Our approach involves working closely with schools, families, and local industries to ensure our students have a clear path from learning to earning.
              </p>
              <ul className="space-y-4">
                {[
                  'Curriculum aligned with global tech standards',
                  'Focus on soft skills and leadership',
                  'Sustainable community-led models',
                  'Continuous monitoring and evaluation'
                ].map(item => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="text-accent" size={20} />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 flex flex-col justify-center text-center">
                <p className="text-4xl font-bold text-accent mb-2">95%</p>
                <p className="text-xs uppercase tracking-widest font-bold text-white/60">Student Retention</p>
              </div>
              <div className="aspect-square rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 flex flex-col justify-center text-center">
                <p className="text-4xl font-bold text-accent mb-2">50+</p>
                <p className="text-xs uppercase tracking-widest font-bold text-white/60">Partner Schools</p>
              </div>
              <div className="aspect-square rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 flex flex-col justify-center text-center">
                <p className="text-4xl font-bold text-accent mb-2">10k+</p>
                <p className="text-xs uppercase tracking-widest font-bold text-white/60">Lives Impacted</p>
              </div>
              <div className="aspect-square rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 flex flex-col justify-center text-center">
                <p className="text-4xl font-bold text-accent mb-2">24/7</p>
                <p className="text-xs uppercase tracking-widest font-bold text-white/60">Support Access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LocalityProfilePage = ({ id, onBack, onSchoolClick }: { id: string, onBack: () => void, onSchoolClick: (id: string) => void }) => {
  const locality = MOCK_LOCALITIES.find(l => l.id === id);
  if (!locality) return <div>Locality not found</div>;

  const localitySchools = MOCK_SCHOOLS.filter(s => s.location.includes(locality.name));

  return (
    <div className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-primary font-bold mb-8 hover:translate-x-1 transition-transform"
        >
          <ChevronLeft size={20} /> Back to Where We Work
        </button>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img 
              src={locality.image_url} 
              alt={`Landscape and community view of ${locality.name} in Delta State, Nigeria`} 
              width="800"
              height="400"
              className="w-full h-[400px] object-cover rounded-[15px] shadow-2xl"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <div className="flex items-center gap-3 text-accent font-bold mb-4 uppercase tracking-widest">
              <MapPin size={18} /> {locality.lga} LGA, {locality.state} State
            </div>
            <h1 className="text-5xl font-bold text-primary mb-6">{locality.name}</h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              {locality.description}
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
            <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
              <History size={24} /> History & Heritage
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {locality.history}
            </p>
          </section>
          <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 overflow-hidden relative min-h-[300px]">
            <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
              <MapIcon size={24} /> Location Map
            </h3>
            <div className="absolute inset-0 mt-20 bg-slate-200 flex items-center justify-center">
              <div className="text-center p-6">
                <MapPin size={48} className="text-primary mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Map View: {locality.coordinates.lat}, {locality.coordinates.lng}</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${locality.coordinates.lat},${locality.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-primary font-bold hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </section>
        </div>

        <section>
          <h3 className="text-3xl font-bold text-primary mb-8">Partner Schools in {locality.name}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {localitySchools.map(school => (
              <button 
                key={school.id}
                onClick={() => onSchoolClick(school.id)}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-2xl transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <School size={24} />
                </div>
                <h4 className="text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">{school.name}</h4>
                <p className="text-sm text-slate-500 mb-4">{school.type} School</p>
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  View Profile <ArrowRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export const SchoolProfilePage = ({ id, onBack }: { id: string, onBack: () => void }) => {
  const school = MOCK_SCHOOLS.find(s => s.id === id);
  if (!school) return <div>School not found</div>;

  return (
    <div className="pt-32 pb-24 px-6 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-primary font-bold mb-8 hover:translate-x-1 transition-transform"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img 
              src={school.image_url} 
              alt={`Exterior or campus view of ${school.name}, a partner school of OETF`} 
              width="800"
              height="400"
              className="w-full h-[400px] object-cover rounded-[15px] shadow-2xl"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <div className="flex items-center gap-3 text-accent font-bold mb-4 uppercase tracking-widest">
              <GraduationCap size={18} /> {school.type} Education Partner
            </div>
            <h1 className="text-5xl font-bold text-primary mb-6">{school.name}</h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              {school.description}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Students</p>
                <p className="text-2xl font-bold text-primary">{school.studentCount}+</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Partner Since</p>
                <p className="text-2xl font-bold text-primary">{new Date(school.partnershipDate).getFullYear()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
            <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
              <Users size={24} /> Impact & Engagement
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Our partnership with {school.name} focuses on integrating digital literacy into the core curriculum. We provide regular workshops, teacher training, and access to modern educational resources.
            </p>
            <ul className="space-y-3">
              {[
                'Weekly Coding Workshops',
                'Digital Literacy Certification',
                'STEM Resource Hub Access',
                'Teacher Mentorship Program'
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-green-500" size={18} /> {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 overflow-hidden relative min-h-[300px]">
            <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
              <MapIcon size={24} /> School Location
            </h3>
            <div className="absolute inset-0 mt-20 bg-slate-200 flex items-center justify-center">
              <div className="text-center p-6">
                <MapPin size={48} className="text-primary mx-auto mb-4" />
                <p className="text-slate-500 font-medium">{school.location}</p>
                {school.coordinates && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${school.coordinates.lat},${school.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-primary font-bold hover:underline"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export const WhereWeWorkPage = ({ setView, setSelectedId }: { setView: (view: any) => void, setSelectedId: (id: string) => void }) => {
  return (
    <div className="pt-32 pb-24 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20">
          <h1 className="text-5xl font-bold text-primary mb-6">Where We Work</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our roots are deep in the communities we serve. We focus on areas where the need for educational and technological intervention is greatest.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12 mb-24">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <h2 className="text-3xl font-bold text-primary">Our Localities</h2>
              </div>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                We currently operate in the heart of the Niger Delta, with a primary focus on the <button onClick={() => { setSelectedId('oviorie-ovu'); setView('locality_profile'); }} className="text-primary font-bold hover:underline">Oviorie-Ovu</button> community in Ethiope East LGA, Delta State. Our programs are integrated directly into local schools to ensure accessibility for every child in the community.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <button 
                  onClick={() => { setSelectedId('oviorie-ovu'); setView('locality_profile'); }}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left hover:bg-white hover:shadow-lg transition-all group"
                >
                  <h4 className="font-bold text-primary mb-2 group-hover:text-accent transition-colors">Oviorie-Ovu Hub</h4>
                  <p className="text-sm text-slate-500">Serving two secondary schools and three primary schools in the Ethiope East region.</p>
                  <div className="mt-4 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    View Profile <ArrowRight size={14} />
                  </div>
                </button>
                <button 
                  onClick={() => { setSelectedId('ethiope-east'); setView('locality_profile'); }}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left hover:bg-white hover:shadow-lg transition-all group"
                >
                  <h4 className="font-bold text-primary mb-2 group-hover:text-accent transition-colors">Ethiope East LGA</h4>
                  <p className="text-sm text-slate-500">Focusing on digital literacy and academic excellence for rural youth.</p>
                  <div className="mt-4 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    View Profile <ArrowRight size={14} />
                  </div>
                </button>
              </div>
            </section>

            <section className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                  <History size={24} />
                </div>
                <h2 className="text-3xl font-bold text-primary">Community History</h2>
              </div>
              <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                The communities we work in have rich cultural histories but have often been left behind in the digital revolution. Many of these areas were once centers of trade and industry that now face high unemployment and limited educational resources.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                By understanding the history and social fabric of these neighborhoods, we tailor our programs to respect local traditions while introducing modern technological concepts.
              </p>
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-primary p-10 rounded-[3rem] text-white shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <Target className="text-accent" size={32} />
                <h3 className="text-2xl font-bold">Our Vision</h3>
              </div>
              <p className="text-white/80 mb-8 leading-relaxed">
                To empower communities through education and technology by helping young people gain the knowledge, skills, and opportunities they need to build brighter futures.
              </p>
              <div className="pt-8 border-t border-white/10 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <Zap className="text-accent" size={32} />
                  <h3 className="text-2xl font-bold">Our Mission</h3>
                </div>
                <p className="text-white/80 leading-relaxed">
                  To improve access to quality education, promote digital literacy, and support the development of future-ready students in Nigeria.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent mt-1" size={18} />
                  <p className="text-sm">100% Digital Literacy in partner schools</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent mt-1" size={18} />
                  <p className="text-sm">Job placement for 70% of program graduates</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent mt-1" size={18} />
                  <p className="text-sm">Community-led tech support hubs</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
              <h3 className="text-2xl font-bold text-primary mb-6">Partner Schools</h3>
              <div className="space-y-4">
                {MOCK_SCHOOLS.map(school => (
                  <button 
                    key={school.id} 
                    onClick={() => { setSelectedId(school.id); setView('school_profile'); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <School className="text-slate-400 group-hover:text-primary transition-colors" size={18} />
                    <span className="text-slate-700 font-medium group-hover:text-primary transition-colors">{school.name}</span>
                  </button>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-slate-50 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all">
                View All Partners
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-12">Impact on Families & Community</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Economic Growth', 
                desc: 'Students bringing tech skills home often help parents with digital business tools and online marketing.',
                icon: Zap
              },
              { 
                title: 'Social Mobility', 
                desc: 'Education provides a clear path out of poverty, inspiring younger siblings and neighbors.',
                icon: GraduationCap
              },
              { 
                title: 'Digital Inclusion', 
                desc: 'Communities become more connected to global information, health resources, and government services.',
                icon: Globe
              }
            ].map(item => (
              <div key={item.title} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-lg text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 text-primary flex items-center justify-center mx-auto mb-6">
                  <item.icon size={32} />
                </div>
                <h4 className="text-xl font-bold text-primary mb-4">{item.title}</h4>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
