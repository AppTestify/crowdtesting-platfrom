import moment from 'moment';

export function formatDate(dateString: string): string {
  const date = moment(dateString);

  return date.format("MMMM Do, YYYY");
}
