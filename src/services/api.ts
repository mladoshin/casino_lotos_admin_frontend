import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const createApi = async (): Promise<AxiosInstance> => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  // TODO: 2024-04-29 / добавить обработку ошибок
  // - пустые переменные
  // - error respoce
  const res = await api.post("auth/sign", {
    email: import.meta.env.VITE_EMAIL,
    password: import.meta.env.VITE_PASS,
  });

  const token = res.data.tokens.accessToken;
  sessionStorage.setItem("accessToken", token);

  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers["Authorization"] = `Bearer ${token}`;

    return config;
  });

  return api;
};

export const api = await createApi();
