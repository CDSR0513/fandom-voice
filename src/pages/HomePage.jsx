import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Heart, Edit3, Sparkles, ChevronDown, Sun, Moon, Monitor } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [likedPosts, setLikedPosts] = useState(JSON.parse(localStorage.getItem('likedPosts') || '[]'));
  
  // 테마 상태: 'auto', 'light', 'dark'
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'auto');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const navigate = useNavigate();
  const categories = ['전체', '소속사 피드백 요청', '연예인 피드백 요청', '악플 대책 강구', '홍보 대책 강구', '기획 대책 강구', '기타'];

  useEffect(() => { 
    fetchPosts();
    applyTheme();
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    localStorage.setItem('themeMode', themeMode);
  }, [likedPosts, themeMode]);

  const applyTheme = () => {
    if (themeMode === 'auto') {
      const hour = new Date().getHours();
      setIsDarkMode(hour < 6 || hour >= 19); // 19시~06시 다크
    } else {
      setIsDarkMode(themeMode === 'dark');
    }
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error) {
      const mappedData = (data || []).map(p => {
        let cat = p.category;
        const legacyCats = ['goods', 'agency', '소속사 피드백', '굿즈/공연'];
        if (!cat || (Array.isArray(cat) ? cat.some(c => legacyCats.includes(c)) : legacyCats.includes(cat))) {
          cat = ['기획 대책 강구'];
        }
        return { ...p, category: Array.isArray(cat) ? cat : [cat] };
      });
      setPosts(mappedData);
    }
  };

  const toggleLike = async (e, postId, currentCount) => {
    e.preventDefault(); e.stopPropagation();
    const isLiked = likedPosts.includes(postId);
    const newCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
    const { error } = await supabase.from('posts').update({ empathy_count: newCount }).eq('id', postId);
    if (!error) {
      setLikedPosts(prev => isLiked ? prev.filter(id => id !== postId) : [...prev, postId]);
      setPosts(posts.map(p => p.id === postId ? { ...p, empathy_count: newCount } : p));
    }
  };

  const filteredPosts = selectedCategory === '전체' ? posts : posts.filter(p => p.category.includes(selectedCategory));

  // [수정 포인트] bg를 순백색(#ffffff)으로 변경하여 배너와 통일
  const theme = isDarkMode 
    ? { bg: "bg-[#0f0f10]", card: "bg-[#1a1a1c]", text: "text-white", sub: "text-gray-400", border: "border-white/5", icon: "text-purple-400" }
    : { bg: "bg-[#ffffff]", card: "bg-white", text: "text-[#1a1a1c]", sub: "text-gray-500", border: "border-gray-200", icon: "text-purple-600" };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans pb-32 transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto px-4 py-8 text-left">
        
        {/* 테마 스위처 (상단 우측) */}
        <div className="flex justify-end mb-4 gap-2">
          <div className={`${theme.card} ${theme.border} border p-1 rounded-2xl flex shadow-sm`}>
            {[
              { mode: 'auto', icon: <Monitor size={14} />, label: '자동' },
              { mode: 'light', icon: <Sun size={14} />, label: '라이트' },
              { mode: 'dark', icon: <Moon size={14} />, label: '다크' }
            ].map(item => (
              <button
                key={item.mode}
                onClick={() => setThemeMode(item.mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                  themeMode === item.mode ? 'bg-purple-600 text-white shadow-md' : theme.sub
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 배너 상단 디자인 수정: 이제 배경 전체가 하얘서 경계가 안 보입니다. */}
        <header className={`${theme.card} p-8 md:p-12 rounded-[3rem] mb-10 relative overflow-hidden border ${theme.border} shadow-2xl`}>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">아이유 팬덤의 목소리,<br /><span className="text-purple-600 font-extrabold">하나의 전략 리포트로</span></h1>
            <p className={`${theme.sub} text-sm md:text-base max-w-md`}>팬들의 의견을 집결하여 소속사에 비즈니스 리포트로 전달합니다.</p>
          </div>
          <Sparkles className={`absolute top-6 right-8 ${isDarkMode ? 'text-purple-500/10' : 'text-purple-500/5'} w-24 h-24`} />
        </header>

        {/* 카테고리 셀렉터 */}
        <div className="mb-10">
          <div className="hidden md:grid grid-cols-7 gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} 
                className={`py-3 rounded-2xl text-[10px] font-bold transition-all border ${selectedCategory === cat ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : `${theme.card} ${theme.border} ${theme.sub} hover:border-purple-500/50`}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="md:hidden relative">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full ${theme.card} border ${theme.border} p-5 rounded-[1.5rem] appearance-none text-sm font-bold text-purple-600 focus:outline-none shadow-sm`}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* 게시글 리스트 */}
        <div className="grid gap-4">
          {filteredPosts.map(post => (
            <Link key={post.id} to={`/post/${post.id}`} className={`${theme.card} p-8 rounded-[2.5rem] border ${theme.border} hover:border-purple-500/30 transition group block relative shadow-sm`}>
              <div className="flex gap-1.5 mb-4">
                {post.category.map(c => <span key={c} className="bg-purple-600/10 text-purple-600 px-2.5 py-1 rounded-lg text-[9px] font-bold">{c}</span>)}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition">{post.title}</h3>
              <p className={`${theme.sub} text-sm line-clamp-2 mb-8 leading-relaxed font-medium`}>{post.content}</p>
              <div className="flex justify-between items-center">
                <button onClick={(e) => toggleLike(e, post.id, post.empathy_count || 0)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${likedPosts.includes(post.id) ? 'bg-red-500/10 text-red-500 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                  <Heart size={16} fill={likedPosts.includes(post.id) ? "currentColor" : "none"} />
                  <span className="text-sm font-bold">{post.empathy_count || 0}</span>
                </button>
                <span className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-widest"><MessageSquare size={14} /> {post.comment_count || 0} 달글</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 플로팅 버튼 */}
        <button onClick={() => navigate('/write')}
          className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 bg-purple-600 py-5 md:px-12 rounded-[2rem] font-black text-lg shadow-2xl shadow-purple-900/40 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all z-50 text-white">
          <Edit3 size={24} /> 안건 제안하기
        </button>
      </div>
    </div>
  );
};

export default HomePage;