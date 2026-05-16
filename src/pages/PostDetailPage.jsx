import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, MessageSquare, Send, Heart, Edit3, Trash2, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const parseMediaUrls = (urlStr) => {
  if (!urlStr) return [];
  try { return JSON.parse(urlStr); } 
  catch { return [urlStr]; } 
};

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [newComment, setNewComment] = useState('');
  const [commentPassword, setCommentPassword] = useState('');
  const [commentMediaUrls, setCommentMediaUrls] = useState([]);
  const [isCommentUploading, setIsCommentUploading] = useState(false);
  const commentFileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMediaUrls, setEditMediaUrls] = useState([]); 
  const [isPostUploading, setIsPostUploading] = useState(false);
  const postFileInputRef = useRef(null);

  const [likedPosts, setLikedPosts] = useState(JSON.parse(localStorage.getItem('likedPosts') || '[]'));
  
  // 🔥 댓글 수정 전용 상태
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editCommentMediaUrls, setEditCommentMediaUrls] = useState([]);
  const [isCommentEditUploading, setIsCommentEditUploading] = useState(false);

  useEffect(() => {
    fetchPost(); fetchComments();
    const syncTheme = () => {
      const mode = localStorage.getItem('themeMode') || 'auto';
      setIsDarkMode(mode === 'dark' || (mode === 'auto' && (new Date().getHours() < 6 || new Date().getHours() >= 19)));
    };
    syncTheme();
    const interval = setInterval(syncTheme, 500);
    return () => clearInterval(interval);
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase.from('posts').select('*').eq('id', id).single();
    if (data) {
      let cat = data.category;
      setPost({ ...data, category: Array.isArray(cat) ? cat : [cat], parsedUrls: parseMediaUrls(data.media_url) });
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase.from('comments').select('*').eq('post_id', id).order('created_at', { ascending: true });
    if (data) setComments(data.map(c => ({ ...c, parsedUrls: parseMediaUrls(c.media_url) })));
  };

  const uploadFiles = async (files, setUploadingState, setUrlsState) => {
    if (!files.length) return;
    setUploadingState(true);
    const uploadedUrls = [];
    for (const file of files) {
      const filePath = `media/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('media').upload(filePath, file);
      if (!error) uploadedUrls.push(supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl);
    }
    setUrlsState(prev => [...prev, ...uploadedUrls]);
    setUploadingState(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !commentPassword.trim()) return alert("댓글과 비밀번호를 입력해주세요.");
    
    const { error } = await supabase.from('comments').insert([{ 
      post_id: id, content: newComment, password: commentPassword, author_name: '아이유팬', media_url: JSON.stringify(commentMediaUrls) 
    }]);
    
    if(!error) {
      await supabase.from('posts').update({ comment_count: (post.comment_count || 0) + 1 }).eq('id', id);
      setNewComment(''); setCommentPassword(''); setCommentMediaUrls([]);
      fetchComments(); fetchPost();
    }
  };

  // 🔥 댓글 수정 시작 (파일 배열도 불러오기)
  const startEditComment = (comment) => {
    const pwd = window.prompt("댓글 비밀번호를 입력하세요.");
    if (pwd === comment.password) { 
      setEditingCommentId(comment.id); 
      setEditCommentContent(comment.content); 
      setEditCommentMediaUrls(comment.parsedUrls || []); 
    }
    else alert("비밀번호 불일치");
  };

  // 🔥 댓글 수정 저장 (파일 배열도 같이 저장)
  const handleSaveCommentEdit = async (commentId) => {
    await supabase.from('comments').update({ 
      content: editCommentContent, 
      media_url: JSON.stringify(editCommentMediaUrls) 
    }).eq('id', commentId);
    setEditingCommentId(null); fetchComments();
  };

  const handleDeleteComment = async (comment) => {
    const pwd = window.prompt("비밀번호를 입력하세요.");
    if (pwd === comment.password) {
      if(window.confirm("삭제하시겠습니까?")) {
        await supabase.from('comments').delete().eq('id', comment.id);
        await supabase.from('posts').update({ comment_count: Math.max(0, (post.comment_count || 0) - 1) }).eq('id', id);
        fetchComments(); fetchPost();
      }
    } else alert("비밀번호 불일치");
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
    if (pwd === post.password) { 
      setIsEditing(true); setEditTitle(post.title); setEditContent(post.content); setEditMediaUrls(post.parsedUrls); 
    } else alert("비밀번호 불일치");
  };

  const handleSaveEdit = async () => {
    await supabase.from('posts').update({ title: editTitle, content: editContent, media_url: JSON.stringify(editMediaUrls) }).eq('id', id);
    setIsEditing(false); fetchPost();
  };

  const handleDeleteClick = async () => {
    const pwd = window.prompt("비밀번호를 입력하세요.");
    if (pwd === post.password) {
      if(window.confirm("삭제하시겠습니까?")) { await supabase.from('posts').delete().eq('id', id); navigate('/'); }
    } else alert("비밀번호 불일치");
  };

  const theme = isDarkMode 
    ? { bg: "bg-[#0f0f10]", card: "bg-[#1a1a1c]", text: "text-white", sub: "text-gray-400", border: "border-white/10", input: "bg-black text-white" }
    : { bg: "bg-[#f8f9fa]", card: "bg-white", text: "text-[#1a1a1c]", sub: "text-gray-500", border: "border-gray-200", input: "bg-gray-50 text-[#1a1a1c]" };

  if (!post) return <div className={`min-h-screen ${theme.bg} flex items-center justify-center ${theme.text}`}>로딩 중...</div>;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 md:p-6 font-sans text-left pb-32 overflow-x-hidden transition-colors duration-500`}>
      <div className="max-w-2xl mx-auto py-4 md:py-8">
        <button onClick={() => navigate(-1)} className={`mb-6 md:mb-8 ${theme.sub} flex items-center gap-1 hover:text-purple-500 font-bold text-sm`}>
          <ChevronLeft size={20} /> 목록으로
        </button>

        <div className={`${theme.card} p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border ${theme.border} mb-8 shadow-sm relative`}>
          {!isEditing && (
            <div className="absolute top-8 right-8 flex gap-3">
              <button onClick={handleEditClick} className={`${theme.sub} hover:text-blue-500 transition`}><Edit3 size={18} /></button>
              <button onClick={handleDeleteClick} className={`${theme.sub} hover:text-red-500 transition`}><Trash2 size={18} /></button>
            </div>
          )}

          <div className="flex gap-2 mb-6 mt-4">
            {post.category.map(c => <span key={c} className="bg-purple-600/10 text-purple-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase">{c}</span>)}
          </div>

          {isEditing ? (
            <div className="space-y-4 mb-6">
              <input className={`w-full text-2xl font-black ${theme.input} border ${theme.border} rounded-xl p-4 outline-none`} value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              <textarea className={`w-full text-base font-medium ${theme.input} border ${theme.border} rounded-2xl p-4 h-40 resize-none outline-none`} value={editContent} onChange={e => setEditContent(e.target.value)} />
              
              <div className={`border ${theme.border} p-4 rounded-xl`}>
                <button type="button" onClick={() => postFileInputRef.current?.click()} className={`text-xs font-bold ${theme.sub} flex gap-2`}>
                  <ImageIcon size={16}/> 파일 추가하기
                </button>
                <input type="file" ref={postFileInputRef} multiple accept="image/*,video/*" className="hidden" onChange={e => uploadFiles(Array.from(e.target.files), setIsPostUploading, setEditMediaUrls)} />
                {isPostUploading && <Loader2 size={14} className="animate-spin text-purple-600 mt-2" />}
                <div className="flex flex-wrap gap-2 mt-3">
                  {editMediaUrls.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                      {url.match(/\.(mp4|webm|ogg)$/i) ? <video src={url} className="w-full h-full object-cover"/> : <img src={url} className="w-full h-full object-cover"/>}
                      <button onClick={() => setEditMediaUrls(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-red-500 p-0.5 text-white rounded-full"><X size={10}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className={`px-4 py-2 ${theme.border} border text-sm font-bold rounded-xl`}>취소</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold">저장</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className={`text-2xl md:text-3xl font-black mb-6 leading-tight pr-10 ${theme.text}`}>{post.title}</h1>
              <p className={`${theme.sub} text-base leading-relaxed font-medium whitespace-pre-wrap mb-6`}>{post.content}</p>
              
              <div className="space-y-4 mb-8">
                {post.parsedUrls.map((url, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-gray-200/20 bg-black/5 max-h-[400px] flex justify-center">
                    {url.match(/\.(mp4|webm|ogg)$/i) ? <video src={url} controls className="max-h-[400px] w-full object-contain" /> : <img src={url} className="max-h-[400px] w-full object-contain" />}
                  </div>
                ))}
              </div>
            </>
          )}
          
          <button onClick={toggleLike} className={`flex items-center gap-2 px-6 py-3 rounded-full border ${likedPosts.includes(id) ? 'bg-red-500/10 border-red-500/20 text-red-500 font-bold' : `${theme.bg} ${theme.border} text-gray-400`}`}>
            <Heart size={20} fill={likedPosts.includes(id) ? "currentColor" : "none"} />
            <span className="text-sm font-bold">공감 {post.empathy_count || 0}</span>
          </button>
        </div>

        <div className="mb-6 flex items-center gap-2 px-2"><MessageSquare size={18} className="text-purple-500" /><h3 className="font-bold text-lg">댓글 {post.comment_count || 0}개</h3></div>
        
        <div className="space-y-4 mb-10">
          {comments.map(comment => (
            <div key={comment.id} className={`${theme.card} p-6 rounded-[2rem] border ${theme.border} shadow-sm relative`}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-sm text-purple-600">{comment.author_name}</span>
                {editingCommentId !== comment.id && (
                  <div className="flex gap-3 flex-shrink-0 ml-2">
                    <button onClick={() => startEditComment(comment)} className={`${theme.sub} hover:text-blue-500`}><Edit3 size={16}/></button>
                    <button onClick={() => handleDeleteComment(comment)} className={`${theme.sub} hover:text-red-500`}><Trash2 size={16}/></button>
                  </div>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className="mt-2">
                  <textarea className={`w-full p-3 ${theme.input} border ${theme.border} rounded-xl text-sm outline-none resize-none`} value={editCommentContent} onChange={e => setEditCommentContent(e.target.value)} />
                  
                  {/* 🔥 댓글 수정 파일 첨부 영역 */}
                  <div className={`mt-3 border ${theme.border} p-3 rounded-xl`}>
                    <button type="button" onClick={() => document.getElementById(`edit-comment-file-${comment.id}`).click()} className={`text-xs font-bold ${theme.sub} flex gap-2`}>
                      <ImageIcon size={14}/> 사진/영상 추가
                    </button>
                    <input id={`edit-comment-file-${comment.id}`} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => uploadFiles(Array.from(e.target.files), setIsCommentEditUploading, setEditCommentMediaUrls)} />
                    {isCommentEditUploading && <Loader2 size={14} className="animate-spin text-purple-600 mt-2" />}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {editCommentMediaUrls.map((url, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border">
                          {url.match(/\.(mp4|webm|ogg)$/i) ? <video src={url} className="w-full h-full object-cover"/> : <img src={url} className="w-full h-full object-cover"/>}
                          <button onClick={() => setEditCommentMediaUrls(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-red-500 p-0.5 text-white rounded-full"><X size={8}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-3">
                    <button onClick={() => setEditingCommentId(null)} className={`px-3 py-1.5 border ${theme.border} text-xs font-bold rounded-lg`}>취소</button>
                    <button onClick={() => handleSaveCommentEdit(comment.id)} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg">저장</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={`${theme.text} text-sm font-medium mb-3 whitespace-pre-wrap break-all`}>{comment.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {comment.parsedUrls.map((url, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden h-32 max-w-xs border border-gray-200/20 flex items-center justify-center bg-black/5">
                        {url.match(/\.(mp4|webm|ogg)$/i) ? <video src={url} controls className="h-full object-contain" /> : <img src={url} className="h-full object-cover" />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} className={`flex flex-col gap-3 ${theme.card} p-4 rounded-3xl border ${theme.border}`}>
          {commentMediaUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {commentMediaUrls.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16">
                  <img src={url} className="h-full w-full object-cover rounded-xl border border-gray-200/20" />
                  <button type="button" onClick={() => setCommentMediaUrls(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10}/></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="password" placeholder="비밀번호" maxLength={10} className={`w-1/3 ${theme.input} border ${theme.border} rounded-xl px-4 py-3 text-sm outline-none`} value={commentPassword} onChange={e => setCommentPassword(e.target.value)} />
            <button type="button" onClick={() => commentFileInputRef.current?.click()} className={`flex-shrink-0 flex items-center justify-center border ${theme.border} w-12 rounded-xl ${theme.sub} hover:text-purple-600 transition`}>
              <ImageIcon size={20} />
            </button>
            <input type="file" ref={commentFileInputRef} multiple accept="image/*,video/*" className="hidden" onChange={e => uploadFiles(Array.from(e.target.files), setIsCommentUploading, setCommentMediaUrls)} />
          </div>
          <div className="flex gap-2">
            <input className={`flex-1 min-w-0 ${theme.input} border ${theme.border} rounded-xl px-4 py-3 outline-none text-sm font-medium`} placeholder="의견을 남겨주세요." value={newComment} onChange={e => setNewComment(e.target.value)} />
            <button type="submit" className="flex-shrink-0 bg-purple-600 text-white px-5 rounded-xl font-bold shadow-md">등록</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostDetailPage;