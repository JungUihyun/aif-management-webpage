import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface EditProfileProps {
  user: User;
}

const EditProfile: React.FC<EditProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const { updateUserProfileContext } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState('');

  // 수정 가능한 폼 상태 유지
  const [formData, setFormData] = useState({
    name: user.name || '',
    shortName: user.shortName || '',
    birth: user.birth?.toString() || '',
    gender: user.gender || 1,
    backNumber: user.backNumber?.toString() || '',
    position: user.position || 'MF',
    email: user.email || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 용량 제한 (예: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploadingImage(true);
    setError('');

    try {
      const uploadResult = await api.uploadAvatar(user.id, file);

      if (uploadResult.success && uploadResult.url) {
        // DB에 즉시 저장
        const updateResult = await api.updateUserProfile(user.id, {
          avatarUrl: uploadResult.url,
        });

        if (updateResult.success) {
          // 전역 컨텍스트의 유저 정보 업데이트
          updateUserProfileContext({ avatarUrl: uploadResult.url });
          // 성공 메시지 (선택사항)
        } else {
          setError(
            `프로필 사진 저장 실패: ${updateResult.error || '알 수 없는 오류'}`
          );
        }
      } else {
        setError(
          `이미지 업로드 실패: ${uploadResult.error || '알 수 없는 오류'}`
        );
      }
    } catch (err: any) {
      console.error('이미지 업로드 에러:', err);
      setError(`이미지 업로드 중 오류가 발생했습니다.`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 숫자 변환 및 데이터 준비
      const updateData = {
        name: formData.name,
        shortName: formData.shortName,
        birth: parseInt(formData.birth),
        gender: parseInt(formData.gender.toString()),
        backNumber: formData.backNumber
          ? parseInt(formData.backNumber)
          : undefined,
        position: formData.position,
        email: formData.email,
      };

      if (isNaN(updateData.birth) || updateData.birth.toString().length !== 8) {
        setError('생년월일은 8자리 숫자로 입력해주세요. (예: 20040101)');
        setIsSubmitting(false);
        return;
      }

      const result = await api.updateUserProfile(user.id, updateData);

      if (result.success) {
        // 전역 상태 업데이트
        updateUserProfileContext(updateData);
        alert('내 정보가 성공적으로 수정되었습니다.');
        navigate(-1);
      } else {
        setError(`저장 실패: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error(error);
      setError(`오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      <div className="flex items-center px-1 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-800 hover:text-gray-500 transition-colors p-2 -ml-2 rounded-full active:bg-gray-100"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* 프로필 이미지 업로드 영역 */}
          <div className="relative group shrink-0">
            <div
              className={`w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-50 relative ${isUploadingImage ? 'opacity-50' : ''}`}
            >
              <img
                src={user.avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {/* 호버 오버레이 */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={24} className="text-white" />
              </div>
            </div>

            {/* 로딩 인디케이터 */}
            {isUploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={28} className="text-[#00a550] animate-spin" />
              </div>
            )}

            {/* 파일 입력 (숨김) */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploadingImage}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              title="프로필 사진 변경"
            />

            <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 pointer-events-none">
              <Camera size={14} className="text-gray-600" />
            </div>
          </div>

          <div className="flex-1 mt-2 sm:mt-4">
            <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
              내 정보 수정
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">
              아래의 정보를 변경하고 저장하세요.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2 pl-1">
                이름
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[16px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none"
                placeholder="본명"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2 pl-1">
                별명 (유니폼 마킹용)
              </label>
              <input
                type="text"
                name="shortName"
                value={formData.shortName}
                onChange={handleChange}
                className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[16px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none"
                placeholder="예: SHINYUNG"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2 pl-1">
                생년월일 (8자리)
              </label>
              <input
                type="text"
                name="birth"
                value={formData.birth}
                onChange={handleChange}
                maxLength={8}
                className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[16px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none"
                placeholder="20040101"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2 pl-1">
                성별
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[16px] font-bold text-gray-700 border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all outline-none"
              >
                <option value={1}>남성</option>
                <option value={2}>여성</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2 pl-1">
                등번호
              </label>
              <input
                type="text"
                name="backNumber"
                value={formData.backNumber}
                onChange={handleChange}
                maxLength={2}
                className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[16px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2 pl-1">
                주 포지션
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[16px] font-bold text-gray-700 border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all outline-none"
              >
                <option value="FW">FW (공격수)</option>
                <option value="MF">MF (미드필더)</option>
                <option value="DF">DF (수비수)</option>
                <option value="GK">GK (골키퍼)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-[13px] text-center font-bold bg-red-50 p-3 rounded-[12px] mt-4">
              {error}
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00a550] text-white py-4 rounded-[16px] font-bold text-[17px] hover:bg-[#008f45] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '변경 내용 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
