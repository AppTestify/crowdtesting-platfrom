import moment from "moment";

const DATE_AND_TIME_FROMAT = "DD/MM/YY, hh:mm A";
const DATE_FROMAT = "DD/MM/YY";

export const formatDate = (date: string, isTime = false) => {
  if (!date) {
    return "";
  }
  return moment(date).format(isTime ? DATE_AND_TIME_FROMAT : DATE_FROMAT);
};

export const checkIfOneDayPassed = (date: string) => {
  if (!date) {
    return true;
  }
  return moment().diff(moment(date), "days") >= 1;
};
