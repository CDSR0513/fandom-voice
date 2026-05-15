import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { FileText, Copy, Check, X, BarChart3, Users, MessageSquare, ShieldCheck, Sparkles, Edit3, Trash2, Save, ExternalLink, Sun, Moon, Monitor, ChevronLeft } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AgencyDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [report, setReport] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'auto');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const categories = ['소속사 피드백 요청', '연예인 피드백 요청', '악플 대책 강구', '홍보 대책 강구', '기획 대책 강구', '기타'];

  useEffect(() => { 
    fetchPosts();
    applyTheme();
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

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
    if (!error) {
      const mappedData = (data || []).map(post => {
        let cat = post.category;
        const legacyCats = ['goods', 'agency', '소속사 피드백', '굿즈/공연'];
        if (!cat || (Array.isArray(cat) ? cat.some(c => legacyCats.includes(c)) : legacyCats.includes(cat))) {
          cat = ['기획 대책 강구'];
        }
        return { ...post, domains: Array.isArray(cat) ? cat : [cat] };
      });
      setPosts(mappedData);
    }
  };

  const purifyToBusinessLanguage = (post) => {
    const fullText = (post.title + post.content);
    let insights = [];

    if (fullText.includes('공연') || fullText.includes('투어') || fullText.includes('콘서트')) insights.push("아티스트 컨디션을 최우선으로 고려한 유연한 공연 스케줄링 및 프로젝트 간격 최적화 요구");
    if (fullText.includes('곡퀄') || fullText.includes('강박')) insights.push("제작 공정 매너리즘 탈피 및 트렌드를 반영한 A&R 방향성 수립 희망");
    if (fullText.includes('소통')) insights.push("대외 커뮤니케이션 톤앤매너 재정립 및 소통 채널의 전략적 활용 제언");
    if (fullText.includes('홍보') || fullText.includes('마케팅')) insights.push("마케팅 채널 다변화 및 팬덤 데이터를 활용한 타겟팅 고도화 촉구");
    if (fullText.includes('악플')) insights.push("루머 유포에 대한 실시간 모니터링 강화 및 강력한 법적 대응 절차 공개 요청");

    if (insights.length === 0) insights.push("수집된 여론 분석 결과, 기존 운영 방식에 대한 비즈니스적 관점의 개선 요구가 확인됨");

    return insights.map((line, idx) => `${idx + 1}. ${line}`).join('\n');
  };

  const generateReport = (post) => {
    const businessSummary = purifyToBusinessLanguage(post);
    
    // 대외비 문구 삭제 완료
    const reportText = `[전략 인사이트 리포트]\n\n안건: "${post.title}"\n관련 분야: [${post.domains.join(', ')}]\n날짜: ${new Date().toLocaleDateString()}\n\n1. 여론 데이터 분석\n본 사안에 대해 서비스 내 총 ${post.empathy_count}명의 팬덤 사용자가 실시간 공감을 표명했습니다. 이는 소속사의 즉각적인 전략 수립이 필요한 핵심 이슈로 분류됩니다.\n\n2. AI 여론 정화 및 핵심 요구사항 (Purified Summary)\n거친 말투나 단순 불만을 비즈니스 언어로 정화하여 요약한 핵심 요구사항은 다음과 같습니다:\n\n${businessSummary}\n\n3. 경영 제언\n현 이슈는 아티스트의 브랜드 이미지 및 팬덤 신뢰와 직결됩니다. 소속사는 해당 사안에 대한 피드백을 수립하고 공식 창구를 통해 정제된 입장을 표명할 것을 권고합니다.`;
    
    setReport(reportText);
    setIsModalOpen(true);
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase.from('posts').update({ title: editTitle, content: editContent }).eq('id', id);
    if (!error) { setEditingId(null); fetchPosts(); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('이 안건을 정말 삭제하시겠습니까?')) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (!error) fetchPosts();
    }
  };

  const filteredPosts = selectedCategory === '전체' ? posts : posts.filter(p => p.domains.includes(selectedCategory));

  const theme = isDarkMode 
    ? { bg: "bg-[#0f0f10]", card: "bg-[#1a1a1c]", text: "text-white", sub: "text-gray-400", border: "border-white/5", reportBox: "bg-black/40", reportText: "text-gray-300" }
    : { bg: "bg-[#ffffff]", card: "bg-white", text: "text-[#1a1a1c]", sub: "text-gray-500", border: "border-gray-200", reportBox: "bg-gray-100", reportText: "text-[#1a1a1c]" };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans p-8 transition-colors duration-500 text-left`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-6 gap-2">
          {/* 테마 스위처 */}
          <div className={`${theme.card} ${theme.border} border p-1.5 rounded-2xl flex gap-1 shadow-xl`}>
            {[{ id: 'auto', icon: <Monitor size={14} />, label: '자동' }, { id: 'light', icon: <Sun size={14} />, label: '라이트' }, { id: 'dark', icon: <Moon size={14} />, label: '다크' }].map(m => (
              <button key={m.id} onClick={() => setThemeMode(m.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${themeMode === m.id ? 'bg-purple-600 text-white shadow-md' : theme.sub}`}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
          
          {/* 팬 커뮤니티 복귀 버튼 추가, 로그아웃 삭제 */}
          <Link to="/" className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[11px] font-bold transition ${theme.card} ${theme.border} border ${theme.sub} hover:text-purple-600 hover:border-purple-600 shadow-sm`}>
            <ChevronLeft size={16} /> 팬 커뮤니티
          </Link>
        </div>

        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3 text-purple-600">
              <ShieldCheck size={36} /> 전략 인사이트 대시보드
            </h1>
            <p className={`${theme.sub} font-medium`}>소속사 전용 관리 화면입니다. 실시간 데이터 기반의 정제된 리포트를 제공합니다.</p>
          </div>
          <button onClick={() => setSelectedCategory('전체')} className={`px-6 py-2 rounded-2xl text-xs font-bold transition ${theme.card} ${theme.border} border ${theme.sub} hover:border-purple-600/30`}>전체보기</button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-12">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`p-6 rounded-[2rem] border transition text-left ${selectedCategory === cat ? 'bg-purple-600 border-purple-500 text-white' : `${theme.card} ${theme.border}`}`}>
              <span className={`text-[9px] font-black uppercase ${selectedCategory === cat ? 'text-purple-200' : 'text-purple-600'}`}>{cat}</span>
              <h4 className="text-2xl font-black mt-2">{posts.filter(p => p.domains.includes(cat)).length}</h4>
            </button>
          ))}
        </div>

        <div className={`${theme.card} rounded-[2.5rem] border ${theme.border} overflow-hidden shadow-2xl mb-20`}>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-white/5">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-purple-500/5 transition-colors group">
                  <td className="p-8 w-1/4">
                    <div className="flex flex-wrap gap-1">
                      {post.domains.map(d => (
                        <span key={d} className="bg-purple-600/10 text-purple-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase">{d}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-8">
                    {editingId === post.id ? (
                      <div className="space-y-2 p-2 bg-gray-50 border border-purple-200 rounded-xl">
                        <input className="bg-transparent border-b border-purple-100 p-2 w-full text-lg font-bold" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                        <textarea className="bg-transparent p-2 w-full text-gray-700 text-xs h-20 outline-none resize-none" value={editContent} onChange={e => setEditContent(e.target.value)} />
                      </div>
                    ) : (
                      <Link to={`/post/${post.id}`}>
                        <div className={`font-bold ${theme.text} text-lg group-hover:text-purple-600 transition flex items-center gap-2`}>
                          {post.title} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <div className={`${theme.sub} text-xs mt-2 line-clamp-1`}>{post.content}</div>
                      </Link>
                    )}
                  </td>
                  <td className="p-8 text-right flex justify-end gap-3 items-center">
                    {editingId === post.id ? (
                      <button onClick={() => handleUpdate(post.id)} className="text-green-500 p-2"><Save size={22} /></button>
                    ) : (
                      <button onClick={() => { setEditingId(post.id); setEditTitle(post.title); setEditContent(post.content); }} className="text-gray-400 hover:text-blue-500 p-2"><Edit3 size={20} /></button>
                    )}
                    <button onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                    <button onClick={() => generateReport(post)} className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black transition shadow-lg shadow-purple-900/20">리포트</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-opacity duration-300 ${
          isDarkMode ? "bg-black/70" : "bg-white/70"
        }`}>
          <div className={`w-full max-w-2xl rounded-[3rem] p-12 relative shadow-2xl text-left border transition-colors duration-500 ${
            isDarkMode 
              ? `bg-[#1a1a1c] border-white/5` 
              : `bg-white border-gray-100` 
          }`}>
            <button onClick={() => setIsModalOpen(false)} className={`absolute top-10 right-10 ${isDarkMode ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-[#1a1a1c]"}`}><X size={32} /></button>
            
            <h2 className={`text-2xl font-bold mb-8 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-[#1a1a1c]"}`}>
              <Sparkles className="text-purple-600" /> 전략 리포트 분석 완료
            </h2>
            
            <div className={`p-8 rounded-3xl mb-8 overflow-y-auto max-h-[50vh] transition-colors duration-500 ${
              isDarkMode 
                ? "bg-black/40" 
                : "bg-slate-50 border border-gray-100" 
            }`}>
              <pre className={`text-xs leading-relaxed font-sans whitespace-pre-wrap ${
                isDarkMode 
                  ? "text-gray-300" 
                  : "text-[#1a1a1c]" 
              }`}>
                {report}
              </pre>
            </div>
            
            <button onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="w-full bg-purple-600 py-5 rounded-2xl font-bold text-lg hover:bg-purple-400 transition text-white" >
              {copied ? "복사 완료!" : "리포트 복사하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyDashboard;