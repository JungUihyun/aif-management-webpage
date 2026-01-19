import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  CreditCard,
  User,
  Shield,
  LogOut,
  Bell,
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  user: UserType | null;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const location = useLocation();
  const { logout } = useAuth();

  // 현재 경로가 활성화된 탭인지 확인하는 헬퍼 함수
  const isActive = (path: string) => location.pathname === path;

  // 모바일 하단 네비게이션 아이템 컴포넌트
  const NavItem = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string;
    icon: any;
    label: string;
  }) => (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
        isActive(to) ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon size={24} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );

  // 데스크탑 사이드바 네비게이션 아이템 컴포넌트
  const DesktopNavItem = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string;
    icon: any;
    label: string;
  }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
        isActive(to)
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} className="mr-3" />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* 
        데스크탑 사이드바 
        - md 브레이크포인트 이상에서만 표시 (hidden md:flex)
        - 화면 높이(h-screen)를 꽉 채우고 스크롤 시 sticky로 고정
      */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 flex items-center justify-center border-b border-gray-100">
          <div className="w-10 h-10 flex items-center justify-center text-3xl mr-2 filter drop-shadow-sm hover:scale-110 transition-transform cursor-default">
            ⚽
          </div>
          <h1 className="text-xl font-bold text-gray-800">신융축구동아리</h1>
        </div>

        <nav className="flex-1 p-4">
          <DesktopNavItem to="/" icon={Home} label="대시보드" />
          <DesktopNavItem to="/schedule" icon={Calendar} label="일정" />
          <DesktopNavItem to="/notices" icon={Bell} label="공지사항" />
          {/* <DesktopNavItem to="/dues" icon={CreditCard} label="회비 관리" /> */}
          <DesktopNavItem to="/mypage" icon={User} label="마이페이지" />

          {/* 관리자 권한(임원/매니저)이 있는 경우에만 관리자 메뉴 표시 */}
          {(user?.role === UserRole.EXECUTIVE ||
            user?.role === UserRole.MANAGER) && (
            <div className="mt-8">
              <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                관리자
              </div>
              <DesktopNavItem to="/admin" icon={Shield} label="관리자 페이지" />
            </div>
          )}
        </nav>

        {/* 사이드바 하단 프로필 영역 */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center mb-3">
            <img
              src={user?.avatarUrl}
              alt="Me"
              className="w-10 h-10 rounded-full bg-gray-200 object-cover"
            />
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">No. {user?.id}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut size={14} className="mr-2" /> 로그아웃
          </button>
        </div>
      </aside>

      {/* 
        모바일 헤더 
        - md 미만에서만 표시 (md:hidden)
        - 상단 고정 (sticky top-0)
      */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-20 h-14 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center text-2xl mr-2">
              ⚽
            </div>
            <span className="font-bold text-lg text-gray-800">AIF</span>
          </div>
        </Link>
        <div className="flex items-center space-x-3">
          <button
            onClick={logout}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut size={20} />
          </button>
          <Link to="/mypage">
            <img
              src={user?.avatarUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-gray-200 bg-gray-100 object-cover"
            />
          </Link>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto no-scrollbar">
        <div className="max-w-5xl mx-auto p-4 md:p-8">{children}</div>
      </main>

      {/* 
        모바일 하단 네비게이션 바
        - md 미만에서만 표시 (md:hidden)
        - 하단 고정 (fixed bottom-0)
      */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex z-20 pb-safe">
        <NavItem to="/" icon={Home} label="홈" />
        <NavItem to="/schedule" icon={Calendar} label="일정" />
        <NavItem to="/notices" icon={Bell} label="공지" />
        {/* <NavItem to="/dues" icon={CreditCard} label="회비" /> */}
        {/* 모바일에서는 공간 제약으로 권한에 따라 4번째 메뉴 변경 */}
        {user?.role === UserRole.EXECUTIVE ||
        user?.role === UserRole.MANAGER ? (
          <NavItem to="/admin" icon={Shield} label="관리" />
        ) : (
          <NavItem to="/mypage" icon={User} label="MY" />
        )}
      </nav>
    </div>
  );
};

export default Layout;
