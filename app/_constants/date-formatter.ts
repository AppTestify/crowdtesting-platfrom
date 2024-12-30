import moment from 'moment';

export function formatDate(dateString: string): string {
  const date = moment(dateString);

  return date.format("MMMM Do YYYY hh:mm A");
}

export function formatDateWithoutTime(dateString: string): string {
  const date = moment(dateString);

  return date.format("MMM Do YYYY ");
}

export function formatDateReverse(dateString: string | Date): string {
  const isoDate = moment(dateString, "MMMM Do, YYYY").toISOString();
  return isoDate;
}

export function formatSimpleDate(dateString: string | Date): string {
  let date = moment(dateString, "MMMM Do, YYYY");

  if (!date.isValid()) {
    date = moment(new Date(dateString));
  }

  return date.format("MM/D/YY");
}

export function formatAttachmentDate(dateString: string): string {
  const date = moment(dateString);

  return date.format("DD MMM YYYY, hh:mm A");
}