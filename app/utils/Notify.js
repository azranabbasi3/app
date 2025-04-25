import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const notify = (errorType, errorMessage) => {
  
  switch (errorType) {
    case 'basic':
      toast(errorMessage);
      break;
    case 'success':
      toast(errorMessage);
      break;
    case 'info':
      toast.info(errorMessage);
      break;
    case 'error':
      toast.error(errorMessage);
      break;
    case 'warn':
      toast.warn(errorMessage);
      break;
    default:
      console.log('Invalid error type');
  }
};
