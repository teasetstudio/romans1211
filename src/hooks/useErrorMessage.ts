import { useTranslations } from "next-intl";

import { errCode } from "@/res/errorCodes";
import { NAMESPACE_COMMON } from "@/res/namespaces";

export interface IErrorMessage {
  getErrorMessage: (error: any) => string;
}

const useErrorMessage = (): IErrorMessage => {
  const t = useTranslations(NAMESPACE_COMMON);

  const getErrorMessage = (error: any) => {
    let errMessage;
    if (error.response) {
      // Request made and server responded
      if (Object.values(errCode).includes(error.response.data.message)) {
        const resErrMessage = error.response.data.message.toLowerCase();
        errMessage = t(resErrMessage);
      } else {
        errMessage = t("error.bad_request");
      }
    } else if (error.request) {
      // The request was made but no response was received
      errMessage = "404 Not Found";
    } else {
      // Something happened in setting up the request that triggered an Error
      errMessage = error.message || t("error.something_wrong");
    }

    return errMessage;
  };

  return {
    getErrorMessage,
  };
};

export default useErrorMessage;
