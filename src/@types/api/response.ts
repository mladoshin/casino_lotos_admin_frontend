import { UserRole } from "../enum/UserRole";

export type Response = {
  statusCode: HTTP_CODES;
  message: string;
};
export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
};

export type ResponseError = {
  data: {
    message: string;
  };
  status: HTTP_CODES;
};
