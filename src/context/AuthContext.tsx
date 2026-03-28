import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useContext } from "react";
import { User } from "../types";
import toast from "react-hot-toast";
import apiInstance from "../lib/axios/axios";

interface LoginPayload {
  username: string;
  password: string;
  remember?: boolean;
  captchaToken: string | null;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
}

const AuthContext = React.createContext({
  user: null as User | null,
  isLoading: false,
  isLogin: false,
  error: null as Error | null,
  onLogout: () => {},
  onLogin: (email: string, password: string, captchaToken: string | null) => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  // Function Untuk User
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await apiInstance.get("/user");
      return response.data;
    },
    staleTime: 3 * 60 * 60 * 1000, // Data dianggap fresh selama 3 jam
    retry: false, // Tidak melakukan retry otomatis jika gagal
    enabled: !!localStorage.getItem("token"), // Hanya jalankan query jika token ada
  });

  // Menggunakan useMutation untuk login
  const {
    mutate: login,
    isPending: isLogin,
    error,
  } = useMutation<
    LoginResponse, // return type
    Error, // error type
    LoginPayload // variables type
  >({
    mutationFn: async (LoginPayload) => {
      const response = await apiInstance.post("/login", LoginPayload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      localStorage.setItem("token", data.token); // <-- gunakan token dari response backend bukan dari request
      toast.success("Login berhasil");
    },
    onError: (err: Error) => {
      console.error("Login gagal:", err.message);
      toast.error("Login gagal");
    },
  });

  //   Function untuk logout
  const { mutate: handleLogout } = useMutation({
    mutationFn: async () => {
      await apiInstance.post("/logout");
      return { success: true };
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logout berhasil");
    },
    onError: (err: Error) => {
      console.error("Logout gagal:", err.message);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLogin,
        error,
        onLogin: (username, password, captchaToken, remember) =>
          login({ username, password, captchaToken, remember }),
        onLogout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
