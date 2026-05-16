import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Image as ImageIcon, Loader2, X } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const WritePage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]); // 🔥 여러 개 저장을 위한 배열
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // 모바일 제출 오류 표시용
  const [isDarkMode, setIsDarkMode] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const categories = ['소속사 피드백 요청', '연예인 피드백 요청', '악플 대책 강구', '홍보 대책 강구', '기획 대책 강구', '기타'];

  useEffect(() => {
    const mode = localStorage.getItem('themeMode') || 'auto';
    setIsDarkMode(mode === 'dark' || (mode === 'auto' && (new Date().getHours() < 6 || new Date().getHours() >= 19)));
  }, []);

  const toggleCategory = (cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  // 🔥 무제한 다중 파일 업로드 로직
  const handleFileUpload = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      setIsUploading(true);
      setErrorMessage('');

      const uploadedUrls = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const filePath = `posts/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error } = await supabase.storage.from('media').upload(filePath, file);
        if (error) throw new Error(error.message);
        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
        uploadedUrls.push(publicUrlData.publicUrl);
      }
      setMediaUrls(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      setErrorMessage('파일 업로드 실패: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index) => setMediaUrls(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!title.trim() || !content.trim() || selectedCategories.length === 0 || !password.trim()) {
      return setErrorMessage("카테고리, 제목, 내용, 비밀번호를 모두 입력해주세요!");
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('posts').insert([{ 
        title: title.trim(), 
        content: content.trim(), 
        password: password.trim(), 
        category: selectedCategories, 
        author_name: '아이유팬',
        artist_name: '아이유', 
        media_url: JSON.stringify(mediaUrls) // 배열을 통째로 텍스트로 변환해서 저장
      }]);

      if (error) throw new Error(error.message);
      navigate('/');
    } catch (err) {
      setErrorMessage("서버 전송 실패: " + err.message);
      setIsSubmitting(false);
    }
  };

  const theme = isDarkMode 
    ? { bg: "bg-[#0f0f10]", card: "bg-[#1a1a1c]", text: "text-white", sub: "text-gray-400", border: "border-white/10", input: "bg-black text-white" }
    : { bg: "bg-[#f8f9fa]", card: "bg-white", text: "text-[#1a1a1c]", sub: "text-gray-500", border: "border-gray-200", input: "bg-gray-50 text-[#1a1a1c]" };

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
          <textarea className={`w-full ${theme.card} border ${theme.border} rounded-[2.5rem] p-8 h-60 ${theme.text} outline-none focus:border-purple-500 transition resize-none text-sm font-medium`} placeholder="상세 내용을 입력하세요." value={content} onChange={e => setContent(e.target.value)} />
          
          <div className={`${theme.card} border ${theme.border} p-6 rounded-2xl`}>
            <button type="button" onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 text-xs font-bold ${theme.sub} hover:text-purple-600 transition`}>
              <ImageIcon size={18} />
              <span>사진 / 동영상 / 움짤 다중 첨부</span>
            </button>
            <input type="file" ref={fileInputRef} multiple accept="image/*,video/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            
            {isUploading && <div className="flex items-center gap-2 text-xs text-purple-600 mt-3"><Loader2 size={14} className="animate-spin" /> 업로드 중...</div>}
            
            {/* 첨부된 파일 미리보기 목록 및 삭제 버튼 */}
            {mediaUrls.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                    {url.match(/\.(mp4|webm|ogg)$/i) ? <video src={url} className="w-full h-full object-cover" /> : <img src={url} alt="미리보기" className="w-full h-full object-cover" />}
                    <button type="button" onClick={() => removeMedia(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input type="password" maxLength={20} className={`w-full ${theme.card} border ${theme.border} p-5 rounded-2xl outline-none focus:border-purple-600 transition text-sm font-bold`} placeholder="수정/삭제용 비밀번호를 설정하세요" value={password} onChange={e => setPassword(e.target.value)} />

          {errorMessage && <p className="text-red-500 text-sm font-bold px-2">{errorMessage}</p>}

          <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 py-6 rounded-[2rem] font-black text-lg hover:bg-purple-500 transition-all text-white mt-4 disabled:opacity-50">
            {isSubmitting ? "전송 중..." : "안건 제출하기"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WritePage;