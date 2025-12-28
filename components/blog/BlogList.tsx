
import React, { useState } from 'react';
import { BlogPost } from '../../types';
import { Clock, ArrowRight, Tag, Heart, Zap, BookOpen, Brain } from 'lucide-react';

interface BlogListProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
}

export const BlogList: React.FC<BlogListProps> = ({ posts, onSelectPost }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    { id: 'All', label: 'すべて', icon: BookOpen },
    { id: 'Mindset', label: 'メンタル・心構え', icon: Heart },
    { id: 'Technique', label: '技術・メソッド', icon: Zap },
    { id: 'Science', label: '脳科学・理論', icon: Brain },
  ];

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">継続のサプリメント</h2>
          <p className="text-slate-500 mt-1">
            辛いとき、壁にぶつかったときに効く「言葉」と「知識」
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <cat.icon size={16} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div 
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col h-full hover:-translate-y-1 duration-300"
          >
            {/* Image */}
            <div className="h-48 overflow-hidden bg-slate-100 relative">
              {post.imageUrl ? (
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                  <Tag size={48} />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                  post.category === 'Mindset' ? 'bg-rose-100 text-rose-700' :
                  post.category === 'Technique' ? 'bg-emerald-100 text-emerald-700' :
                  post.category === 'Science' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-3 flex-1 leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={14} />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  読む <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p>記事が見つかりませんでした。</p>
        </div>
      )}
    </div>
  );
};
