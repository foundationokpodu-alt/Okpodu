import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, User, Tag, 
  ArrowRight, MessageCircle, Share2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { BlogPost } from '../types';

const BlogPage = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Compute unique categories from all posts
  const categories = ['All', ...Array.from(new Set(posts.flatMap(post => {
    const tags = Array.isArray(post.tags) ? post.tags : ((post.tags as any) || '').split(',');
    return tags.map((t: string) => t.trim()).filter(Boolean);
  })))];

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(post => {
        const tags = Array.isArray(post.tags) ? post.tags : ((post.tags as any) || '').split(',');
        return tags.map((t: string) => t.trim()).includes(activeCategory);
      });

  useEffect(() => {
    const q = query(
      collection(db, 'blogs'), 
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setPosts(postList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'blogs');
    });

    return () => unsubscribe();
  }, []);

  if (selectedPost) {
    return (
      <div className="pt-32 pb-24 px-6 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-primary font-bold mb-8 hover:translate-x-1 transition-transform"
          >
            <ChevronLeft size={20} /> Back to Blog
          </button>
          
          <img 
            src={selectedPost.image_url} 
            alt={selectedPost.title} 
            width="800"
            height="400"
            className="w-full h-[400px] object-cover rounded-[15px] shadow-2xl mb-12"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          
          <div className="flex flex-wrap gap-4 mb-6">
            {selectedPost.tags.map((tag: string) => (
              <span key={tag} className="px-4 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">{selectedPost.title}</h1>
          
          <div className="flex items-center gap-6 mb-12 border-y border-slate-100 py-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedPost.author}</p>
                <p className="text-xs text-slate-500">Author</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-400" />
              <p className="text-sm text-slate-500">{selectedPost.date}</p>
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed mb-16">
            <p className="text-xl font-medium text-slate-800 mb-6">{selectedPost.excerpt}</p>
            <p>{selectedPost.content}</p>
            {/* More content would go here */}
          </div>

          <section className="border-t border-slate-100 pt-16">
            <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <MessageCircle size={24} /> Comments (0)
            </h3>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-8">
              <p className="text-slate-500 italic mb-4">Be the first to share your thoughts!</p>
              <textarea 
                placeholder="Write a comment..." 
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mb-4 h-32"
              ></textarea>
              <button className="btn-primary">Post Comment</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-primary mb-4">Foundation Blog</h1>
            <p className="text-xl text-slate-600">Insights, stories, and updates from our mission to transform education in Nigeria.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </header>

        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === category 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[15px] overflow-hidden shadow-xl border border-slate-100 flex flex-col animate-pulse">
                <div className="aspect-video bg-slate-200" />
                <div className="p-8 space-y-4">
                  <div className="flex gap-4">
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                  <div className="h-20 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-1/3 pt-4" />
                </div>
              </div>
            ))
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[15px] overflow-hidden shadow-xl border border-slate-100 flex flex-col group cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    width="800"
                    height="450"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1 bg-white/90 backdrop-blur-md text-primary rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      {Array.isArray(post.tags) ? post.tags[0] : (post.tags as string).split(',')[0]}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                    <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4 group-hover:text-accent transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 mb-8 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-primary font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                      Read More <ArrowRight size={18} />
                    </span>
                    <div className="flex gap-3 text-slate-300">
                      <Share2 size={18} className="hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500">No blog posts found.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-16">
          <button className="p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-primary hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {[1, 2, 3].map(n => (
              <button key={n} className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${n === 1 ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
                {n}
              </button>
            ))}
          </div>
          <button className="p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-primary hover:text-white transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
