import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, PenSquare, Sparkles, Sun, Moon, Monitor } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const parseCategory = (cat) => {
  if (!cat) return ['기타'];
  if (Array.isArray(cat)) return cat;
  try {
    const parsed = JSON.parse(cat);
    return Array.isArray(parsed) ? parsed : [cat];
  } catch {
    return [cat];
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const NEW_CATEGORIES = ['To. 소속사', 'To. 아티스트', '가수 활동', '배우 활동', '기타'];

// 🔥 기획자님의 요구사항을 반영한 초정밀 다중 카테고리 매핑 해독기
const mapLegacyCategoryAdvanced = (post) => {
  const title = String(post.title || '');
  const content = String(post.content || '');
  const fullText = title + content;
  
  let catArray = parseCategory(post.category);
  
  // 1. 대곡강박 글 감지
  if (fullText.includes('대곡강박')) {
    return ['To. 소속사', 'To. 아티스트', '가수 활동'];
  }
  // 2. 공연에 초점 글 감지
  if (fullText.includes('공연에 초점')) {
    return ['To. 소속사', 'To. 아티스트', '가수 활동'];
  }
  // 3. 할당제처럼 글 감지
  if (fullText.includes('할당제처럼')) {
    return ['To. 아티스트', '가수 활동', '배우 활동'];
  }
  // 4. 음색이 돋보이는 곡 감지
  if (fullText.includes('음색')) {
    return ['가수 활동'];
  }
  // 5. 매년 콘서트 앨범 감지
  if (fullText.includes('매년 콘서트')) {
    return ['가수 활동'];
  }

  // 그 외 일반 구형 태그 마이그레이션 방어코드
  const updatedCats = catArray.map(cat => {
    if (NEW_CATEGORIES.includes(cat)) return cat;
    const lowerC = String(cat).toLowerCase();
    if (lowerC.includes('연예인') || lowerC.includes('이지은')) return 'To. 아티스트';
    if (lowerC.includes('가수') || lowerC.includes('공연') || lowerC.includes('goods') || lowerC.includes('굿즈')) return '가수 활동';
    if (lowerC.includes('배우') || lowerC.includes('연기')) return '배우 활동';
    if (lowerC.includes('소속사') || lowerC.includes('대책') || lowerC.includes('agency')) return 'To. 소속사';
    return '기타';
  });

  return [...new Set(updatedCats)];
};

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [likedPosts, setLikedPosts] = useState(JSON.parse(localStorage.getItem('likedPosts') || '[]'));
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'auto');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    applyTheme();
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  }, [likedPosts]);

  const applyTheme = () => {
    if (themeMode === 'auto') {
      const hour = new Date().getHours();
      setIsDarkMode(hour < 6 || hour >= 19);
    } else {
      setIsDarkMode(themeMode === 'dark');
    }
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setPosts(data.map(p => {
        // 고급 다중 매핑 연산 적용
        const computedCats = mapLegacyCategoryAdvanced(p);
        return { ...p, category: computedCats };
      }));
    }
  };

  const toggleLike = async (e, id, currentCount) => {
    e.preventDefault();
    e.stopPropagation();
    const isLiked = likedPosts.includes(id);
    const newCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;

    const { error } = await supabase.from('posts').update({ empathy_count: newCount }).eq('id', id);
    if (!error) {
      setLikedPosts(prev => isLiked ? prev.filter(pId => pId !== id) : [...prev, id]);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, empathy_count: newCount } : p));
    }
  };

  const filteredPosts = selectedCategory === '전체' ? posts : posts.filter(p => p.category.includes(selectedCategory));

  const theme = isDarkMode
    ? { bg: "bg-[#0f0f10]", card: "bg-[#1a1a1c]", text: "text-white", sub: "text-gray-400", border: "border-white/5" }
    : { bg: "bg-[#ffffff]", card: "bg-white", text: "text-[#1a1a1c]", sub: "text-gray-500", border: "border-gray-200" };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans p-4 md:p-6 transition-colors duration-500 text-left pb-32`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-6 gap-2 pt-4">
          <div className={`${theme.card} ${theme.border} border p-1.5 rounded-2xl flex gap-1 shadow-xl`}>
            {[{ id: 'auto', icon: <Monitor size={14} />, label: '자동' }, { id: 'light', icon: <Sun size={14} />, label: '라이트' }, { id: 'dark', icon: <Moon size={14} />, label: '다크' }].map(m => (
              <button key={m.id} onClick={() => setThemeMode(m.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${themeMode === m.id ? 'bg-purple-600 text-white shadow-md' : theme.sub}`}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`${theme.card} p-8 md:p-10 rounded-[2.5rem] border ${theme.border} mb-8 shadow-2xl relative overflow-hidden`}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl"></div>
          <h2 className="text-xl md:text-2xl font-black mb-3 flex items-center gap-2 leading-tight">
            <Sparkles className="text-purple-500 animate-pulse" size={24} /> 아이유 팬덤의 목소리,<br />하나의 전략 리포트로
          </h2>
          <p className={`${theme.sub} text-xs font-semibold leading-relaxed`}>팬들의 의견을 직접 수집하여 소속사에 실시간 여론으로 전달합니다.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar snap-x">
          <button onClick={() => setSelectedCategory('전체')} className={`px-5 py-3 rounded-full text-xs font-black transition-all flex-shrink-0 snap-start ${selectedCategory === '전체' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' : `${theme.card} border ${theme.border} ${theme.sub}`}`}>전체</button>
          {NEW_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-3 rounded-full text-xs font-black transition-all flex-shrink-0 snap-start ${selectedCategory === cat ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' : `${theme.card} border ${theme.border} ${theme.sub}`}`}>{cat}</button>
          ))}
        </div>

        <div className="space-y-4 mb-20">
          {filteredPosts.map(post => (
            <Link to={`/post/${post.id}`} key={post.id} className={`block ${theme.card} p-6 md:p-8 rounded-[2rem] border ${theme.border} hover:border-purple-500/30 transition-all shadow-sm hover:shadow-xl group text-left`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap gap-1">
                  {post.category.map(c => (
                    <span key={c} className="bg-purple-600/10 text-purple-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">{c}</span>
                  ))}
                </div>
                <div className={`text-[10px] font-medium ${theme.sub}`}>
                  {formatDate(post.created_at)}
                </div>
              </div>

              <h3 className={`text-lg font-bold mb-2 group-hover:text-purple-500 transition-colors ${theme.text}`}>{post.title}</h3>
              <p className={`${theme.sub} text-xs font-medium leading-relaxed mb-6 line-clamp-2`}>{post.content}</p>
              
              <div className="flex justify-between items-center pt-2 border-t border-white/[0.03]">
                <button onClick={(e) => toggleLike(e, post.id, post.empathy_count || 0)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition-all ${likedPosts.includes(post.id) ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'border-transparent text-gray-400 hover:text-red-400'}`}>
                  <Heart size={15} fill={likedPosts.includes(post.id) ? "currentColor" : "none"} /> 공감 {post.empathy_count || 0}
                </button>
                <div className={`flex items-center gap-1 text-xs font-bold ${theme.sub}`}>
                  <MessageSquare size={15} /> 댓글 {post.comment_count || 0}
                </div>
              </div>
            </Link>
          ))}
          {filteredPosts.length === 0 && (
            <div className={`text-center py-20 ${theme.sub} text-sm font-medium border border-dashed ${theme.border} rounded-[2rem]`}>아직 제안된 안건이 없습니다. 첫 의견을 남겨주세요!</div>
          )}
        </div>

        <button onClick={() => navigate('/write')} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-black text-sm flex items-center gap-2 shadow-2xl shadow-purple-900/50 hover:scale-105 transition-all z-30">
          <PenSquare size={18} /> 안건 제안하기
        </button>
      </div>
    </div>
  );
};

export default HomePage;