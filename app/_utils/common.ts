export const downloadDocument = (contentType: any, base64: any, name: any) => {
  const base64String = `data:${contentType};base64,${base64}`;

  const downloadLink = document.createElement("a");

  downloadLink.href = base64String;

  downloadLink.download = `${name}`;

  downloadLink.click();
};

export const PAGINATION_LIMIT = 7;