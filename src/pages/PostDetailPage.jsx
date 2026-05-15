import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, MessageSquare, Send } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    fetchPost();
    fetchComments();
    const mode = localStorage.getItem('themeMode') || 'auto';
    if (mode === 'auto') {
      const hour = new Date().getHours();
      setIsDarkMode(hour < 6 || hour >= 19);
    } else {
      setIsDarkMode(mode === 'dark');
    }
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase.from('posts').select('*').eq('id', id).single();
    if (data) {
      // 레거시 카테고리 매핑
      let cat = data.category;
      const legacyCats = ['goods', 'agency', '소속사 피드백', '굿즈/공연'];
      if (!cat || (Array.isArray(cat) ? cat.some(c => legacyCats.includes(c)) : legacyCats.includes(cat))) cat = ['기획 대책 강구'];
      setPost({ ...data, category: Array.isArray(cat) ? cat : [cat] });
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase.from('comments').select('*').eq('post_id', id).order('created_at', { ascending: true });
    if (data) setComments(data);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await supabase.from('comments').insert([{ post_id: id, content: newComment, author_name: '아이유팬' }]);
    await supabase.from('posts').update({ comment_count: (post.comment_count || 0) + 1 }).eq('id', id);
    setNewComment('');
    fetchComments();
    fetchPost();
  };

  const theme = isDarkMode 
    ? { bg: "bg-[#0f0f10]", card: "bg-[#1a1a1c]", text: "text-white", sub: "text-gray-400", border: "border-white/5", input: "bg-black text-white" }
    : { bg: "bg-[#f8f9fa]", card: "bg-white", text: "text-[#1a1a1c]", sub: "text-gray-500", border: "border-gray-200", input: "bg-gray-50 text-[#1a1a1c]" };

  if (!post) return <div className={`min-h-screen ${theme.bg} flex items-center justify-center ${theme.text}`}>로딩 중...</div>;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-6 font-sans text-left transition-colors duration-500 pb-32`}>
      <div className="max-w-2xl mx-auto py-8">
        <button onClick={() => navigate(-1)} className={`mb-8 ${theme.sub} flex items-center gap-1 hover:text-purple-500 transition font-bold`}>
          <ChevronLeft size={20} /> 목록으로
        </button>

        {/* 본문 영역 */}
        <div className={`${theme.card} p-10 rounded-[3rem] border ${theme.border} mb-8 shadow-sm`}>
          <div className="flex gap-2 mb-6">
            {post.category.map(c => <span key={c} className="bg-purple-600/10 text-purple-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase">{c}</span>)}
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-6 leading-tight">{post.title}</h1>
          <p className={`${theme.sub} text-base leading-relaxed font-medium whitespace-pre-wrap`}>{post.content}</p>
        </div>

        {/* 달글(댓글) 영역 */}
        <div className="mb-6 flex items-center gap-2">
          <MessageSquare size={18} className="text-purple-500" />
          <h3 className="font-bold text-lg">달글 {post.comment_count || 0}개</h3>
        </div>

        <div className="space-y-4 mb-10">
          {comments.map(comment => (
            <div key={comment.id} className={`${theme.card} p-6 rounded-[2rem] border ${theme.border} shadow-sm`}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-purple-600">{comment.author_name}</span>
              </div>
              <p className={`${theme.text} text-sm font-medium`}>{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <div className={`text-center py-10 ${theme.sub} text-sm`}>아직 작성된 달글이 없습니다. 첫 의견을 남겨주세요!</div>}
        </div>

        {/* 달글 작성 폼 */}
        <form onSubmit={handleAddComment} className="flex gap-3">
          <input 
            className={`flex-1 ${theme.input} border ${theme.border} rounded-full px-6 py-4 outline-none focus:border-purple-500 transition text-sm font-medium`}
            placeholder="동의하거나 추가할 의견을 달글로 남겨주세요."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button type="submit" className="bg-purple-600 text-white p-4 rounded-full hover:bg-purple-500 transition shadow-lg shadow-purple-900/30">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostDetailPage;