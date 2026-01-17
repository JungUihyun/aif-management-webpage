import React, { useState, useEffect } from "react";
import { CreditCard, AlertCircle, CheckCircle, Send } from "lucide-react";
import { User, DuesRecord, UserRole } from "../types";
import { api } from "../services/api";

interface DuesProps {
  user: User;
}

const Dues: React.FC<DuesProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<"status" | "all">("status"); // 탭 상태: 개인 내역 vs 전체 관리
  const [duesList, setDuesList] = useState<DuesRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // 회비 기능은 아직 구현되지 않았으므로 빈 배열 사용
    setDuesList([]);
    // 유저 목록은 관리자 페이지에서 필요
    api.getUsers().then(setUsers);
  }, []);

  // 필터링: 나의 회비 내역
  const myDues = duesList.filter((d) => d.userId === user.id);

  // 필터링: 미납자 목록 (관리자용)
  const unpaidUsers = duesList.filter((d) => d.status === "UNPAID");

  // ID로 유저 이름 찾기 헬퍼
  const getUserName = (id: string) =>
    users.find((u) => u.id === id)?.name || "Unknown";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">회비 관리</h1>

      {/* 요약 카드 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-gray-500 mb-1">내 납부 현황 (2023년)</p>
          <h2 className="text-3xl font-bold text-primary">30,000원</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            완납 3회
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            미납 0회
          </span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("status")}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "status"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500"
          }`}
        >
          내 납부 내역
        </button>
        {/* 관리자(임원/매니저)에게만 '전체 납부 관리' 탭 표시 */}
        {(user.role === UserRole.EXECUTIVE ||
          user.role === UserRole.MANAGER) && (
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            }`}
          >
            전체 납부 관리
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* 개인 납부 내역 테이블 */}
        {activeTab === "status" && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  월
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  납부일
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myDues.map((due) => (
                <tr key={due.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {due.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {due.amount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {due.status === "PAID" ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle size={16} className="mr-1" /> 납부완료
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-1" /> 미납
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {due.paidDate || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 전체 관리 테이블 (관리자용) */}
        {activeTab === "all" && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700">
                미납자 목록 ({unpaidUsers.length}명)
              </h3>
              <button className="flex items-center px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-bold hover:bg-yellow-500 transition-colors">
                <Send size={16} className="mr-2" />
                미납 알림 일괄 전송
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      해당 월
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unpaidUsers.map((due) => (
                    <tr key={due.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getUserName(due.userId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {due.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {due.amount.toLocaleString()}원
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-primary hover:text-green-800 font-medium">
                          납부 처리
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dues;
