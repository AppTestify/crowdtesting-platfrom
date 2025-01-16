import { File } from "../_models/file.model";

export async function filterDocuments(
  searchString: string,
  skip: number,
  limit: number,
  verify: boolean
) {
  const regex = new RegExp(searchString, "i");

  const reportsPipeline = [
    {
      $match: {
        isVerify: verify,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $addFields: {
        fullName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
        address: "$address",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "verifyBy",
        foreignField: "_id",
        as: "verifyBy",
      },
    },
    { $unwind: { path: "$verifyBy", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        verifyFullName: {
          $concat: ["$verifyBy.firstName", " ", "$verifyBy.lastName"],
        },
        address: "$address",
      },
    },
    {
      $match: {
        $or: [
          { name: regex },
          { fileType: regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
          { fullName: regex },
          { "verifyBy.firstName": regex },
          { "verifyBy.lastName": regex },
          { verifyFullName: regex },
        ],
      },
    },
    {
      $addFields: {
        userId: "$user",
      },
    },
    {
      $project: {
        user: 0,
      },
    },
  ];

  const totalDocuments = await File.aggregate([
    ...reportsPipeline,
    { $count: "total" },
  ]);

  const documents = await File.aggregate([
    ...reportsPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    documents,
    totalDocuments: totalDocuments[0]?.total || 0,
  };
}
