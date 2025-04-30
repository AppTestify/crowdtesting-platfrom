import "server-only";
import { ObjectId } from "mongodb";
import { Package } from "../_models/package.model";
import { AddOn } from "../_models/addon.model";

export async function filterAddonForAdmin(
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
          { description: regex },
          { amount: regex },
          { amountType: regex },
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

  const totalAddOns = await AddOn.aggregate([
    ...pipeline,
    { $count: "total" },
  ]);

  const addOns = await AddOn.aggregate([
    ...pipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    addOns,
    totalAddOns: totalAddOns[0]?.total || 0,
  };
}