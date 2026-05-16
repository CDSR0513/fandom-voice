import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, MessageSquare, Send, Heart, Edit3, Trash2, Save, X, Image, Loader2 } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentMedia, setCommentMedia] = useState('');
  const [isCommentUploading, setIsCommentUploading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(JSON.parse(localStorage.getItem('likedPosts') || '[]'));
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase.from('posts').select('*').eq('id', id).single();
    if (data) {
      let cat = data.category;
      setPost({ ...data, category: Array.isArray(cat) ? cat : [cat] });
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase.from('comments').select('*').eq('post_id', id).order('created_at', { ascending: true });
    if (data) setComments(data);
  };

  const handleCommentFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCommentUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `comments/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage.from('media').upload(filePath, file);
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      setCommentMedia(data.publicUrl);
    }
    setIsCommentUploading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const { error } = await supabase.from('comments').insert([{ post_id: id, content: newComment, author_name: '아이유팬', media_url: commentMedia }]);
    if(!error) {
      await supabase.from('posts').update({ comment_count: (post.comment_count || 0) + 1 }).eq('id', id);
      setNewComment('');
      setCommentMedia('');
      fetchComments();
      fetchPost();
    }
  };

  const toggleLike = async () => {
    const isLiked = likedPosts.includes(id);
    const newCount = isLiked ? Math.max(0, (post.empathy_count || 0) - 1) : (post.empathy_count || 0) + 1;
    await supabase.from('posts').update({ empathy_count: newCount }).eq('id', id);
    setLikedPosts(prev => isLiked ? prev.filter(pId => pId !== id) : [...prev, id]);
    setPost(prev => ({ ...prev, empathy_count: newCount }));
  };

  const handleEditClick = () => {
    const pwd = window.prompt("글 설정 비밀번호를 입력하세요.");
    if (pwd === post.password) { setIsEditing(true); setEditTitle(post.title); setEditContent(post.content); }
    else { alert("비밀번호가 일치하지 않습니다."); }
  };

  const handleSaveEdit = async () => {
    await supabase.from('posts').update({ title: editTitle, content: editContent }).eq('id', id);
    setPost(prev => ({ ...prev, title: editTitle, content: editContent }));
    setIsEditing(false);
  };

  const handleDeleteClick = async () => {
    const pwd = window.prompt("비밀번호를 입력하세요.");
    if (pwd === post.password) {
      if(window.confirm("삭제하시겠습니까?")) {
        await supabase.from('posts').delete().eq('id', id);
        navigate('/');
      }
    } else { alert("비밀번호 불일치"); }
  };

  if (!post) return <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-[#1a1a1c]">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1c] p-4 md:p-6 font-sans text-left pb-32">
      <div className="max-w-2xl mx-auto py-4 md:py-8">
        <button onClick={() => navigate(-1)} className="mb-6 md:mb-8 text-gray-500 flex items-center gap-1 hover:text-purple-500 transition font-bold text-sm">
          <ChevronLeft size={20} /> 목록으로
        </button>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-200 mb-8 shadow-sm relative">
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
              <input className="w-full text-2xl font-black bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              <textarea className="w-full text-base font-medium bg-gray-50 border border-gray-200 rounded-2xl p-4 h-40 resize-none outline-none" value={editContent} onChange={e => setEditContent(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold">취소</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold">저장</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-black mb-6 leading-tight pr-10 text-[#1a1a1c]">{post.title}</h1>
              <p className="text-gray-600 text-base leading-relaxed font-medium whitespace-pre-wrap mb-6">{post.content}</p>
              
              {/* 🔥 글에 첨부된 이미지/영상/움짤 출력 */}
              {post.media_url && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 max-h-[400px] flex justify-center items-center">
                  {post.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={post.media_url} controls className="max-h-[400px] w-full object-contain" />
                  ) : (
                    <img src={post.media_url} alt="본문 미디어" className="max-h-[400px] w-full object-contain" />
                  )}
                </div>
              )}
            </>
          )}
          
          <button onClick={toggleLike} className={`flex items-center gap-2 px-6 py-3 rounded-full border ${likedPosts.includes(id) ? 'bg-red-500/10 border-red-500/20 text-red-500 font-bold' : 'bg-[#f8f9fa] border-gray-200 text-gray-400'}`}>
            <Heart size={20} fill={likedPosts.includes(id) ? "currentColor" : "none"} />
            <span className="text-sm font-bold">공감 {post.empathy_count || 0}</span>
          </button>
        </div>

        {/* 댓글 목록 */}
        <div className="mb-6 flex items-center gap-2 px-2"><MessageSquare size={18} className="text-purple-500" /><h3 className="font-bold text-lg">댓글 {post.comment_count || 0}개</h3></div>
        <div className="space-y-4 mb-10">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm">
              <span className="font-bold text-sm text-purple-600 block mb-2">{comment.author_name}</span>
              <p className="text-[#1a1a1c] text-sm font-medium mb-3">{comment.content}</p>
              
              {/* 🔥 댓글 미디어 출력 */}
              {comment.media_url && (
                <div className="rounded-xl overflow-hidden max-h-40 max-w-xs bg-gray-50 border border-gray-100 flex items-center justify-center">
                  {comment.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={comment.media_url} controls className="max-h-40 object-contain" />
                  ) : (
                    <img src={comment.media_url} alt="댓글 미디어" className="max-h-40 object-contain" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 댓글 작성 폼 + 파일첨부 */}
        <form onSubmit={handleAddComment} className="space-y-3">
          {commentMedia && (
            <div className="p-2 bg-white border border-gray-200 rounded-xl inline-block relative">
              <img src={commentMedia} alt="댓글 첨부 미리보기" className="h-14 w-14 object-cover rounded-lg" />
              <button type="button" onClick={() => setCommentMedia('')} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10}/></button>
            </div>
          )}
          <div className="flex gap-3 items-center">
            <label className="bg-gray-200 p-4 rounded-full text-gray-600 hover:text-purple-600 cursor-pointer transition">
              <Image size={20} />
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleCommentFileUpload} />
            </label>
            <input className="flex-1 bg-gray-50 border border-gray-200 text-[#1a1a1c] rounded-full px-6 py-4 outline-none focus:border-purple-600 text-sm font-medium" placeholder="댓글을 남겨주세요." value={newComment} onChange={e => setNewComment(e.target.value)} />
            <button type="submit" className="bg-purple-600 text-white p-4 rounded-full hover:bg-purple-500 transition"><Send size={20} /></button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostDetailPage;