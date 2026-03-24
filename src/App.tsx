import React, { useState, useEffect } from 'react';
import { 
  Menu, X, GraduationCap, Users, Heart, Calendar, Handshake, 
  BookOpen, ShieldCheck, ChevronRight, Github, 
  Linkedin, Twitter, Mail, MapPin, Phone,
  ArrowRight, Award, Zap, Globe, ChevronDown,
  Facebook, Instagram, Youtube, Image as ImageIcon,
  Target, History, LayoutDashboard, CheckCircle2, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaystackPayment } from 'react-paystack';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { PROGRAM_TRACKS, COLORS, GALLERY_MEDIA } from './constants';
import AdminPortal from './components/AdminPortal';
import { GalleryPage, WhatWeDoPage, WhereWeWorkPage, LocalityProfilePage, SchoolProfilePage } from './components/PublicPages';
import BlogPage from './components/BlogPage';
import SEO from './components/SEO';
import { GalleryMedia } from './types';

// --- Components ---

const Navbar = ({ setView, currentView }: { setView: (view: any) => void, currentView: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isSubPage = currentView !== 'landing';
  const navScrolled = scrolled || isSubPage;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: 'landing' },
    { 
      name: 'About Us', 
      href: 'about_us',
      subLinks: [
        { name: 'About Us', href: 'about_us' },
        { name: 'Our Team', href: 'team' },
        { name: 'Governance', href: 'trustees' },
        { name: 'Legacy', href: 'legacy' },
      ]
    },
    { name: 'Programs', href: 'programs_page' },
    { 
      name: 'Impact', 
      href: 'impact',
      subLinks: [
        { name: 'Our Impact', href: 'impact' },
        { name: 'Gallery', href: 'gallery' },
        { name: 'Events', href: 'events' },
        { name: 'Blog', href: 'blog' },
      ]
    },
    { name: 'Get Involved', href: 'partner' },
    { name: 'Founders’ Message', href: 'founders_message' },
    { name: 'Contact', href: 'contact' },
  ];

  return (
    <nav className={`fixed left-0 w-full z-50 transition-all duration-300 ${navScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
      <div className="w-full max-w-7xl mx-auto px-6 flex justify-between items-center">
        <button onClick={() => setView('landing')} className="flex items-center">
          <img 
            src="https://i.imgur.com/jAqfHme.png" 
            alt="Okpodu Foundation Logo" 
            className={`h-[64px] w-auto object-contain transition-all duration-300 ${navScrolled ? '' : 'brightness-0 invert'}`}
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              <button 
                onClick={() => {
                  if (!link.subLinks) {
                    link.href.startsWith('#') ? (window.location.hash = link.href) : setView(link.href);
                  }
                }}
                className={`flex items-center gap-1 font-semibold transition-colors ${navScrolled ? 'text-primary hover:text-accent' : 'text-white hover:text-accent'}`}
              >
                {link.name}
                {link.subLinks && <ChevronDown size={16} />}
              </button>

              {link.subLinks && (
                <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                  <div className="bg-white rounded-2xl shadow-2xl p-4 min-w-[200px] border border-slate-100">
                    {link.subLinks.map((sub) => (
                      <button
                        key={sub.name}
                        onClick={() => setView(sub.href)}
                        className="w-full text-left px-4 py-2 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-all font-medium"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <button 
            onClick={() => setView('donation')}
            className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
              navScrolled 
                ? 'bg-accent text-white hover:bg-primary shadow-md' 
                : 'bg-white text-primary hover:bg-accent hover:text-white'
            }`}
          >
            <Heart size={18} />
            Donate
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} className={navScrolled ? 'text-primary' : 'text-white'} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-2xl py-8 px-6 flex flex-col gap-4 md:hidden max-h-[80vh] overflow-y-auto"
          >
            {navLinks.map((link) => (
              <div key={link.name} className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    if (link.subLinks) {
                      setActiveDropdown(activeDropdown === link.name ? null : link.name);
                    } else {
                      link.href.startsWith('#') ? (window.location.hash = link.href) : setView(link.href);
                      setIsOpen(false);
                    }
                  }}
                  className="text-xl font-semibold text-slate-800 flex justify-between items-center border-b border-slate-100 pb-2"
                >
                  {link.name}
                  {link.subLinks && <ChevronDown size={20} className={`transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                </button>
                
                {link.subLinks && activeDropdown === link.name && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex flex-col gap-3 pl-4 py-2"
                  >
                    {link.subLinks.map((sub) => (
                      <button
                        key={sub.name}
                        onClick={() => {
                          setView(sub.href);
                          setIsOpen(false);
                        }}
                        className="text-lg text-slate-600 font-medium text-left"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
            <button 
              onClick={() => {
                setView('donation');
                setIsOpen(false);
              }}
              className="mt-4 bg-accent text-white py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <Heart size={24} />
              Donate Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ setView }: { setView: (view: any) => void }) => {
  return (
    <section className="relative min-h-[75vh] flex items-center pt-[136px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images2.imgbox.com/09/35/wF5ISgxj_o.png" 
          alt="Okpodu Education & Technology Foundation banner showing our mission to empower Nigerian youth" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <h1 className="text-4xl md:text-6xl text-white leading-[1.1] mb-6 font-bold max-w-4xl">
            Empowering Communities Through <br />
            <span className="text-accent">Education and Technology</span>
          </h1>
          <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-3xl">
            The Okpodu Education & Technology Foundation expands access to quality education and introduces technology-driven learning opportunities that help students in underserved communities develop the knowledge and skills needed for the future. <br /><br />
            <span className="font-bold text-accent">Institutional Anchor Statement:</span><br />
            Established in honor of Frederick Menukun Asini Okpodu, the Foundation continues a legacy of education, service, and community advancement in Delta State, Nigeria.
          </p>
          <div className="flex flex-wrap gap-4 mb-6">
            <button 
              onClick={() => setView('programs_page')}
              className="btn-accent flex items-center gap-2 text-lg px-8"
            >
              Our Programs <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => setView('partner')}
              className="px-8 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-primary transition-all text-lg"
            >
              Get Involved
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const StatsBar = () => {
  return (
    <section className="relative z-20 mt-[50px] mb-12">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Users, title: '1,000+ Students', desc: 'by Dec, 2031', color: 'bg-blue-100 text-primary' },
            { icon: Zap, title: '25+ Tech Tracks', desc: 'by Dec, 2031', color: 'bg-green-100 text-green-600' },
            { icon: Globe, title: 'National Reach', desc: 'by Dec, 2031', color: 'bg-orange-100 text-orange-600' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/95 backdrop-blur-md border border-white/20 shadow-xl p-6 rounded-2xl flex items-center gap-5 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">{stat.title}</h4>
                <p className="text-sm text-slate-500">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


const ProgramSection = ({ setView }: { setView: (view: any) => void }) => {
  const IconMap: Record<string, any> = {
    GraduationCap,
    Zap,
    Target,
    Users,
    BookOpen
  };

  return (
    <section id="programs" className="py-24 bg-white">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-primary mb-4">Our Focus Areas</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            OETF delivers its mission through focused program areas that support schools, introduce technology learning, and strengthen educational opportunities for students in underserved communities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PROGRAM_TRACKS.map((track, idx) => {
            const IconComponent = IconMap[track.icon] || BookOpen;
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <IconComponent size={32} />
                </div>
                {track.ageRange && (
                  <span className="text-accent font-bold text-sm uppercase tracking-widest">{track.ageRange} Years</span>
                )}
                <h3 className="text-2xl text-primary mt-2 mb-4">{track.title}</h3>
                <p className="text-slate-600 mb-8 leading-relaxed line-clamp-4 flex-grow">
                  {track.description}
                </p>
                <button 
                  onClick={() => setView('programs_page')}
                  className="flex items-center gap-2 text-primary font-bold group-hover:text-accent transition-colors mt-auto"
                >
                  Learn More <ChevronRight size={20} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Footer = ({ setView }: { setView: (view: any) => void }) => {
  return (
    <footer className="bg-primary text-white pt-20 pb-10">
      <div className="w-full max-w-7xl mx-auto px-6 grid md:grid-cols-5 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <button onClick={() => setView('landing')} className="flex items-center mb-6">
            <img 
              src="https://i.imgur.com/jAqfHme.png" 
              alt="Okpodu Foundation Logo" 
              className="h-[64px] w-auto object-contain brightness-0 invert"
              referrerPolicy="no-referrer"
            />
          </button>
          <p className="text-white/60 leading-relaxed mb-8">
            Honouring the legacies of Frederick Menuku Asini Okpodu and William Eyimofe Asini Okpodu by empowering the next generation of Nigerian leaders.
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/okpodufoundation" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors" title="Facebook"><Facebook size={20} /></a>
            <a href="https://www.instagram.com/okpodufoundation/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors" title="Instagram"><Instagram size={20} /></a>
            <a href="https://x.com/okpodu_foundatn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors" title="X">
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-lg mb-6">Quick Links</h4>
          <div className="grid grid-cols-2 gap-8 text-white/60 text-left">
            <ul className="space-y-4 text-left">
              <li className="text-left"><button onClick={() => setView('landing')} className="hover:text-accent transition-colors text-left">Home</button></li>
              <li className="text-left"><button onClick={() => setView('about_us')} className="hover:text-accent transition-colors text-left">About Us</button></li>
              <li className="text-left"><button onClick={() => setView('programs_page')} className="hover:text-accent transition-colors text-left">Programs</button></li>
              <li className="text-left"><button onClick={() => setView('impact')} className="hover:text-accent transition-colors text-left">Impact</button></li>
              <li className="text-left"><button onClick={() => setView('trustees')} className="hover:text-accent transition-colors text-left">Governance</button></li>
            </ul>
            <ul className="space-y-4 text-left">
              <li className="text-left"><button onClick={() => setView('legacy')} className="hover:text-accent transition-colors text-left">Legacy</button></li>
              <li className="text-left"><button onClick={() => setView('partner')} className="hover:text-accent transition-colors text-left">Get Involved</button></li>
              <li className="text-left"><button onClick={() => setView('founders_message')} className="hover:text-accent transition-colors text-left">Founders’ Message</button></li>
              <li className="text-left"><button onClick={() => setView('contact')} className="hover:text-accent transition-colors text-left">Contact</button></li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Contact Us</h4>
          <ul className="space-y-4 text-white/60">
            <li className="flex items-start gap-3">
              <MapPin size={20} className="text-accent shrink-0" />
              <span>69, Sapele Road, Oviore-Ovu. Delta State, Nigeria.</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={20} className="text-accent shrink-0" />
              <span>+234 803 223 3679, +234 806 846 4652</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={20} className="text-accent shrink-0" />
              <span>info@okpodufoundation.org</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Newsletter</h4>
          <p className="text-white/60 mb-4">Stay updated with our latest news and events.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email" 
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-accent"
            />
            <button className="bg-accent p-2 rounded-lg hover:bg-accent-hover transition-colors">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="w-full px-10 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-white/40 text-sm">
        <p>© 2026 Okpodu Education & Technology Foundation (OETF). A nonprofit organization committed to education and technology empowerment. All rights reserved.</p>
        <button 
          onClick={() => setView('admin')} 
          className="opacity-50 text-[0.75em] hover:opacity-100 transition-opacity mt-4 md:mt-0"
        >
          Admin Portal
        </button>
      </div>
    </footer>
  );
};

const TeamPage = () => (
  <div className="pt-40 pb-24 px-6 w-full max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16 text-center"
    >
      <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">Our Team</h1>
      <p className="text-xl text-slate-600 max-w-3xl mx-auto">
        Meet the dedicated individuals working tirelessly to bridge the digital divide and empower the next generation of Nigerian leaders.
      </p>
    </motion.div>
    
    <div className="grid md:grid-cols-1 gap-12 max-w-5xl mx-auto">
      {[
        { 
          name: "Afure Ofuase", 
          role: "Executive Director", 
          img: "https://images2.imgbox.com/4f/3b/AK0NLVcV_o.jpeg",
          bio: "Afure Ofuase serves as Executive Director of the Okpodu Education & Technology Foundation (OETF), where she provides operational leadership for the Foundation’s programs and strategic initiatives. In this role, she oversees the implementation of the Foundation’s mission to expand access to quality education, promote digital literacy, and support technology-driven learning opportunities for underserved communities.\n\nWith over seven years of professional experience in human resources and organizational management, Afure brings strong expertise in human capital development, employee experience, and institutional operations. Her professional background includes work within Nigeria’s financial services sector, spanning both the health insurance and pension industries, where she has contributed to initiatives that strengthen workforce engagement and organizational efficiency.\n\nAfure holds a Bachelor of Science (BSc) degree in Economics from Benson Idahosa University, Benin City, Nigeria, and a Master of Science (MSc) degree in International Business from Sheffield Hallam University in the United Kingdom. Her academic and professional experience provides a strong foundation for advancing the Foundation’s mission through effective leadership, strategic coordination, and responsible program delivery.\n\nShe is committed to strengthening educational opportunities and empowering communities through sustainable and impactful initiatives."
        },
        { 
          name: "Philip Akpoviroro Okpodu", 
          role: "Programs Manager", 
          img: "https://images2.imgbox.com/c8/42/0Ct4tJQ7_o.jpeg",
          bio: "Philip Akpoviroro Okpodu serves as Programs Manager at the Okpodu Education & Technology Foundation (OETF), where he supports the planning, coordination, and implementation of the Foundation’s educational and community development initiatives. He works closely with the Executive Director and the Board to ensure that OETF’s programs are effectively organized, implemented, and aligned with the Foundation’s mission of expanding access to education and technology.\n\nIn this role, Philip contributes to program coordination, stakeholder engagement, and operational oversight, supporting partnerships with schools, educators, and community organizations. His responsibilities include assisting with project implementation, monitoring program activities, and ensuring that the Foundation’s initiatives are delivered efficiently and reach the communities they are designed to serve.\n\nPhilip brings over a decade of professional experience across administration, business operations, sales management, and education. His background in operational management and teaching has equipped him with strong organizational, communication, and leadership skills that support the effective delivery of OETF’s programs.\n\nHe holds a Bachelor of Science (BSc) degree from Delta State University, Abraka, and is currently pursuing a Master’s degree in Accounting at Delta State University, Abraka, further strengthening his expertise in financial management and organizational governance.\n\nPhilip is dedicated to supporting initiatives that promote education, youth empowerment, and sustainable community development."
        },
        { 
          name: "Blessing Asini", 
          role: "Finance & Administrative Officer", 
          img: "https://images2.imgbox.com/8c/bf/geDdTm43_o.jpeg",
          bio: "Blessing Asini serves as Finance and Administrative Officer at the Okpodu Education & Technology Foundation (OETF), where he is responsible for supporting the Foundation’s financial administration and ensuring proper financial accountability in its operations.\n\nIn this role, Blessing manages financial records, supports budgeting and expenditure tracking, processes payroll and operational payments, and assists with financial reporting to ensure that the Foundation’s resources are managed responsibly and transparently. His work helps maintain strong financial governance and supports the effective implementation of OETF programs.\n\nBlessing brings professional experience in accounting, financial management, payroll administration, and institutional record-keeping. His expertise includes bookkeeping, budgeting, procurement oversight, bank reconciliation, and financial reporting, all of which contribute to maintaining disciplined financial systems within the Foundation.\n\nHe holds a Higher National Diploma (HND) in Accounting from Plateau State Polytechnic, Jos, Nigeria, and is a Certified Accountant with the Institute of Certified Public Accountants of Nigeria (ICPAN).\n\nBlessing is committed to supporting the Foundation’s mission by ensuring strong financial stewardship and responsible management of resources."
        }
      ].map((member, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start"
        >
          <div className="w-48 h-48 md:w-64 md:h-64 bg-slate-100 rounded-[2rem] overflow-hidden shrink-0 shadow-lg">
            <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h3 className="text-3xl font-bold text-primary mb-2">{member.name}</h3>
            <p className="text-accent font-bold uppercase tracking-wider text-sm mb-6">{member.role}</p>
            {member.bio && (
              <div className="text-slate-600 leading-relaxed whitespace-pre-line text-base">
                {member.bio}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const TrusteesPage = () => {
  const trustees = [
    {
      name: "Akpesiri Emmanuel Okpodu",
      title: "Chairman, Board of Trustees, Okpodu Education & Technology Foundation (OETF)",
      image: "https://images2.imgbox.com/fa/cb/3oUm25ru_o.jpeg",
      bio: "Akpesiri Emmanuel Okpodu serves as Chairman of the Board of Trustees, providing strategic oversight and leadership to advance the Foundation’s mission. He brings a strong commitment to governance, accountability, and community development.\n\nAs Chairman, he leads the Board in setting long-term strategic priorities, ensuring alignment with OETF’s mission, and upholding high standards of transparency and ethical governance. His leadership supports the delivery of sustainable, impact-driven programs focused on education, skills development, and community empowerment."
    },
    {
      name: "Sunday William Asini",
      title: "Secretary, Board of Trustees",
      image: "https://images2.imgbox.com/33/4f/uE8oyGLW_o.jpg",
      bio: "Sunday William Asini is a seasoned business executive with over two decades of experience across investment strategy, operations management, and corporate leadership.\n\nAs Secretary of the Board, he plays a critical role in governance administration, institutional structuring, and strategic coordination. His expertise in financial oversight, stakeholder engagement, and operational systems strengthens OETF’s governance framework and long-term sustainability."
    },
    {
      name: "Ese Watson Okpodu",
      title: "Trustee & Legal Adviser",
      image: "https://images2.imgbox.com/bf/b5/ihcJWKGL_o.jpg",
      bio: "Ese Watson Okpodu is an experienced legal practitioner specializing in regulatory compliance, governance, and institutional risk management.\n\nAs Legal Adviser to the Board, he ensures that OETF operates in full compliance with applicable laws and regulatory frameworks. He provides guidance on fiduciary responsibilities, governance policies, and risk mitigation, reinforcing the Foundation’s commitment to transparency and accountability."
    },
    {
      name: "Gloria Queen Etefia",
      title: "Trustee",
      image: "https://images2.imgbox.com/a8/11/mOcfsd8M_o.jpeg",
      bio: "Gloria Queen Etefia is a seasoned public servant with over four decades of experience in governance and public administration across Nigeria and the United States.\n\nShe provides valuable insight into institutional accountability, public sector systems, and community development. Her experience strengthens the Foundation’s governance capacity and supports its mission to deliver inclusive and impactful programs."
    },
    {
      name: "Ben Mude Bere",
      title: "Trustee",
      image: "https://images2.imgbox.com/49/8f/6kZmqI0U_o.jpg",
      bio: "Ben Mude Bere is a business strategist and skills development expert with extensive experience in vocational training and youth empowerment.\n\nHe brings a strong focus on employability, entrepreneurship, and economic sustainability. As a Trustee, he supports the development of programs that bridge education with practical skills, enabling beneficiaries to achieve financial independence and long-term growth."
    },
    {
      name: "Jovi Okpodu, BA (Hons), MA",
      title: "Trustee",
      image: "https://images2.imgbox.com/bb/da/jkcKT01l_o.jpg",
      bio: "Jovi Okpodu is an accomplished academic, educator, and cultural scholar with over three decades of experience in higher education and institutional leadership.\n\nHe brings expertise in research, curriculum development, and knowledge systems. As a Trustee, he contributes to program design, educational strategy, and thought leadership, ensuring that OETF’s initiatives are intellectually grounded and aligned with global educational standards."
    },
    {
      name: "Kingsley Ovie Mukoro",
      title: "Trustee",
      image: "https://images2.imgbox.com/1c/e2/cZ9Wepl0_o.jpeg",
      bio: "Kingsley Ovie Mukoro is a technology entrepreneur and strategic leader with expertise in innovation, digital platforms, and organizational development.\n\nAs a Trustee, he contributes to strategic planning, technology integration, and program scalability. His focus is on leveraging technology to expand access to education, enhance operational efficiency, and drive measurable, long-term impact."
    },
    {
      name: "Efe (Doror) Okpodu Osauzo",
      title: "Trustee",
      image: "https://images2.imgbox.com/31/79/eFF8dAVs_o.jpeg",
      imagePosition: "object-top",
      bio: "Efe Okpodu Osauzo is an entrepreneur and community advocate with a strong focus on social impact and inclusive development.\n\nShe brings practical experience in grassroots engagement and women’s empowerment. As a Trustee, she supports initiatives that promote gender inclusion, community resilience, and equitable access to opportunities, particularly for women and underserved populations."
    },
    {
      name: "Odiri Iyotor",
      title: "Trustee",
      image: "https://images2.imgbox.com/da/c1/wcHRnOnl_o.jpeg",
      imagePosition: "object-top",
      bio: "Odiri Iyotor is an experienced educator and mentor with over 25 years of dedicated service in the field of education. She has built a career focused on student development, with particular emphasis on mentoring vulnerable and underserved learners to achieve their full potential. Her work reflects a deep commitment to inclusive education and the creation of supportive learning environments that foster academic, social, and personal growth.\n\nAs a Trustee of the Okpodu Education & Technology Foundation (OETF), she brings valuable frontline insight into educational systems and learner needs, particularly within underserved communities. She contributes to the Foundation’s educational strategy and program development, ensuring initiatives are practical, inclusive, and impact-driven, in alignment with OETF’s mission to expand access to knowledge, digital skills, and opportunity."
    },
    {
      name: "Emuobo Akpoyomare",
      title: "Trustee",
      image: "https://images2.imgbox.com/b2/f8/eSNPFWEY_o.jpeg",
      imagePosition: "object-top",
      bio: "Emuobo Akpoyomare is a seasoned businesswoman, accomplished farmer, and grassroots mentor with extensive experience in community development and economic empowerment. Her work spans enterprise and agriculture, where she has demonstrated strong leadership, resilience, and a deep understanding of local economic systems, particularly within underserved communities.\n\nAs a Trustee of the Okpodu Education & Technology Foundation (OETF), she brings a practical, community-centered perspective that strengthens the Foundation’s impact at the grassroots level. She contributes to ensuring that OETF’s programs remain inclusive, sustainable, and aligned with real community needs, with a strong focus on mentorship, self-reliance, and economic empowerment."
    },
    {
      name: "Fiddausi Asini",
      title: "Trustee",
      image: "https://images2.imgbox.com/07/aa/1RYpukDl_o.jpeg",
      bio: "Fiddausi Asini is an education professional with a strong commitment to learning, mentorship, and community development. Her academic background and professional experience have equipped her with a solid understanding of the role education plays in shaping individuals and strengthening communities.\n\nShe is passionate about supporting initiatives that expand access to knowledge, skills development, and opportunities for young people, particularly those in underserved communities. Through her work and engagement in education-focused initiatives, she has consistently demonstrated a dedication to helping others grow and succeed.\n\nAs a Trustee of the Okpodu Education & Technology Foundation (OETF), Fiddausi contributes to advancing the Foundation’s mission of promoting quality education and technology-driven learning opportunities for students and youth."
    },
    {
      name: "Balkisu Aliyu Muhammad",
      title: "Trustee",
      image: "https://images2.imgbox.com/e3/aa/ykh4niyO_o.jpeg",
      bio: "Balkisu Aliyu Muhammad holds a Bachelor of Education (B.Ed) in Adult Education/Economics and has built a career dedicated to educational leadership and student development. She currently serves as Head Teacher and Deputy Director at Modern Citadel International College in Jos, where she plays a key role in academic administration, staff coordination, and student mentorship.\n\nHer professional experience reflects a deep commitment to improving educational standards and fostering supportive learning environments that empower students to succeed academically and personally.\n\nAs a Trustee of the Okpodu Education & Technology Foundation (OETF), Balkisu brings valuable educational leadership and practical experience to the Foundation, supporting initiatives that expand access to quality education, digital skills, and lifelong learning opportunities."
    }
  ];

  return (
    <div className="pt-40 pb-24 px-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">Board of Trustees</h1>
        <div className="text-xl text-slate-600 max-w-3xl space-y-4">
          <p>
            The Board of Trustees of the Okpodu Education & Technology Foundation (OETF) provides strategic leadership, fiduciary oversight, and governance accountability to ensure the Foundation operates with transparency, effectiveness, and long-term sustainability.
          </p>
          <p>
            The Board is responsible for setting strategic direction, safeguarding the Foundation’s mission, ensuring regulatory compliance, and overseeing program impact in alignment with global best practices and sustainable development priorities.
          </p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {trustees.map((trustee, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-8 items-center text-center"
          >
            <div className="w-48 h-48 md:w-56 md:h-56 bg-primary/10 rounded-full shrink-0 flex items-center justify-center text-primary overflow-hidden border-4 border-white shadow-lg">
              {trustee.image ? (
                <img 
                  src={trustee.image} 
                  alt={trustee.name} 
                  className={`w-full h-full object-cover ${trustee.imagePosition || 'object-center'}`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Users size={64} />
              )}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-3">{trustee.name}</h3>
              <p className="text-accent font-bold mb-6 text-lg">{trustee.title}</p>
              <div className="text-slate-600 leading-relaxed space-y-4 whitespace-pre-line text-base">
                {trustee.bio}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ProgramsPage = () => {
  const IconMap: Record<string, any> = {
    GraduationCap,
    Zap,
    Target,
    Users,
    BookOpen
  };

  return (
    <div className="pt-40 pb-24 px-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">Our Focus Areas</h1>
        <p className="text-xl text-slate-600 max-w-3xl">
          OETF delivers its mission through focused program areas that support schools, introduce technology learning, and strengthen educational opportunities for students in underserved communities.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 mb-24">
        {PROGRAM_TRACKS.map((track, i) => {
          const IconComponent = IconMap[track.icon] || BookOpen;
          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col h-full hover:shadow-2xl transition-all duration-500"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8">
                <IconComponent size={40} />
              </div>
              {track.ageRange && (
                <span className="text-accent font-bold text-sm uppercase tracking-widest mb-2">{track.ageRange} Years</span>
              )}
              <h3 className="text-3xl font-bold text-primary mb-6">{track.title}</h3>
              <p className="text-lg text-slate-600 mb-8 flex-grow leading-relaxed whitespace-pre-line">
                {track.description}
              </p>
              <div className="pt-8 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ShieldCheck size={18} className="text-accent" />
                    <span>Hands-on Learning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ShieldCheck size={18} className="text-accent" />
                    <span>Expert Guidance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ShieldCheck size={18} className="text-accent" />
                    <span>Community Impact</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ShieldCheck size={18} className="text-accent" />
                    <span>Future Ready</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Call to Action Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-accent rounded-[4rem] p-12 md:p-20 text-primary text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mt-32"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">Get Involved to Transform Education</h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-primary/80">
            We believe lasting change happens through collaboration. Join us in expanding access to education and preparing the next generation with the tools to learn, grow, and lead.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="btn-primary px-10 py-4 text-lg shadow-xl">Get Involved</button>
            <button className="bg-white text-primary px-10 py-4 rounded-xl font-semibold transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] shadow-xl border border-primary/10">Contact Us</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EventsPage = () => (
  <div className="pt-40 pb-24 px-6 w-full">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">Upcoming Events</h1>
      <p className="text-xl text-slate-600 max-w-3xl">
        Join us for our upcoming workshops, seminars, and community outreach programs.
      </p>
    </motion.div>

    <div className="space-y-8">
      {[
        { title: "Tech Empowerment Summit 2026", date: "March 15, 2026", location: "Lagos, Nigeria", type: "Conference" },
        { title: "Youth Coding Bootcamp", date: "April 10-25, 2026", location: "Delta State, Nigeria", type: "Workshop" },
        { title: "Digital Literacy Seminar", date: "May 5, 2026", location: "Online", type: "Webinar" }
      ].map((event, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-accent/10 rounded-2xl flex flex-col items-center justify-center text-accent">
              <Calendar size={32} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">{event.type}</span>
              <h3 className="text-2xl font-bold text-primary mt-1">{event.title}</h3>
              <div className="flex flex-wrap gap-4 mt-2 text-slate-500 text-sm">
                <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> {event.date}</span>
              </div>
            </div>
          </div>
          <button className="btn-accent px-8 whitespace-nowrap">Volunteer</button>
        </motion.div>
      ))}
    </div>
  </div>
);



const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="pt-40 pb-24 px-6 w-full max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">Message Sent!</h1>
          <p className="text-xl text-slate-600 mb-10">
            Thank you for reaching out. Our team will review your message and get back to you shortly.
          </p>
          <button 
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ fullName: '', email: '', message: '' });
            }}
            className="btn-primary px-10 py-4 text-lg w-full"
          >
            Send Another Message
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 px-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-8">Contact Us</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          We would be glad to hear from you. Whether you are interested in partnership, support, or learning more about our work, please get in touch.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <p className="font-bold text-primary mb-6">
              For partnership inquiries, collaboration opportunities, or program information, please contact us.
            </p>
            <h3 className="text-2xl font-bold text-primary mb-6">Foundation Details</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-bold text-primary">Okpodu Education & Technology Foundation</p>
                  <p className="text-slate-600">69, Sapele Road, Oviore-Ovu. Delta State, Nigeria.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="font-bold text-primary">Phone</p>
                  <p className="text-slate-600">+234 803 223 3679</p>
                  <p className="text-slate-600">+234 806 846 4652</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="font-bold text-primary">Email</p>
                  <p className="text-slate-600">info@okpodufoundation.org</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary p-10 rounded-[3rem] text-white shadow-2xl">
          <h3 className="text-3xl font-bold mb-6">Send us a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input 
                type="text" 
                className={`w-full bg-white/10 border ${errors.fullName ? 'border-red-400' : 'border-white/20'} rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all`}
                placeholder="Your Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              {errors.fullName && <p className="text-red-400 text-xs mt-1 font-medium">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input 
                type="email" 
                className={`w-full bg-white/10 border ${errors.email ? 'border-red-400' : 'border-white/20'} rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all`}
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea 
                className={`w-full bg-white/10 border ${errors.message ? 'border-red-400' : 'border-white/20'} rounded-xl px-4 py-3 focus:outline-none focus:border-accent h-32 transition-all`}
                placeholder="How can we help?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
              {errors.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.message}</p>}
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-accent w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const PillarCard = ({ title, summary, full, icon: Icon }: { title: string, summary: string, full: React.ReactNode, icon: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white/10 rounded-3xl p-8 border border-white/10 hover:bg-white/15 transition-all h-full flex flex-col">
      <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="text-accent" size={28} />
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-white/80 mb-6 leading-relaxed">
        {summary}
      </p>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-white/10 text-white/70 space-y-4 text-sm">
              {full}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-auto pt-6 text-accent font-bold flex items-center gap-2 hover:gap-3 transition-all"
      >
        {isExpanded ? 'Show Less' : 'Read More'} <ChevronRight size={18} />
      </button>
    </div>
  );
};

const AboutUsPage = ({ setView }: { setView: (view: any) => void }) => (
  <div className="pt-40 pb-24 px-6 w-full max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">About Us</h1>
      <p className="text-xl text-slate-600 max-w-3xl">
        The Okpodu Education & Technology Foundation (OETF) is a mission-driven organization dedicated to expanding access to quality education and technology learning opportunities in underserved communities.
      </p>
    </motion.div>

    <div className="grid md:grid-cols-2 gap-12 mb-24">
      <div className="bg-primary rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
        <div className="relative z-10 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-accent" size={32} />
              <h3 className="text-3xl font-bold">Our Vision</h3>
            </div>
            <p className="text-white/80 text-lg leading-relaxed">
              To empower communities through education and technology by helping young people gain the knowledge, skills, and opportunities they need to build brighter futures.
            </p>
          </div>
          <div className="pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-accent" size={32} />
              <h3 className="text-3xl font-bold">Our Mission</h3>
            </div>
            <p className="text-white/80 text-lg leading-relaxed">
              To improve access to quality education, promote digital literacy, and support the development of future-ready students in Nigeria.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-accent rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-primary" size={32} />
            <h3 className="text-3xl font-bold">What We Believe</h3>
          </div>
          <p className="text-white/80 text-lg leading-relaxed">
            Every child deserves access to learning opportunities that inspire growth and opportunity. Students in underserved communities should not be left behind in an increasingly technology-driven world.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white mb-24 text-center">
      <h2 className="text-4xl font-bold mb-8">Meet Our Team</h2>
      <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
        Our dedicated team of educators, technologists, and community leaders work tirelessly to achieve our mission.
      </p>
      <button 
        onClick={() => setView('team')}
        className="btn-accent px-10 py-4 text-lg"
      >
        View Our Team
      </button>
    </div>
  </div>
);

const FoundersMessagePage = () => (
  <div className="pt-40 pb-24 px-6 w-full max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <h1 className="text-4xl md:text-5xl font-bold text-primary mb-12 text-center">A Message from the Okpodu Family</h1>
      
      <div className="grid md:grid-cols-3 gap-12 items-start">
        <div className="md:col-span-1">
          <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-square mb-6">
            <img 
              src="https://images2.imgbox.com/fa/cb/3oUm25ru_o.jpeg" 
              alt="Chairman Akpesiri Emmanuel Okpodu" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-primary">Akpesiri Emmanuel Okpodu</h3>
            <p className="text-slate-500">Chairman, Board of Trustees</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8 text-xl text-slate-600 leading-relaxed">
          <p>
            The Okpodu Education & Technology Foundation was established to honor the enduring legacy of Frederick Menukun Asini Okpodu, whose life was defined by discipline, service, and a deep commitment to family and community.
          </p>
          <p>
            Throughout his life, he believed strongly in the transformative power of education and the responsibility each generation holds to create opportunities for those who follow.
          </p>
          <p>
            Alongside him stood his brother, William Eyimofe Asini Okpodu, whose life also reflected perseverance, leadership, and dedication to the wellbeing of others. Through their example, they demonstrated the importance of hard work, integrity, and service to community.
          </p>
          <p>
            Their values continue to inspire the Okpodu family and serve as the guiding foundation for the work of the Okpodu Education & Technology Foundation.
          </p>
          <p>
            The Foundation was created with a simple but meaningful purpose: to expand access to education and technology for communities that deserve greater opportunity.
          </p>
          <p>
            In many parts of the world, particularly in underserved communities, young people possess tremendous potential but lack access to the resources, exposure, and learning opportunities that can help unlock that potential.
          </p>
          <p>
            Education and technology have become powerful pathways to opportunity, and expanding access to these tools is essential for building stronger communities and brighter futures.
          </p>
          <p>
            Through the work of OETF, we aim to support educational initiatives, introduce digital learning opportunities, and encourage young people to pursue knowledge, innovation, and leadership.
          </p>
          <p>
            As a family, we remain committed to carrying forward the values that shaped our father’s life by supporting programs that empower future generations through education and technology.
          </p>
          <p>
            Together with our partners, educators, and communities, we look forward to expanding the impact of this mission for years to come.
          </p>
          
          <div className="pt-12 border-t border-slate-100">
            <p className="font-bold text-primary text-2xl">
              The Okpodu Family
            </p>
            <p className="text-slate-500 font-medium">
              Okpodu Education & Technology Foundation
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

const LegacyPage = ({ setView }: { setView: (view: any) => void }) => (
  <div className="pt-40 pb-24 px-6 w-full max-w-4xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      <h1 className="text-4xl md:text-5xl font-bold text-primary mb-12 leading-tight">
        The Legacy of Frederick Menukun Asini Okpodu and William Eyimofe Asini Okpodu
      </h1>

      <div className="text-xl text-slate-600 leading-relaxed overflow-hidden">
        {/* Frederick - Top Left */}
        <div className="float-left mr-8 mb-6 w-full md:w-1/3 max-w-[260px]">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl mb-4">
            <img 
              src="https://images2.imgbox.com/50/dd/rjEw3fKW_o.jpeg" 
              alt="Frederick Menukun Asini Okpodu" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="text-lg font-bold text-primary leading-tight">Frederick Menukun Asini Okpodu</h3>
          <p className="text-slate-500 font-semibold text-sm">July 16, 1919 – Jan 12, 2004</p>
        </div>

        <p className="mb-8">
          The Okpodu Education & Technology Foundation was established to honor the enduring legacy of Frederick Menukun Asini Okpodu.
        </p>
        <p className="mb-8">
          Born in Ovwere-Ovu in Agbon Kingdom, Delta State, Frederick Okpodu believed deeply in the transformative power of education and the importance of creating opportunities for future generations.
        </p>
        <p className="mb-8">
          Alongside him stood his brother William Eyimofe Asini Okpodu.
        </p>

        {/* William - Bottom Right */}
        <div className="float-right ml-8 mb-6 mt-4 w-full md:w-1/3 max-w-[260px]">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl mb-4">
            <img 
              src="https://images2.imgbox.com/12/66/npPlcfok_o.jpeg" 
              alt="William Eyimofe Asini Okpodu" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="text-lg font-bold text-primary leading-tight">William Eyimofe Asini Okpodu</h3>
          <p className="text-slate-500 font-semibold text-sm">March 16, 1926 – Dec 9, 2019</p>
        </div>

        <p className="mb-8">
          William spent more than three decades working within Nigeria’s historic mining industry on the Jos Plateau, where his discipline, leadership, and dedication earned him deep respect among colleagues and community members.
        </p>
        <p className="mb-8">
          Together, the lives of these two brothers embodied values of hard work, resilience, responsibility, and community service.
        </p>
        <p className="font-medium text-primary pt-8 border-t border-slate-100 mb-8">
          The Okpodu Education & Technology Foundation carries forward these values by expanding educational opportunities and introducing technology-driven learning to new generations.
        </p>
      </div>

      <div className="mt-20 pt-12 border-t border-slate-100 flex flex-wrap gap-6">
        <button 
          onClick={() => setView('partner')} 
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Get Involved
        </button>
        <button 
          onClick={() => setView('contact')} 
          className="border-2 border-primary text-primary px-8 py-4 rounded-2xl font-bold hover:bg-primary/5 transition-all"
        >
          Contact Us
        </button>
      </div>
    </motion.div>
  </div>
);

const ImpactPage = () => {
  const metrics = [
    { label: "Students Reached", value: "10,000+", target: "by Dec, 2031", icon: Users },
    { label: "Schools Supported", value: "50+", target: "by Dec, 2031", icon: GraduationCap },
    { label: "Community Programs Delivered", value: "30+", target: "by Dec, 2031", icon: Target },
    { label: "Youth Introduced to Technology Learning", value: "5,000+", target: "by Dec, 2031", icon: Zap },
  ];

  return (
    <div className="pt-40 pb-24 px-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">Our Impact & Vision</h1>
        <p className="text-xl text-slate-600 max-w-3xl mb-8">
          OETF is committed to creating measurable improvements in education and technology access within underserved communities. Here are our targets for the next phase of our journey.
        </p>
        
        <div className="bg-primary/5 border-l-4 border-accent p-8 rounded-r-3xl mb-16">
          <h2 className="text-2xl font-bold text-primary mb-4">Commitment to Measurement</h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            OETF is committed to measuring and reporting outcomes that demonstrate real improvements in educational access, digital literacy, and student opportunity.
          </p>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-center hover:shadow-2xl transition-all duration-500 group"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
              <metric.icon size={32} />
            </div>
            <p className="text-4xl font-black text-primary mb-2">{metric.value}</p>
            <p className="text-slate-900 font-bold mb-1">{metric.label}</p>
            <p className="text-accent font-bold text-sm bg-accent/10 py-1 px-3 rounded-full inline-block">{metric.target}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const DonationSuccessPage = ({ setView }: { setView: (view: any) => void }) => {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setView('landing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setView]);

  return (
    <div className="pt-40 pb-24 px-6 w-full max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100"
      >
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-4">Thank You!</h1>
        <p className="text-xl text-slate-600 mb-6">
          Your generous donation has been received. You're helping us transform education and technology access in underserved communities.
        </p>
        <p className="text-slate-400 mb-10">
          Redirecting to home in {countdown} seconds...
        </p>
        <button 
          onClick={() => setView('landing')}
          className="btn-primary px-10 py-4 text-lg w-full"
        >
          Back to Home Now
        </button>
      </motion.div>
    </div>
  );
};

const VolunteerPage = ({ setView }: { setView: (view: any) => void }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    type: 'volunteer',
    expertise: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  if (isSubmitted) {
    return (
      <div className="pt-40 pb-24 px-6 w-full max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100"
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">Registration Received!</h1>
          <p className="text-xl text-slate-600 mb-10">
            Thank you for your interest in working with us. Our team will review your information and get back to you shortly.
          </p>
          <button 
            onClick={() => setView('landing')}
            className="btn-primary px-10 py-4 text-lg w-full"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 px-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-8">Volunteer or Collaborate</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Join our mission to transform education. We welcome individuals and organizations who can contribute expertise, resources, and passion to strengthen our programs.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <h3 className="text-2xl font-bold text-primary mb-6">Why Join Us?</h3>
            <ul className="space-y-6">
              {[
                { title: "Make an Impact", desc: "Directly contribute to improving education for students in underserved communities." },
                { title: "Share Your Expertise", desc: "Use your professional skills to mentor, teach, or support our operations." },
                { title: "Community Growth", desc: "Be part of a dedicated network of people working for positive change in Nigeria." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-primary">{item.title}</p>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary p-10 rounded-[3rem] text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Have Questions?</h3>
            <p className="text-white/70 mb-8">
              If you're unsure how you can help or want to discuss a specific collaboration idea, please reach out to us.
            </p>
            <button 
              onClick={() => setView('contact')}
              className="btn-accent w-full py-4 text-lg"
            >
              Contact Us
            </button>
          </div>
        </div>

        <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100">
          <h3 className="text-3xl font-bold text-primary mb-8">Registration Form</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input 
                  required
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="+234..."
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">I want to join as</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="volunteer">Individual Volunteer</option>
                  <option value="collaborator">Collaborator / Organization</option>
                  <option value="mentor">Mentor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Area of Expertise / Interest</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="e.g. Teaching, Web Development, Fundraising"
                value={formData.expertise}
                onChange={(e) => setFormData({...formData, expertise: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Message (Optional)</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all h-32"
                placeholder="Tell us a bit more about how you'd like to help..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>

            <button 
              disabled={isProcessing}
              type="submit" 
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Processing...' : 'Submit Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const RecurringConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  amount, 
  frequency,
  donorName,
  donorEmail
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  amount: number, 
  frequency: string,
  donorName: string,
  donorEmail: string
}) => {
  const frequencyLabels: Record<string, string> = {
    'monthly': 'month',
    'quarterly': 'quarter',
    'annually': 'year'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Confirm Recurring Donation</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Subscription Summary</p>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
              <div className="pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-primary" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Donor Details</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <p className="text-base font-bold text-slate-900">{donorName}</p>
                  <p className="text-sm text-slate-500">{donorEmail}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Donation Amount</span>
                <span className="text-xl font-black text-primary">₦{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Frequency</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full">
                  <Zap size={12} />
                  <span className="text-xs font-bold capitalize">{frequency}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              You are setting up a recurring donation of <span className="font-bold text-slate-900">₦{amount.toLocaleString()}</span> to be charged every <span className="font-bold text-slate-900">{frequencyLabels[frequency] || 'period'}</span>. You can cancel this subscription at any time through your bank or by contacting us.
            </p>

            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all"
              >
                Confirm & Pay
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const DonationPage = ({ setView }: { setView: (view: any) => void }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState(auth.currentUser?.displayName || '');
  const [donorEmail, setDonorEmail] = useState(auth.currentUser?.email || '');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (!donorName) setDonorName(user.displayName || '');
        if (!donorEmail) setDonorEmail(user.email || '');
      }
    });
    return () => unsubscribe();
  }, [donorName, donorEmail]);

  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'quarterly' | 'annually'>('one-time');
  const [planCode, setPlanCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState((new Date()).getTime().toString());

  const presets = [5000, 10000, 20000, 50000, 100000];

  const publicKey = (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || '';

  const config = React.useMemo(() => ({
    reference: paymentReference,
    email: donorEmail,
    amount: (Number(amount) || Number(customAmount)) * 100, // Paystack uses kobo
    publicKey: publicKey,
    currency: 'NGN',
    plan: planCode || undefined
  }), [paymentReference, donorEmail, amount, customAmount, publicKey, planCode]);

  const initializePayment = usePaystackPayment(config);

  useEffect(() => {
    // Only trigger payment if we are processing AND (it's one-time OR we have a plan code for recurring)
    if (isProcessing && (frequency === 'one-time' || planCode)) {
      if (!publicKey) {
        alert("Payment system is not fully configured (Missing Public Key).");
        setIsProcessing(false);
        return;
      }
      // @ts-ignore
      initializePayment(onSuccess, onClose);
    }
  }, [planCode, isProcessing]);

  const onSuccess = (reference: any) => {
    // Verify on server
    fetch('/api/donations/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: reference.reference })
    }).then(() => {
      setIsProcessing(false);
      setPlanCode(null);
      setView('donation_success');
    });
  };

  const onClose = () => {
    setIsProcessing(false);
    setPlanCode(null);
    console.log('closed');
  };

  const startDonationProcess = async (finalAmount: number) => {
    if (!donorEmail || !donorName) {
      alert("Please provide your name and email.");
      return;
    }

    const newRef = (new Date()).getTime().toString();
    setPaymentReference(newRef);
    setIsProcessing(true);
    setPlanCode(null);

    try {
      // Initiate on server
      const response = await fetch('/api/donations/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName,
          donorEmail,
          amount: finalAmount,
          reference: newRef,
          frequency
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server failed to initiate donation");
      }

      const data = await response.json();
      if (data.plan) {
        setPlanCode(data.plan);
      } else {
        // For one-time, the useEffect will trigger payment because isProcessing is now true
      }
    } catch (err: any) {
      console.error("Initiation failed", err);
      setIsProcessing(false);
      alert(`Failed to initiate donation: ${err.message || "Please try again."}`);
    }
  };

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = amount || Number(customAmount);
    if (!finalAmount || finalAmount <= 0) {
      alert("Please select or enter a valid donation amount.");
      return;
    }
    if (!donorName || !donorEmail) {
      alert("Please provide your name and email.");
      return;
    }

    if (frequency !== 'one-time') {
      setShowConfirmModal(true);
    } else {
      startDonationProcess(finalAmount);
    }
  };

  return (
    <div className="pt-40 pb-24 px-6 w-full max-w-4xl mx-auto">
      <RecurringConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => startDonationProcess(amount || Number(customAmount))}
        amount={amount || Number(customAmount)}
        frequency={frequency}
        donorName={donorName}
        donorEmail={donorEmail}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">Support Our Mission</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Your donation directly supports our programs, providing students with access to technology, quality education, and mentorship.
        </p>
      </motion.div>

      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100">
        <form onSubmit={handleDonate} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-accent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-accent"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-4">Donation Frequency</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'one-time', label: 'One-time' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'quarterly', label: 'Quarterly' },
                { id: 'annually', label: 'Annually' }
              ].map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setFrequency(freq.id as any)}
                  className={`py-3 rounded-xl font-bold transition-all border-2 ${frequency === freq.id ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-slate-100 hover:border-accent'}`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
            {frequency !== 'one-time' && (
              <p className="mt-4 text-sm text-slate-500 flex items-center gap-2">
                <Zap size={16} className="text-accent" />
                You will be charged this amount {frequency === 'monthly' ? 'every month' : frequency === 'quarterly' ? 'every 3 months' : 'every year'}.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-4">Select Donation Amount (₦)</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`py-3 rounded-xl font-bold transition-all border-2 ${amount === preset ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-slate-100 hover:border-accent'}`}
                >
                  ₦{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">Or Enter Custom Amount (₦)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
              <input 
                type="number" 
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount('');
                }}
                className="w-full pl-10 pr-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:border-accent text-lg font-bold"
                placeholder="e.g. 1,000,000 (You can donate more than the presets)"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isProcessing}
            className="btn-accent w-full py-5 text-xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : (
              <>
                Donate Now <CreditCard size={24} />
              </>
            )}
          </button>

          <p className="text-center text-slate-400 text-sm">
            Secure payment powered by Paystack
          </p>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'team' | 'trustees' | 'programs_page' | 'events' | 'blog' | 'partner' | 'about_us' | 'gallery' | 'what_we_do' | 'where_we_work' | 'admin' | 'locality_profile' | 'school_profile' | 'contact' | 'legacy' | 'founders_message' | 'impact' | 'donation' | 'donation_success' | 'volunteer'>('landing');
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [galleryMedia, setGalleryMedia] = useState<GalleryMedia[]>(GALLERY_MEDIA);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const media = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryMedia[];
      
      if (media.length > 0) {
        setGalleryMedia(media);
      } else {
        setGalleryMedia(GALLERY_MEDIA);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const renderContent = () => {
    switch (view) {
      case 'impact': return (
        <>
          <SEO title="Our Impact" description="OETF is committed to creating measurable improvements in education and technology access within underserved communities." />
          <ImpactPage />
        </>
      );
      case 'team': return (
        <>
          <SEO title="Our Team" description="Meet the leadership and team behind Okpodu Education & Technology Foundation." />
          <TeamPage />
        </>
      );
      case 'trustees': return (
        <>
          <SEO title="Governance & Trustees" description="The Board of Trustees providing strategic vision and oversight for OETF." />
          <TrusteesPage />
        </>
      );
      case 'programs_page': return (
        <>
          <SEO title="Our Programs" description="Explore our tech tracks, academic support, and mentorship programs for Nigerian youth." />
          <ProgramsPage />
        </>
      );
      case 'events': return (
        <>
          <SEO title="Upcoming Events" description="Join our workshops, seminars, and community outreach programs." />
          <EventsPage />
        </>
      );
      case 'blog': return (
        <>
          <SEO title="Foundation Blog" description="Insights, stories, and updates from our mission to transform education in Nigeria." />
          <BlogPage />
        </>
      );
      case 'gallery': return (
        <>
          <SEO title="Media Gallery" description="Capturing moments of impact, learning, and community growth across Nigeria." />
          <GalleryPage images={galleryMedia} />
        </>
      );
      case 'what_we_do': return (
        <>
          <SEO title="What We Do" description="Bridging the gap between traditional education and the digital future." />
          <WhatWeDoPage />
        </>
      );
      case 'where_we_work': return (
        <>
          <SEO title="Where We Work" description="Our roots are deep in the communities we serve, focusing on underserved areas in Nigeria." />
          <WhereWeWorkPage setView={setView} setSelectedId={setSelectedId} />
        </>
      );
      case 'locality_profile': return (
        <>
          <SEO title="Locality Profile" />
          <LocalityProfilePage id={selectedId || ''} onBack={() => setView('where_we_work')} onSchoolClick={(id) => { setSelectedId(id); setView('school_profile'); }} />
        </>
      );
      case 'school_profile': return (
        <>
          <SEO title="School Profile" />
          <SchoolProfilePage id={selectedId || ''} onBack={() => setView('where_we_work')} />
        </>
      );
      case 'volunteer': return (
        <>
          <SEO title="Volunteer With Us" description="Register as a volunteer or collaborator with Okpodu Education & Technology Foundation." />
          <VolunteerPage setView={setView} />
        </>
      );
      case 'admin': return (
        <>
          <SEO title="Admin Portal" />
          <AdminPortal galleryMedia={galleryMedia} setGalleryMedia={setGalleryMedia} />
        </>
      );
      case 'about_us': return (
        <>
          <SEO title="About Us" description="Learn about the Okpodu Education & Technology Foundation's mission, vision, and values." />
          <AboutUsPage setView={setView} />
        </>
      );
      case 'legacy': return (
        <>
          <SEO title="Our Legacy" description="The dual legacy of Frederick and William Okpodu — a tradition of education and leadership." />
          <LegacyPage setView={setView} />
        </>
      );
      case 'founders_message': return (
        <>
          <SEO title="Founder's Message" description="A message from the founder of Okpodu Education & Technology Foundation." />
          <FoundersMessagePage />
        </>
      );
      case 'contact': return (
        <>
          <SEO title="Contact Us" description="Get in touch with the Okpodu Education & Technology Foundation." />
          <ContactPage />
        </>
      );
      case 'donation': return (
        <>
          <SEO title="Donate" description="Support the Okpodu Education & Technology Foundation." />
          <DonationPage setView={setView} />
        </>
      );
      case 'donation_success': return (
        <>
          <SEO title="Thank You" />
          <DonationSuccessPage setView={setView} />
        </>
      );
      case 'partner': return (
        <>
          <SEO title="Get Involved" description="Partner with us, support our work, or volunteer to transform education in Nigeria." />
          <div className="pt-40 pb-24 px-6 w-full max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-primary mb-8">Get Involved</h1>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                Transforming education requires collaboration. OETF welcomes individuals, schools, partners, and supporters who share our commitment to expanding access to learning and opportunity.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  title: "Partner With Us",
                  description: "We welcome partnerships with schools, educators, community organizations, and institutions that align with our mission.",
                  icon: Handshake,
                  action: () => setView('contact'),
                  actionText: "Contact Us"
                },
                {
                  title: "Support Our Work",
                  description: "Your support helps expand educational opportunities and strengthen learning environments for students.",
                  icon: Heart,
                  action: () => setView('contact'),
                  actionText: "Contact Us"
                },
                {
                  title: "Volunteer or Collaborate",
                  description: "We welcome people and organizations that can contribute expertise, resources, and ideas to strengthen our programs.",
                  icon: Users,
                  action: () => setView('volunteer'),
                  actionText: "Register Now"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {item.description}
                  </p>
                  <button 
                    onClick={item.action}
                    className="mt-auto text-primary font-bold hover:text-accent transition-colors flex items-center gap-2"
                  >
                    {item.actionText} <ChevronRight size={18} />
                  </button>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row justify-center gap-6 mb-16"
            >
              <button 
                onClick={() => setView('donation')}
                className="btn-accent px-10 py-4 text-lg flex items-center justify-center gap-2 shadow-xl"
              >
                Donate Now <CreditCard size={20} />
              </button>
              <button 
                onClick={() => setView('contact')}
                className="bg-white text-primary px-10 py-4 rounded-xl font-semibold transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] shadow-xl border border-primary/10 flex items-center justify-center gap-2"
              >
                Contact Us <ChevronRight size={20} />
              </button>
            </motion.div>

            <div className="bg-primary p-12 rounded-[3rem] text-white text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to work with us?</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Please email us at <span className="text-accent font-bold">info@okpodufoundation.org</span> to discuss how we can work together.
              </p>
              <button 
                onClick={() => setView('contact')}
                className="btn-accent px-10 py-4 text-lg"
              >
                Contact Us
              </button>
            </div>
          </div>
        </>
      );
      default: return (
        <>
          <SEO />
          <Hero setView={setView} />
          <StatsBar />
          
          {/* Legacy Inspiration Section */}
          <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="w-full max-w-4xl mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-8">A Legacy That Inspires Generations</h2>
                <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                  <p>
                    The Okpodu Education & Technology Foundation was established in honor of the enduring legacy of Frederick Menukun Asini Okpodu and the values of discipline, education, and service that defined his life.
                  </p>
                  <p>
                    Alongside his brother William Eyimofe Asini Okpodu, their lives reflected a deep commitment to hard work, community responsibility, and the belief that education creates pathways to opportunity.
                  </p>
                  <p>
                    Today, the Foundation continues this legacy by expanding access to education, introducing technology learning, and empowering young people to build brighter futures.
                  </p>
                  <p>
                    Their values continue through the work of the Okpodu Education & Technology Foundation, which seeks to expand educational opportunity and prepare future generations for a technology-driven world.
                  </p>
                </div>
                <div className="mt-10 p-8 bg-white rounded-[2rem] border-t-4 border-accent shadow-sm max-w-2xl">
                  <p className="text-xl text-primary italic font-medium">
                    “His life continues to inspire generations in whose memory the Okpodu Education & Technology Foundation was established.”
                  </p>
                </div>
                <div className="mt-10">
                  <button 
                    onClick={() => setView('legacy')}
                    className="btn-primary px-8 py-3 flex items-center gap-2 group"
                  >
                    Learn About the Legacy <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* About Summary */}
          <section id="about" className="py-24 bg-slate-50">
            <div className="w-full max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-3 gap-16 items-start">
                <div className="lg:col-span-2 space-y-8">
                  <h2 className="text-4xl text-primary mb-6">Building Opportunities for the Next Generation</h2>
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative">
                      <img 
                        src="https://images2.imgbox.com/b3/a4/aAQVaHgi_o.jpeg" 
                        alt="Students in Nigeria engaged in collaborative classroom learning supported by OETF" 
                        className="rounded-[2rem] shadow-2xl relative z-10"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
                    </div>
                    <div className="space-y-6">
                      <p className="text-lg text-slate-600 leading-relaxed">
                        The Okpodu Education & Technology Foundation (OETF) is committed to improving access to education, strengthening learning environments, and preparing young people with the knowledge and skills needed to thrive in a changing world.
                      </p>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        Through school support, digital learning, STEM education, and community partnerships, OETF works to empower students and create lasting impact in underserved communities.
                      </p>
                      <div className="flex flex-wrap gap-6 pt-4">
                        <button 
                          onClick={() => setView('about_us')}
                          className="flex items-center gap-2 font-bold text-primary hover:text-accent transition-colors group"
                        >
                          Read Our Full Story <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                  <div className="relative z-10 space-y-10">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Target className="text-accent" size={24} />
                        <h3 className="text-xl font-bold">Our Vision</h3>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">
                        To empower communities through education and technology by helping young people gain the knowledge, skills, and opportunities they need to build brighter futures.
                      </p>
                    </div>
                    <div className="pt-8 border-t border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Zap className="text-accent" size={24} />
                        <h3 className="text-xl font-bold">Our Mission</h3>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">
                        To improve access to quality education, promote digital literacy, and support the development of future-ready students in Nigeria.
                      </p>
                    </div>
                    <div className="pt-8 border-t border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="text-accent" size={24} />
                        <h3 className="text-xl font-bold">Our Values</h3>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Excellence, Integrity, Community, and Innovation in everything we do.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ProgramSection setView={setView} />

          {/* Section 2: Why It Matters */}
          <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="w-full max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="order-2 md:order-1 relative"
                >
                  <img 
                    src="https://images2.imgbox.com/8b/a6/CYuPVTyf_o.jpeg" 
                    alt="A classroom environment in an underserved community highlighting the need for educational support" 
                    className="block w-[60%] mx-auto rounded-[2rem] shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="order-1 md:order-2"
                >
                  <h2 className="text-4xl text-primary mb-6">Why It Matters</h2>
                  <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                    <p>
                      Many students in underserved communities face barriers to quality education, limited learning resources, and little exposure to technology-based opportunities.
                    </p>
                    <p>
                      OETF exists to help bridge these gaps by supporting schools, strengthening learning environments, and preparing young people for future possibilities.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>


          {/* Call to Action Section */}
          <section className="py-20 bg-white">
            <div className="w-full max-w-7xl mx-auto px-6">
              <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -ml-32 -mt-32"></div>
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl text-white mb-6">Get Involved to Transform Education</h2>
                  <p className="text-xl text-white/70 mb-10 max-w-3xl mx-auto">
                    We believe lasting change happens through collaboration. Join us in expanding access to education and preparing the next generation with the tools to learn, grow, and lead.
                  </p>
                  <div className="flex flex-wrap justify-center gap-6">
                    <button 
                      onClick={() => setView('partner')}
                      className="btn-accent text-lg px-10"
                    >
                      Get Involved
                    </button>
                    <button 
                      onClick={() => setView('contact')}
                      className="bg-white text-primary px-10 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all"
                    >
                      Contact Us
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar setView={setView} currentView={view} />
      
      {renderContent()}

      <Footer setView={setView} />
    </div>
  );
}
