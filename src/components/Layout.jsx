import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic2, Building2 } from 'lucide-react';

const Layout = ({ children }) => {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'auto');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const applyTheme = () => {
      const mode = localStorage.getItem('themeMode') || 'auto';
      if (mode === 'auto') {
        const hour = new Date().getHours();
        setIsDarkMode(hour < 6 || hour >= 19);
      } else {
        setIsDarkMode(mode === 'dark');
      }
    };
    
    applyTheme();
    // 다른 페이지에서 테마를 바꾸면 상단바도 즉시 바뀌도록 감지
    const interval = setInterval(applyTheme, 500);
    return () => clearInterval(interval);
  }, []);

  const theme = isDarkMode
    ? { headerBg: "bg-[#0f0f10]", border: "border-white/10", text: "text-white", subText: "text-gray-500", btnBg: "bg-[#1a1a1c]", btnHover: "hover:bg-white/10" }
    : { headerBg: "bg-[#ffffff]", border: "border-gray-200", text: "text-[#1a1a1c]", subText: "text-gray-400", btnBg: "bg-gray-50", btnHover: "hover:bg-gray-100" };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-[#0f0f10]" : "bg-[#f8f9fa]"}`}>
      {/* 🚀 상단 네비게이션 바 (이제 테마에 맞춰 변합니다!) */}
      <header className={`sticky top-0 z-40 ${theme.headerBg} border-b ${theme.border} transition-colors duration-500`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center text-left">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-purple-600 p-2 rounded-xl group-hover:bg-purple-500 transition shadow-md">
              <Mic2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-black ${theme.text} transition-colors`}>아이유 팬덤 보이스</h1>
              <p className={`text-[10px] ${theme.subText} font-bold transition-colors`}>아이유 전용 여론 수집 플랫폼</p>
            </div>
          </Link>
          <button onClick={() => navigate('/agency')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${theme.btnBg} ${theme.text} border ${theme.border} ${theme.btnHover} transition`}>
            <Building2 size={16} className="text-purple-500" /> 소속사 대시보드
          </button>
        </div>
      </header>
      
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;