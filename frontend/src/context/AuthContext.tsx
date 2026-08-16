'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, AuthMeResponse, getMe, loginUser, logoutUser } from '@/lib/api';

interface AuthContextType {
  currentUser: User | null;
  currentRole: Role | null;
  permissions: Record<string, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }>;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
  canAccessModule: (module: string) => boolean;
  isCreateOnly: (module: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<
    Record<string, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }>
  >({});
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAuth = async () => {
    try {
      setLoading(true);
      const data: AuthMeResponse = await getMe();
      setCurrentUser(data.user);
      setCurrentRole(data.role);
      setPermissions(data.permissions || {});
    } catch (err) {
      setCurrentUser(null);
      setCurrentRole(null);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      setCurrentUser(data.user);
      setCurrentRole(data.role);
      setPermissions(data.permissions || {});
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setCurrentUser(null);
      setCurrentRole(null);
      setPermissions({});
    }
  };

  // Permission Check Helpers
  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!currentUser || !currentRole) return false;
    if (currentRole.name === 'Super Admin') return true;

    const modPerm = permissions[module];
    if (!modPerm) return false;

    const flagKey = `can_${action}` as keyof typeof modPerm;
    return !!modPerm[flagKey];
  };

  // Returns true if user has view OR create permission (module is reachable)
  const canAccessModule = (module: string): boolean => {
    return hasPermission(module, 'view') || hasPermission(module, 'create');
  };

  // Returns true if user has create permission but NO view permission (Create-only mode)
  const isCreateOnly = (module: string): boolean => {
    if (currentRole?.name === 'Super Admin') return false;
    return hasPermission(module, 'create') && !hasPermission(module, 'view');
  };

  const isAuthenticated = !!currentUser && currentUser.is_active;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        permissions,
        loading,
        isAuthenticated,
        hasPermission,
        canAccessModule,
        isCreateOnly,
        login,
        logout,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
