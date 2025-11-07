// src/lib/hooks/useAuth.ts
import { useAuthStore } from '@/store/authStore';
import { login as apiLogin, logout as apiLogout, register as apiRegister, getProfile } from '@/lib/api/auth';
import { LoginRequest, RegisterRequest } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';

export const useAuth = () => {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, login, logout, updateUser, setLoading } = useAuthStore();

  /**
   * ログイン処理
   */
  const handleLogin = async (data: LoginRequest) => {
    try {
      setLoading(true);
      const response = await apiLogin(data);
      
      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        router.push('/mypage');
        return { success: true };
      }
      
      return { success: false, message: response.message || 'ログインに失敗しました' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'ログインに失敗しました';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 会員登録処理
   */
  const handleRegister = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      const response = await apiRegister(data);
      
      if (response.success) {
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message || '登録に失敗しました' };
    } catch (error: any) {
      const message = error.response?.data?.message || '登録に失敗しました';
      const errors = error.response?.data?.errors;
      return { success: false, message, errors };
    } finally {
      setLoading(false);
    }
  };

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    try {
      setLoading(true);
      await apiLogout();
      logout();
      router.push('/login');
    } catch (error) {
      // エラーが発生してもローカルのログアウトは実行
      logout();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ユーザー情報を再取得
   */
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      
      if (response.success && response.data) {
        updateUser(response.data.user);
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      // 認証エラーの場合はログアウト
      logout();
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setLoading, updateUser, logout]);

  /**
   * 認証状態の初期化（ページロード時）
   * authStoreがlocalStorageからトークンを復元済み
   */
  useEffect(() => {
    // トークンはあるがユーザー情報がない場合、再取得
    if (token && !user && !isLoading) {
      fetchUser();
    }
  }, [token, user, isLoading, fetchUser]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    handleLogin,
    handleRegister,
    handleLogout,
    fetchUser,
  };
};