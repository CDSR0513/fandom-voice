import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mic2, Building2, Users } from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f9fa] transition-colors duration-500">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center text-left">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-purple-600 p-2 rounded-xl group-hover:bg-purple-500 transition shadow-md">
              <Mic2 size={18} className="text-white" />
            </div>
            <div>
              {/* 폰트 크기 text-lg -> text-base로 축소 */}
              <h1 className="text-base font-black text-[#1a1a1c]">아이유 팬덤 보이스</h1>
              <p className="text-[10px] text-gray-400 font-bold">아이유 전용 여론 수집 플랫폼</p>
            </div>
          </Link>

          {location.pathname === '/agency' ? (
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-50 text-[#1a1a1c] border border-gray-200 hover:bg-gray-100 transition shadow-sm">
              <Users size={16} className="text-purple-500" /> 팬 커뮤니티
            </button>
          ) : (
            <button onClick={() => navigate('/agency')} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-50 text-[#1a1a1c] border border-gray-200 hover:bg-gray-100 transition shadow-sm">
              <Building2 size={16} className="text-purple-500" /> 소속사 대시보드
            </button>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;