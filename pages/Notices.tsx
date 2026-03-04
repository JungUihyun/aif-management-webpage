import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, X, AlertTriangle, Plus, Edit2, Trash2 } from 'lucide-react';
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
  }, [location.search, notices, navigate]);

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
      <div className="flex justify-between items-end px-2 mb-1 mt-2">
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">
          공지사항
        </h1>
        {/* 임원/매니저만 작성 버튼 표시 */}
        {canManageNotices && (
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-[#f2f4f6] text-gray-700 font-bold rounded-[14px] hover:bg-gray-200 transition-colors text-[14px]"
          >
            <Plus size={18} className="mr-1 stroke-2" />
            작성
          </button>
        )}
      </div>

      {/* 공지사항 목록 */}
      <div className="bg-white rounded-[28px] p-2 shadow-[0_2px_14px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col">
          {notices.length > 0 ? (
            notices.map((notice, idx) => (
              <div
                key={notice.id}
                onClick={() => viewNotice(notice)}
                className={`p-5 mx-1 transition-colors active:bg-gray-50 cursor-pointer ${
                  idx !== notices.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="flex items-start mb-1.5 gap-2">
                  {notice.isImportant === 1 && (
                    <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                      필독
                    </span>
                  )}
                  <h3 className="text-[17px] font-bold text-gray-900 leading-snug break-words">
                    {notice.title}
                  </h3>
                </div>
                <p className="text-[14px] text-gray-500 line-clamp-2 mb-2 leading-relaxed ml-1">
                  {notice.content}
                </p>
                <p className="text-[12px] font-medium text-gray-400 ml-1">
                  {notice.createdAt?.split('T')[0] || notice.date}
                </p>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 font-medium">
              <Bell size={40} className="mx-auto mb-3 text-gray-200 stroke-1" />
              <p>등록된 공지사항이 아직 없네요.</p>
            </div>
          )}
        </div>
      </div>

      {/* 공지사항 상세/수정 모달 */}
      {(selectedNotice || isEditMode) && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 sm:p-4 transition-opacity">
          <div className="bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-300 pb-safe">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 pt-7 pb-4 border-b border-gray-50 flex justify-between items-start z-10 transition-colors">
              <div className="flex-1 pr-4">
                {isEditMode ? (
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
                    {selectedNotice ? '공지사항 수정' : '새 공지 작성'}
                  </h2>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedNotice?.isImportant === 1 && (
                        <span className="bg-red-50 text-red-500 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          필독
                        </span>
                      )}
                      <p className="text-[13px] font-medium text-gray-400">
                        {selectedNotice?.createdAt?.split('T')[0] ||
                          selectedNotice?.date}
                      </p>
                    </div>
                    <h2 className="text-[22px] font-bold text-gray-900 leading-snug break-words">
                      {selectedNotice?.title}
                    </h2>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedNotice(null);
                  setIsEditMode(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors bg-gray-50 flex-shrink-0"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6">
              {isEditMode ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[14px] font-bold text-gray-700 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full bg-[#f2f4f6] rounded-[16px] px-5 py-4 text-[16px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a550]/20 transition-all border-none"
                      placeholder="공지사항 제목을 입력해요"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-bold text-gray-700 mb-2">
                      내용
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full bg-[#f2f4f6] rounded-[16px] px-5 py-4 text-[16px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a550]/20 transition-all border-none resize-none"
                      rows={8}
                      placeholder="공지사항 내용을 상세히 작성해주세요"
                      required
                    />
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-[16px]">
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
                      className="w-5 h-5 text-[#00a550] border-gray-300 rounded focus:ring-[#00a550]"
                    />
                    <label
                      htmlFor="isImportant"
                      className="ml-3 text-[15px] font-bold text-gray-800"
                    >
                      중요 공지로 표시할까요?
                    </label>
                  </div>

                  {/* 버튼 */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 px-4 py-4 bg-gray-100 rounded-[16px] text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-[2] flex justify-center items-center px-4 py-4 bg-[#00a550] text-white rounded-[16px] font-bold hover:bg-[#008f45] transition-colors disabled:opacity-50"
                    >
                      {/* <Save size={18} className="mr-2" /> */}
                      {isSaving ? '저장 중...' : '저장하기'}
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
