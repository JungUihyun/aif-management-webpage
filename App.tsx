
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import MatchDetail from './pages/MatchDetail';
import Dues from './pages/Dues';
import MyPage from './pages/MyPage';
import Admin from './pages/Admin';
import { User, UserRole } from './types';
import { api } from './services/mockData';
import { Lock, User as UserIcon, Settings, Shield, UserCircle } from 'lucide-react';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (id: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateUserRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user session exists (in a real app, check token)
    // For now, we start logged out
    setIsLoading(false);
  }, []);

  const login = async (id: string, password?: string) => {
    setIsLoading(true);
    const u = await api.login(id, password);
    if (u) {
        setUser(u);
        setIsLoading(false);
        return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Login Page Component ---
const LoginPage = () => {
    const { login } = useAuth();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        const success = await login(id, password);
        if (!success) {
            setError('학번 또는 비밀번호가 올바르지 않습니다.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full">
                <div className="text-center mb-8">
                    <div className="w-28 h-28 mx-auto mb-4 flex items-center justify-center">
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/ko/7/77/%EA%B1%B4%EA%B5%AD%EB%8C%80%ED%95%99%EA%B5%90_%EB%A7%88%EC%8A%A4%EC%BD%94%ED%8A%B8_%EC%BF%A0.png" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Konkuk_University_Emblem.svg/512px-Konkuk_University_Emblem.svg.png";
                            }}
                            alt="건국대학교 마스코트" 
                            className="w-full h-full object-contain filter drop-shadow-md"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">신융 축구동아리</h1>
                    <p className="text-gray-500 text-sm mt-1">부원 관리를 위한 통합 플랫폼</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">학번</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                                placeholder="학번을 입력하세요 (예: 202411523)"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                                placeholder="비밀번호"
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-xs text-center">{error}</div>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow-md disabled:opacity-50"
                    >
                        {isSubmitting ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        테스트 계정: 202411523 / 1234
                    </p>
                    <button className="text-xs text-primary mt-2 hover:underline">
                        비밀번호를 잊으셨나요?
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Role Switcher (Dev Tool) ---
const RoleSwitcher = () => {
    const { user, updateUserRole } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 space-y-1 animate-in slide-in-from-bottom-5">
                    <div className="text-xs font-bold text-gray-400 px-2 py-1">권한 변경 (테스트용)</div>
                    <button 
                        onClick={() => updateUserRole(UserRole.MEMBER)}
                        className={`w-full text-left px-3 py-2 rounded text-xs font-medium flex items-center ${user.role === UserRole.MEMBER ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        <UserCircle size={14} className="mr-2"/> 일반 멤버
                    </button>
                    <button 
                        onClick={() => updateUserRole(UserRole.MANAGER)}
                        className={`w-full text-left px-3 py-2 rounded text-xs font-medium flex items-center ${user.role === UserRole.MANAGER ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                         <Settings size={14} className="mr-2"/> 매니저
                    </button>
                    <button 
                        onClick={() => updateUserRole(UserRole.EXECUTIVE)}
                        className={`w-full text-left px-3 py-2 rounded text-xs font-medium flex items-center ${user.role === UserRole.EXECUTIVE ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        <Shield size={14} className="mr-2"/> 임원 (회장단)
                    </button>
                </div>
            )}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                title="Developer Menu"
            >
                <Settings size={20} />
            </button>
        </div>
    );
}

// --- Main App Component ---
const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center text-primary bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
  </div>;

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
          <Route path="/dues" element={<Dues user={user} />} />
          <Route path="/mypage" element={<MyPage user={user} />} />
          <Route path="/admin" element={user.role !== 'MEMBER' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
        <RoleSwitcher />
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
