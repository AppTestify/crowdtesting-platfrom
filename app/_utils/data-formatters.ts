import { CUSTOM_ID_REGEX } from "../_constants/constant-server-side";

export const normaliseIds = (data: any[]) => {
  return data.map((item) => {
    return { ...item, id: item._id, _id: undefined };
  });
};

export const addCustomIds = (data: any[], idFormat: string) => {
  return data.map((item) => {
    return { ...item, id: item._id, _id: undefined, customId: replaceCustomId(idFormat, item.customId) };
  });
};


const replaceCustomId = (str: string, value: any) => {
  return str.replace(CUSTOM_ID_REGEX, value);
};
