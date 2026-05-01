import { Alert } from 'react-bootstrap';
import type { ReactNode } from 'react';

type MessageProps = {
  variant?: 'info' | 'danger' | 'success' | 'warning';
  children: ReactNode;
};

const Message = ({ variant = 'info', children }: MessageProps) => {
  return <Alert variant={variant}>{children}</Alert>;
};

export default Message;
