
import React from 'react';
import { BlogPost } from '../../types';
import { X, Clock, Calendar, Share2, Tag } from 'lucide-react';

interface BlogPostProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BlogPostModal: React.FC<BlogPostProps> = ({ post, isOpen, onClose }) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header Image Area */}
        <div className="relative h-64 shrink-0 bg-slate-100">
          {post.imageUrl && (
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="inline-block bg-indigo-600/90 text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wider">
              {post.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
              {post.title}
            </h2>
            <div className="flex items-center gap-4 text-xs md:text-sm text-slate-200">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{post.readTime} read</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-6 md:p-8">
          <div 
            className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <div className="flex gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tags:</span>
            <div className="flex gap-1">
              <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">Motivation</span>
              <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">Growth</span>
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};
