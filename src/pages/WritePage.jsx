import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const WritePage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  const categories = ['소속사 피드백 요청', '연예인 피드백 요청', '악플 대책 강구', '홍보 대책 강구', '기획 대책 강구', '기타'];

  useEffect(() => {
    const mode = localStorage.getItem('themeMode') || 'auto';
    if (mode === 'auto') {
      const hour = new Date().getHours();
      setIsDarkMode(hour < 6 || hour >= 19);
    } else {
      setIsDarkMode(mode === 'dark');
    }
  }, []);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || selectedCategories.length === 0) return alert("카테고리와 내용을 모두 채워주세요!");
    const { error } = await supabase.from('posts').insert([{ title, content, category: selectedCategories, author_name: '아이유팬' }]);
    if (!error) navigate('/');
  };

  const theme = isDarkMode 
    ? { bg: "bg-[#0f0f10]", card: "bg-[#1a1a1c]", text: "text-white", sub: "text-gray-500", border: "border-white/5", input: "text-gray-300" }
    : { bg: "bg-[#f8f9fa]", card: "bg-white", text: "text-[#1a1a1c]", sub: "text-gray-400", border: "border-gray-200", input: "text-[#1a1a1c]" };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-6 font-sans text-left transition-colors duration-500`}>
      <div className="max-w-xl mx-auto py-8">
        <button onClick={() => navigate(-1)} className={`mb-8 ${theme.sub} flex items-center gap-1 hover:text-purple-500 transition font-bold`}>
          <ChevronLeft size={20} /> 뒤로가기
        </button>
        <h2 className="text-2xl font-black mb-8 text-purple-600">전략적 안건 제안</h2>
        
        <div className="mb-10">
          <label className={`block text-[10px] font-bold ${theme.sub} mb-4 tracking-widest uppercase`}>건의 목적 (중복 선택 가능)</label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                className={`p-5 rounded-3xl border text-[11px] font-bold transition flex items-center justify-between ${
                  selectedCategories.includes(cat) ? 'bg-purple-600 border-purple-500 text-white shadow-md' : `${theme.card} ${theme.border} ${theme.sub}`
                }`}>
                {cat} {selectedCategories.includes(cat) && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input className={`w-full bg-transparent text-xl font-bold border-b ${theme.border} p-4 outline-none focus:border-purple-600 transition ${theme.text}`} placeholder="안건 제목을 입력하세요" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className={`w-full ${theme.card} border ${theme.border} rounded-[2.5rem] p-8 h-80 ${theme.input} outline-none focus:ring-2 focus:ring-purple-500 transition resize-none text-sm font-medium shadow-sm`} placeholder="상세 내용을 입력하세요. 비속어는 AI가 정제하여 소속사에 전달합니다." value={content} onChange={e => setContent(e.target.value)} />
          <button className="w-full bg-purple-600 py-6 rounded-[2rem] font-black text-lg hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/40 text-white">안건 제출하기</button>
        </form>
      </div>
    </div>
  );
};

export default WritePage;