import "server-only";
import { Package } from "../_models/package.model";

export async function filterPackageForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  status?: boolean
) {
  const regex = new RegExp(searchString, "i");

  const pipeline: any[] = [
    {
      $match: {
        deletedAt: { $exists: false },
      },
    },
    ...(status !== undefined
      ? [
          {
            $match: {
              isActive: status,
            },
          },
        ]
      : []),
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
      },
    },
    {
      $match: {
        $or: [
          { name: regex },
          { type: regex },
          { description: regex },
          { currency: regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
          { fullName: regex },
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

  const totalPackages = await Package.aggregate([
    ...pipeline,
    { $count: "total" },
  ]);

  const packages = await Package.aggregate([
    ...pipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    packages,
    totalPackages: totalPackages[0]?.total || 0,
  };
}
