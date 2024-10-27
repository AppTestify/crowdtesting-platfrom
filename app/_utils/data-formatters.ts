export const normaliseIds = (data: any[]) => {
  return data.map((item) => {
    return { ...item, id: item._id, _id: undefined };
  });
};
