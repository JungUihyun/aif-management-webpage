import React, { useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { api } from "../services/mockData";
import { getUserRoleLabel } from "../utils/formatters";
import { Users, AlertTriangle, RefreshCw } from "lucide-react";

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getUsers().then(setUsers);
  }, []);

  // 유저 권한 변경 핸들러 (임원/매니저/멤버)
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    // 실제 앱에서는 await api.updateUserRole(userId, newRole) 호출 필요
    // 현재는 로컬 상태만 업데이트하여 UI에 즉시 반영
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  // 카카오뱅크 입금 내역 동기화 시뮬레이션
  const handleBankSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("카카오뱅크 거래내역이 성공적으로 업데이트되었습니다.");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">관리자 페이지</h1>

      {/* 회비 자동 납부 동기화 섹션 */}
      {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800 flex items-center">
            <div className="w-6 h-6 bg-yellow-300 rounded mr-2 flex items-center justify-center text-xs font-bold text-black">
              K
            </div>
            회비 자동 납부 확인 (KakaoBank)
          </h2>
          <button
            onClick={handleBankSync}
            disabled={loading}
            className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "동기화 중..." : "거래내역 동기화"}
          </button>
        </div>
        <p className="text-sm text-gray-500">
          최근 1시간 동안의 입금 내역을 불러와 회비 납부 상태를 자동으로
          업데이트합니다.
        </p>
      </div> */}

      {/* 동아리원 권한 관리 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center">
            <Users size={20} className="mr-2 text-primary" />
            동아리원 권한 관리
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  학번
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  현재 권한
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  권한 변경
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full mr-3"
                        src={user.avatarUrl}
                        alt=""
                      />
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* 권한에 따른 배지 색상 구분 */}
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${
                                      user.role === UserRole.EXECUTIVE
                                        ? "bg-purple-100 text-purple-800"
                                        : user.role === UserRole.MANAGER
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                    >
                      {getUserRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as UserRole)
                      }
                      className="border border-gray-300 rounded text-sm p-1"
                    >
                      <option value={UserRole.MEMBER}>회원</option>
                      <option value={UserRole.MANAGER}>매니저</option>
                      <option value={UserRole.EXECUTIVE}>임원</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
