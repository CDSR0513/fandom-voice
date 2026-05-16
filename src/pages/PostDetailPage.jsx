import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, MessageSquare, Send, Heart, Edit3, Trash2, Save, X } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState(JSON.parse(localStorage.getItem('likedPosts') || '[]'));
  
  // 수정 모드 관련 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  useEffect(() => {
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  }, [likedPosts]);

  const fetchPost = async () => {
    const { data } = await supabase.from('posts').select('*').eq('id', id).single();
    if (data) {
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

  const toggleLike = async () => {
    const isLiked = likedPosts.includes(id);
    const newCount = isLiked ? Math.max(0, (post.empathy_count || 0) - 1) : (post.empathy_count || 0) + 1;
    const { error } = await supabase.from('posts').update({ empathy_count: newCount }).eq('id', id);
    if (!error) {
      setLikedPosts(prev => isLiked ? prev.filter(pId => pId !== id) : [...prev, id]);
      setPost(prev => ({ ...prev, empathy_count: newCount }));
    }
  };

  // 🔥 수정 버튼 클릭 시
  const handleEditClick = () => {
    const pwd = window.prompt("글 작성 시 설정한 비밀번호를 입력하세요.");
    if (pwd === post.password) {
      setEditTitle(post.title);
      setEditContent(post.content);
      setIsEditing(true);
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  // 🔥 수정 저장
  const handleSaveEdit = async () => {
    const { error } = await supabase.from('posts').update({ title: editTitle, content: editContent }).eq('id', id);
    if (!error) {
      setPost(prev => ({ ...prev, title: editTitle, content: editContent }));
      setIsEditing(false);
    }
  };

  // 🔥 삭제 버튼 클릭 시
  const handleDeleteClick = async () => {
    const pwd = window.prompt("글 작성 시 설정한 비밀번호를 입력하세요.");
    if (pwd === post.password) {
      if(window.confirm("이 안건을 정말 삭제하시겠습니까?")) {
        await supabase.from('posts').delete().eq('id', id);
        navigate('/');
      }
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
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

  if (!post) return <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-[#1a1a1c]">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1c] p-4 md:p-6 font-sans text-left pb-32">
      <div className="max-w-2xl mx-auto py-4 md:py-8">
        <button onClick={() => navigate(-1)} className="mb-6 md:mb-8 text-gray-500 flex items-center gap-1 hover:text-purple-500 transition font-bold text-sm">
          <ChevronLeft size={20} /> 목록으로
        </button>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-200 mb-8 shadow-sm relative">
          
          {/* 수정/삭제 메뉴 */}
          {!isEditing && (
            <div className="absolute top-8 right-8 flex gap-3">
              <button onClick={handleEditClick} className="text-gray-400 hover:text-blue-500 transition"><Edit3 size={18} /></button>
              <button onClick={handleDeleteClick} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
            </div>
          )}

          <div className="flex gap-2 mb-6 mt-4">
            {post.category.map(c => <span key={c} className="bg-purple-600/10 text-purple-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase">{c}</span>)}
          </div>

          {isEditing ? (
            <div className="space-y-4 mb-6">
              <input className="w-full text-2xl font-black bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-purple-500" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              <textarea className="w-full text-base font-medium bg-gray-50 border border-gray-200 rounded-2xl p-4 h-40 outline-none focus:border-purple-500 resize-none" value={editContent} onChange={e => setEditContent(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold"><X size={16}/> 취소</button>
                <button onClick={handleSaveEdit} className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold"><Save size={16}/> 저장</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-black mb-6 leading-tight pr-10">{post.title}</h1>
              <p className="text-gray-500 text-base leading-relaxed font-medium whitespace-pre-wrap mb-10">{post.content}</p>
            </>
          )}
          
          <div className="flex justify-start">
            <button onClick={toggleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all border ${
                likedPosts.includes(id) 
                ? 'bg-red-500/10 border-red-500/20 text-red-500 font-bold' 
                : 'bg-[#f8f9fa] border-gray-200 text-gray-400'
              }`}>
              <Heart size={20} fill={likedPosts.includes(id) ? "currentColor" : "none"} />
              <span className="text-sm font-bold">공감 {post.empathy_count || 0}</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 px-2">
          <MessageSquare size={18} className="text-purple-500" />
          <h3 className="font-bold text-lg">댓글 {post.comment_count || 0}개</h3>
        </div>

        <div className="space-y-4 mb-10">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-purple-600">{comment.author_name}</span>
              </div>
              <p className="text-[#1a1a1c] text-sm font-medium">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <div className="text-center py-10 text-gray-500 text-sm">아직 작성된 댓글이 없습니다. 첫 의견을 남겨주세요!</div>}
        </div>

        <form onSubmit={handleAddComment} className="flex gap-3">
          <input 
            className="flex-1 bg-gray-50 border border-gray-200 text-[#1a1a1c] rounded-full px-6 py-4 outline-none focus:border-purple-600 transition text-sm font-medium"
            placeholder="동의하거나 추가할 의견을 댓글로 남겨주세요."
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