import moment from 'moment';

export function formatDate(dateString: string): string {
  const date = moment(dateString);

  return date.format("MMMM Do, YYYY");
}

export function formatSimpleDate(dateString: string | Date): string {
  const date = moment(dateString, "MMMM Do, YYYY");

  if (!date.isValid()) {
    throw new Error("Invalid date format");
  }

  return date.format("MM/D/YY");
}