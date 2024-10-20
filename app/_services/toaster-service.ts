import { toast } from "sonner";
import { GENERIC_ERROR_MESSAGE } from "../_constants/errors";

const toasterService = {
  success: (message: string, description = "") => {
    toast.success(message, {
      description,
    });
  },

  error: (message: string = GENERIC_ERROR_MESSAGE, description = "") => {
    toast.error(message || GENERIC_ERROR_MESSAGE, {
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
