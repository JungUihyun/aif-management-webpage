import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  X,
  AlertTriangle,
  Plus,
  Save,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Notice, User, UserRole } from '../types';
import { api } from '../services/api';
import { useNotices } from '../hooks/useNotices';

interface NoticesProps {
  user: User;
}

const Notices: React.FC<NoticesProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notices: initialNotices, refetch } = useNotices();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 작성/수정 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isImportant: 0,
  });

  // 커스텀 훅에서 받은 데이터를 로컬 상태에 동기화
  useEffect(() => {
    setNotices(initialNotices);
  }, [initialNotices]);

  // URL 파라미터로 특정 공지 오픈
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openId = params.get('openId');

    if (openId && notices.length > 0) {
      const notice = notices.find((n) => n.id === openId);
      if (notice) {
        viewNotice(notice);
        navigate('/notices', { replace: true });
      }
    }
  }, [location.search, notices]);

  // 공지사항 작성 모달 열기
  const openCreateModal = () => {
    setFormData({ title: '', content: '', isImportant: 0 });
    setSelectedNotice(null);
    setIsEditMode(true);
  };

  // 공지사항 수정 모드로 전환
  const startEdit = (notice: Notice) => {
    setFormData({
      title: notice.title,
      content: notice.content,
      isImportant: notice.isImportant,
    });
    setIsEditMode(true);
  };

  // 수정 취소
  const cancelEdit = () => {
    setIsEditMode(false);
    if (selectedNotice) {
      // 수정 중이었다면 상세보기로 돌아감
      setFormData({
        title: selectedNotice.title,
        content: selectedNotice.content,
        isImportant: selectedNotice.isImportant,
      });
    }
  };

  // 작성/수정 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let success = false;

      if (selectedNotice) {
        // 수정
        success = await api.updateNotice(selectedNotice.id, {
          title: formData.title,
          content: formData.content,
          isImportant: formData.isImportant,
        });

        if (success) {
          alert('공지사항이 수정되었습니다!');
          // 수정된 데이터로 상세보기 모달 업데이트
          const updatedNotice = await api.getNoticeById(selectedNotice.id);
          if (updatedNotice) {
            setSelectedNotice(updatedNotice);
          }
          setIsEditMode(false);
          await refetch().then((data) => setNotices(data || []));
        }
      } else {
        // 작성
        success = await api.createNotice({
          title: formData.title,
          content: formData.content,
          authorId: user.id,
          isImportant: formData.isImportant,
        });

        if (success) {
          alert('공지사항이 작성되었습니다!');
          setIsEditMode(false);
          await refetch().then((data) => setNotices(data || []));
        }
      }

      if (!success) {
        alert(`공지사항 ${selectedNotice ? '수정' : '작성'}에 실패했습니다.`);
      }
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noticeToDelete) return;

    setIsDeleting(true);
    const success = await api.deleteNotice(noticeToDelete.id);

    if (success) {
      alert('공지사항이 삭제되었습니다.');
      setIsDeleteModalOpen(false);
      setNoticeToDelete(null);
      setSelectedNotice(null);
      await refetch().then((data) => setNotices(data || []));
    } else {
      alert('공지사항 삭제에 실패했습니다.');
    }
    setIsDeleting(false);
  };

  const confirmDelete = (notice: Notice) => {
    setNoticeToDelete(notice);
    setIsDeleteModalOpen(true);
  };

  // 공지사항 클릭 시 상세보기
  const viewNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsEditMode(false);
    setFormData({
      title: notice.title,
      content: notice.content,
      isImportant: notice.isImportant,
    });
  };

  // 수정/삭제 권한 체크
  const canManageNotices =
    user.role === UserRole.EXECUTIVE || user.role === UserRole.MANAGER;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Bell className="mr-2 text-primary" size={28} />
          공지사항
        </h1>
        {/* 임원/매니저만 작성 버튼 표시 */}
        {canManageNotices && (
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            작성
          </button>
        )}
      </div>

      {/* 공지사항 목록 */}
      <div className="grid gap-4">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => viewNotice(notice)}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex items-center mb-2">
                {notice.isImportant === 1 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded mr-2">
                    중요
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-800">
                  {notice.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {notice.content}
              </p>
              <p className="text-xs text-gray-400">
                {notice.createdAt || notice.date}
              </p>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-xl text-center text-gray-500 shadow-sm">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p>등록된 공지사항이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 공지사항 상세/수정 모달 */}
      {(selectedNotice || isEditMode) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-start">
              <div className="flex-1">
                {isEditMode ? (
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedNotice ? '공지사항 수정' : '공지사항 작성'}
                  </h2>
                ) : (
                  <div>
                    <div className="flex items-center mb-2">
                      {selectedNotice?.isImportant === 1 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mr-2">
                          중요
                        </span>
                      )}
                      <h2 className="text-2xl font-bold text-gray-800">
                        {selectedNotice?.title}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedNotice?.createdAt || selectedNotice?.date}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedNotice(null);
                  setIsEditMode(false);
                }}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                <X size={24} />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6">
              {isEditMode ? (
                /* 수정/작성 폼 */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="공지사항 제목을 입력하세요"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      내용
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                      rows={12}
                      placeholder="공지사항 내용을 입력하세요"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isImportant"
                      checked={formData.isImportant === 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isImportant: e.target.checked ? 1 : 0,
                        })
                      }
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="isImportant"
                      className="ml-2 text-sm text-gray-700"
                    >
                      중요 공지로 표시
                    </label>
                  </div>

                  {/* 버튼 */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <Save size={18} className="mr-2" />
                      {isSaving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </form>
              ) : (
                /* 상세보기 */
                <>
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedNotice?.content}
                    </p>
                  </div>

                  {/* 임원/매니저만 수정/삭제 버튼 */}
                  {canManageNotices && selectedNotice && (
                    <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
                      <button
                        onClick={() => startEdit(selectedNotice)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit2 size={16} className="mr-2" />
                        수정
                      </button>
                      <button
                        onClick={() => confirmDelete(selectedNotice)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={16} className="mr-2" />
                        삭제
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && noticeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle size={24} className="mr-2" />
              <h3 className="text-xl font-bold">공지사항 삭제</h3>
            </div>

            <p className="text-gray-700 mb-6">
              정말로 <strong>"{noticeToDelete.title}"</strong> 공지사항을
              삭제하시겠습니까?
              <br />
              <span className="text-sm text-red-600">
                이 작업은 되돌릴 수 없습니다.
              </span>
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setNoticeToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
