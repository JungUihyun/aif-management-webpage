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
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // 실수 방지를 위한 확인 메시지
    if (
      !window.confirm(
        `정말로 해당 멤버의 권한을 '${getUserRoleLabel(
          newRole
        )}'로 변경하시겠습니까?`
      )
    ) {
      // 취소 시 UI를 원래대로 되돌리기 위해 다시 로드 (혹은 로컬 state rollback)
      loadUsers();
      return;
    }

    try {
      const success = await api.updateUserRole(userId, newRole);
      if (success) {
        // 성공 시 로컬 상태 업데이트 (Optimistic UI)
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        // alert("권한이 변경되었습니다."); // 선택사항: 너무 빈번하면 귀찮을 수 있음
      } else {
        alert("권한 변경에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  // 권한별 Select Box 스타일 반환 헬퍼
  const getRoleSelectStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.EXECUTIVE:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case UserRole.MANAGER:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case UserRole.MEMBER:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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
                  권한 설정
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Select Box를 뱃지처럼 스타일링하여 병합 */}
                    <div className="relative inline-block w-30">
                      <select
                        value={user.role}
                        onChange={
                          (e) =>
                            handleRoleChange(
                              user.id,
                              e.target.value as UserRole
                            ) // 즉시 변경 핸들러 호출
                        }
                        className={`block w-full pl-3 pr-8 py-2 text-xs font-bold border rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${getRoleSelectStyle(
                          user.role
                        )}`}
                      >
                        <option value={UserRole.MEMBER}>회원</option>
                        <option value={UserRole.MANAGER}>매니저</option>
                        <option value={UserRole.EXECUTIVE}>임원</option>
                      </select>
                      {/* 커스텀 화살표 아이콘 */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
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
