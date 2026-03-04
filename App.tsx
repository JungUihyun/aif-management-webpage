import React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import MatchDetail from './pages/MatchDetail';
import MyPage from './pages/MyPage';
import Admin from './pages/Admin';
import Notices from './pages/Notices';
import LoginPage from './pages/Login';
import EditProfile from './pages/EditProfile';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 메인 앱 라우팅 및 레이아웃 구성
const AppContent = () => {
  const { user, isLoading } = useAuth();

  // 로딩 상태 처리
  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center text-primary bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );

  // 비로그인 시 로그인 페이지 렌더링
  if (!user) {
    return <LoginPage />;
  }

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/match/:id" element={<MatchDetail user={user} />} />
          <Route path="/notices" element={<Notices user={user} />} />
          <Route path="/mypage" element={<MyPage user={user} />} />
          <Route path="/mypage/edit" element={<EditProfile user={user} />} />
          {/* 관리자 페이지는 EXECUTIVE 권한일 떄만 접근 가능 */}
          <Route
            path="/admin"
            element={
              user.role === 'EXECUTIVE' ? <Admin /> : <Navigate to="/" />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
