export type ApiMessageResponse = {
  success?: boolean;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  code?: string;
  type?: string;
  statusCode?: number;
};

export type ApiListResponse<T> = {
  success?: boolean;
  data?: T[];
} | T[];

export type ApiSingleResponse<T> = {
  success?: boolean;
  data?: T;
} | T;
