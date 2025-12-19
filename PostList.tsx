
import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db } from '../firebase.ts';
import { Thread, Post } from '../types.ts';

interface PostListProps {
  thread: Thread;
  currentRoom: string;
  onBack: () => void;
  onShowImage: (src: string) => void;
}

const PostList: React.FC<PostListProps> = ({ thread, currentRoom, onBack, onShowImage }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, currentRoom, thread.id, "posts"), orderBy("created_at", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    });
    return () => unsub();
  }, [thread.id, currentRoom]);

  const convertText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline opacity-80 hover:opacity-100">{part}</a>;
      }
      const anchorRegex = />>(\d+)/g;
      return part.split(anchorRegex).map((subPart, j) => {
        if (subPart.match(/^\d+$/)) {
          return <span key={j} className="text-yellow-200 font-bold cursor-pointer hover:underline">>>{subPart}</span>;
        }
        return subPart;
      });
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
        <button 
          onClick={onBack}
          className="mb-4 text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-1 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 戻る
        </button>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{thread.title}</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">{thread.detail}</p>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
              {thread.icon ? (
                <img src={thread.icon} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px]">
                  {thread.memberId[0]}
                </div>
              )}
            </div>
            <span className="text-slate-700">{thread.memberId}</span>
          </div>
          <span>•</span>
          <span>{thread.created_at?.toDate().toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-6 mb-12" ref={scrollRef}>
        {posts.map((post, idx) => {
          // 色指定がない、または白の場合はデフォルトの青系にする
          const isCustomColor = post.color && post.color !== '#ffffff';
          const cardBg = isCustomColor ? post.color : '#1e88e5';
          
          return (
            <div key={post.id} className="group animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200 shadow-sm overflow-hidden user-icon-container">
                  {post.icon ? (
                    <img src={post.icon} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                      {post.memberId[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-bold text-slate-700 truncate">{post.memberId}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">#{post.index || idx + 1}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {post.created_at?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div 
                    className="post-card p-4 shadow-md relative overflow-hidden"
                    style={{ backgroundColor: cardBg, color: '#ffffff' }}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-sm relative z-10 font-medium">
                      {convertText(post.body)}
                    </p>
                    {post.image && (
                      <div className="mt-3 relative z-10">
                        <img 
                          src={post.image} 
                          alt="添付画像" 
                          onClick={() => onShowImage(post.image!)}
                          className="rounded-xl max-h-80 cursor-zoom-in hover:opacity-95 transition-opacity border border-white/30 shadow-sm" 
                        />
                      </div>
                    )}
                    {/* 背景にうっすら装飾 */}
                    <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none text-2xl font-black">
                      #{post.index || idx + 1}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostList;
