import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const parseMediaUrls = (urlStr) => {
  if (!urlStr) return [];
  try { return JSON.parse(urlStr); } 
  catch { return [urlStr]; } 
};

// 🔥 카테고리 괄호 포장지([" "])를 예쁘게 벗겨주는 해독기
const parseCategory = (cat) => {
  if (!cat) return ['기타'];
  if (Array.isArray(cat)) return cat;
  try { 
    const parsed = JSON.parse(cat); 
    return Array.isArray(parsed) ? parsed : [cat]; 
  } catch { return [cat]; }
};

const AgencyDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const categories = ['소속사 피드백 요청', '연예인 피드백 요청', '악플 대책 강구', '홍보 대책 강구', '기획 대책 강구', '기타'];

  useEffect(() => { 
    fetchPosts(); 
    const syncTheme = () => {
      const mode = localStorage.getItem('themeMode') || 'auto';
      if (mode === 'auto') {
        setIsDarkMode(new Date().getHours() < 6 || new Date().getHours() >= 19);
      } else {
        setIsDarkMode(mode === 'dark');
      }
    };
    syncTheme();
    const interval = setInterval(syncTheme, 500);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) {
      setPosts(data.map(p => {
        let catArray = parseCategory(p.category);
        const isLegacy = catArray.some(c => ['goods', 'agency', '소속사 피드백', '굿즈/공연'].includes(String(c).toLowerCase()));
        if (isLegacy) catArray = ['기획 대책 강구'];

        return { 
          ...p, 
          domains: catArray,
          parsedUrls: parseMediaUrls(p.media_url)
        };
      }));
    }
  };

  const filteredPosts = selectedCategory === '전체' ? posts : posts.filter(p => p.domains.includes(selectedCategory));

  const theme = isDarkMode 
    ? { bg: "bg-[#0f0f10]", card: "bg-[#1a1a1c]", text: "text-white", sub: "text-gray-400", border: "border-white/10" }
    : { bg: "bg-[#f8f9fa]", card: "bg-white", text: "text-[#1a1a1c]", sub: "text-gray-500", border: "border-gray-200" };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans p-6 md:p-8 text-left transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4 mt-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-2 md:gap-3 text-purple-600">
              <ShieldCheck size={32} /> 팬덤 보이스 모니터링
            </h1>
            <p className={`${theme.sub} text-sm font-medium`}>소속사 전용 관리 화면입니다. 팬들의 순수 의견과 미디어를 가감 없이 실시간으로 모니터링합니다.</p>
          </div>
          <button onClick={() => setSelectedCategory('전체')} className={`px-6 py-2 rounded-2xl text-xs font-bold transition w-full md:w-auto ${theme.card} border ${theme.border} ${theme.sub} hover:border-purple-600/30`}>전체보기</button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`p-5 md:p-6 rounded-3xl md:rounded-[2rem] border transition text-left ${selectedCategory === cat ? 'bg-purple-600 border-purple-500 text-white shadow-md' : `${theme.card} ${theme.border}`}`}>
              <span className={`text-[9px] font-black uppercase ${selectedCategory === cat ? 'text-purple-200' : 'text-purple-600'}`}>{cat}</span>
              <h4 className="text-2xl font-black mt-2">{posts.filter(p => p.domains.includes(cat)).length}</h4>
            </button>
          ))}
        </div>

        <div className={`${theme.card} rounded-[2rem] border ${theme.border} overflow-hidden shadow-sm mb-20`}>
          <div className="flex flex-col">
            {filteredPosts.map((post) => (
              <div key={post.id} className={`flex flex-col md:flex-row p-6 md:p-8 hover:bg-black/5 transition-colors group gap-4 md:gap-8 items-start md:items-center border-b ${theme.border} last:border-b-0`}>
                <div className="w-full md:w-1/4 flex flex-wrap gap-1">
                  {post.domains.map(d => <span key={d} className="bg-purple-600/10 text-purple-600 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase">{d}</span>)}
                </div>
                <div className="w-full md:flex-1">
                  <Link to={`/post/${post.id}`} className="block">
                    <div className={`font-bold ${theme.text} text-lg group-hover:text-purple-600 transition flex items-center gap-2`}>
                      {post.title} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition hidden md:block" />
                    </div>
                    <div className={`${theme.sub} text-sm mt-2 whitespace-pre-wrap`}>{post.content}</div>
                    {post.parsedUrls.length > 0 && (
                      <div className="mt-4 rounded-xl overflow-hidden max-h-40 max-w-sm border border-gray-200/20 bg-black/5">
                        {post.parsedUrls[0].match(/\.(mp4|webm|ogg)$/i) ? <video src={post.parsedUrls[0]} className="max-h-40 w-full object-cover" /> : <img src={post.parsedUrls[0]} alt="첨부 미리보기" className="max-h-40 w-full object-cover" />}
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;