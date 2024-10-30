export function formatDate(dateString: string): string {
    const date = new Date(dateString); // Parse the date string
    const day = String(date.getUTCDate()).padStart(2, '0'); // Get day and pad with leading zero if needed
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Get month (0-based, so add 1) and pad
    const year = String(date.getUTCFullYear()).slice(-2); // Get last two digits of the year
    
    return `${day}/${month}/${year}`; // Return formatted date
  }
 