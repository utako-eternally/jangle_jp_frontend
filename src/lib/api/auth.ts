// src/lib/api/auth.ts
import apiClient from './client';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  UploadAvatarResponse,
} from '@/types/api';
import { User } from '@/types/models';

/**
 * 会員登録
 */
export const register = async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

/**
 * メール認証
 */
export const verifyEmail = async (data: VerifyEmailRequest): Promise<ApiResponse<VerifyEmailResponse>> => {
  const response = await apiClient.post('/auth/verify', data);
  return response.data;
};

/**
 * 登録完了
 */
export const completeRegistration = async (
  data: CompleteRegistrationRequest
): Promise<ApiResponse<CompleteRegistrationResponse>> => {
  const response = await apiClient.post('/auth/complete', data);
  return response.data;
};

/**
 * ログイン
 */
export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

/**
 * ログアウト
 */
export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

/**
 * プロフィール取得
 */
export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * プロフィール更新
 */
export const updateProfile = async (data: {
  first_name?: string;
  last_name?: string;
  nick_name?: string;
}): Promise<ApiResponse<User>> => {
  const response = await apiClient.post('/auth/me/update', data);
  return response.data;
};

/**
 * アバター画像アップロード
 */
export const uploadAvatar = async (file: File): Promise<ApiResponse<UploadAvatarResponse>> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/auth/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * アバター画像削除
 */
export const deleteAvatar = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.post('/auth/me/avatar/delete');
  return response.data;
};