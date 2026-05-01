export type ApiMessageDto = {
  success?: boolean;
  message?: string;
};

export type ApiErrorDto = {
  success: false;
  message: string;
  code?: string;
  type?: string;
  statusCode?: number;
};
