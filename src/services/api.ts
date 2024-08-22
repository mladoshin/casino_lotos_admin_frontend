import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";

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

  return api;
};

export const api = await createApi();

export const withCredentials = async (
  axiosRequest: (headers: AxiosRequestConfig<any>) => Promise<any>
) => {
  const token = localStorage.getItem("accessToken");
  const headers = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

  return await axiosRequest(headers);
};
