import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Image, Loader2 } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const WritePage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null); // 모바일 터치 버그 뚫기용 ref
  const navigate = useNavigate();

  const categories = ['소속사 피드백 요청', '연예인 피드백 요청', '악플 대책 강구', '홍보 대책 강구', '기획 대책 강구', '기타'];

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  // 🔥 파일 업로드 처리 함수 (강력한 예외 감지 장치 장착)
  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("환경 변수가 정상 로드되지 않았습니다. Vercel 환경 변수 세팅을 확인하세요.");
      }

      const { data, error } = await supabase.storage.from('media').upload(filePath, file);

      if (error) {
        throw new Error(`${error.message} (※ Supabase Storage 메뉴에서 media 버킷의 RLS 정책 생성 중 anon 권한에 대한 INSERT가 풀려있는지 반드시 확인하세요!)`);
      }

      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
      setMediaUrl(publicUrlData.publicUrl);
      alert("파일이 성공적으로 첨부되어 업로드되었습니다!");
    } catch (err) {
      alert('⚠️ 파일 업로드 실패: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!title.trim() || !content.trim() || selectedCategories.length === 0 || !password.trim()) {
        return alert("카테고리, 제목, 내용, 비밀번호를 모두 입력해주세요!");
      }

      const { error } = await supabase.from('posts').insert([{ 
        title: title.trim(), 
        content: content.trim(), 
        password: password.trim(), 
        category: selectedCategories, 
        author_name: '아이유팬',
        media_url: mediaUrl 
      }]);

      if (error) {
        throw new Error(`DB 전송 실패: ${error.message}`);
      }

      navigate('/');
    } catch (err) {
      alert("⚠️ 안건 제출 중 에러 발생: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1c] p-6 font-sans text-left">
      <div className="max-w-xl mx-auto py-8">
        <button onClick={() => navigate(-1)} className="mb-8 text-gray-500 flex items-center gap-1 hover:text-purple-500 transition font-bold">
          <ChevronLeft size={20} /> 뒤로가기
        </button>
        <h2 className="text-2xl font-black mb-8 text-purple-600">전략적 안건 제안</h2>
        
        <div className="mb-10">
          <label className="block text-[10px] font-bold text-gray-500 mb-4 tracking-widest uppercase">건의 목적 (중복 선택 가능)</label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                className={`p-5 rounded-3xl border text-[11px] font-bold transition flex items-center justify-between ${
                  selectedCategories.includes(cat) ? 'bg-purple-600 border-purple-500 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500'
                }`}>
                {cat} {selectedCategories.includes(cat) && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input className="w-full bg-transparent text-xl font-bold border-b border-gray-200 p-4 outline-none focus:border-purple-600 transition text-[#1a1a1c]" placeholder="안건 제목을 입력하세요" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="w-full bg-white border border-gray-200 rounded-[2.5rem] p-8 h-60 text-[#1a1a1c] outline-none focus:ring-2 focus:ring-purple-500 transition resize-none text-sm font-medium shadow-sm" placeholder="상세 내용을 입력하세요." value={content} onChange={e => setContent(e.target.value)} />
          
          {/* 🔥 스마트폰에서 안전하게 동작하도록 개조된 미디어 첨부 영역 */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-purple-600 transition"
            >
              <Image size={18} />
              <span>사진 / 동영상 / 움짤(GIF) 첨부하기</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*,video/*" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isUploading} 
            />

            {isUploading && <div className="flex items-center gap-2 text-xs text-purple-600 mt-3"><Loader2 size={14} className="animate-spin" /> 업로드 중...</div>}
            
            {mediaUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 max-h-48 bg-gray-50 flex items-center justify-center">
                {mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={mediaUrl} controls className="max-h-48 object-contain" />
                ) : (
                  <img src={mediaUrl} alt="첨부 이미지" className="max-h-48 object-contain" />
                )}
              </div>
            )}
          </div>

          <input type="password" maxLength={20} className="w-full bg-white border border-gray-200 p-5 rounded-2xl outline-none focus:border-purple-600 transition text-sm font-bold shadow-sm" placeholder="수정/삭제용 비밀번호를 설정하세요" value={password} onChange={e => setPassword(e.target.value)} />

          <button type="submit" className="w-full bg-purple-600 py-6 rounded-[2rem] font-black text-lg hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/40 text-white mt-4">안건 제출하기</button>
        </form>
      </div>
    </div>
  );
};

export default WritePage;