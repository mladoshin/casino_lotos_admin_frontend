import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const createApi = async (): Promise<AxiosInstance> => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  let token = localStorage.getItem("accessToken");
  if (!token) {
    if (window.location.href !== `${window.location.origin}/login`) {
      window.location.href = `${window.location.origin}/login`;
    }
  }

  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  });

  return api;
};

export const api = await createApi();
