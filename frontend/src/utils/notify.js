import { toast } from 'react-toastify';
import AppToast from '@/components/AppToast';

const showToast = (type, title, message, options = {}) => {
  toast(
    <AppToast type={type} title={title} message={message} />,
    {
      type,
      ...options,
    }
  );
};

const notify = {
  success: (title, message, options) =>
    showToast('success', title, message, options),

  error: (title, message, options) =>
    showToast('error', title, message, options),

  warning: (title, message, options) =>
    showToast('warning', title, message, options),

  info: (title, message, options) =>
    showToast('info', title, message, options),
};

export default notify;
