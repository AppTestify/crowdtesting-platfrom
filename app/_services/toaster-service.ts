import { toast } from "sonner";

const toasterService = {
  success: (message: string, description = "") => {
    toast.success(message, {
      description,
    });
  },

  error: (message: string, description = "") => {
    toast.error(message, {
      description,
    });
  },

  info: (message: string, description = "") => {
    toast.info(message, {
      description,
    });
  },

  warning: (message: string, description = "") => {
    toast.warning(message, {
      description,
    });
  },

  custom: (message: string, options = {}) => {
    toast(message, options);
  },
};

export default toasterService;
