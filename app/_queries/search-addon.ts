import "server-only";
import { AddOn } from "../_models/addon.model";

export async function filterAddonForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  status?: boolean | string
) {
  const regex = new RegExp(searchString, "i");

  let parsedStatus: boolean | undefined;
  if (status === "true" || status === true) {
    parsedStatus = true;
  } else if (status === "false" || status === false) {
    parsedStatus = false;
  }

  const pipeline: any[] = [
    {
      $match: {
        deletedAt: { $exists: false },
      },
    },
    // ...(status !== undefined
    //   ? [
    //       {
    //         $match: {
    //           isActive: status,
    //         },
    //       },
    //     ]
    //   : []),

    ...(parsedStatus !== undefined
      ? [
          {
            $match: {
              isActive: parsedStatus,
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
        amountStr: { $toString: "$amount" },
      },
    },
    {
      $match: {
        $or: [
          { name: regex },
          { description: regex },
          { amountStr: regex },
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
        amountStr:0,
      },
    },
  ];

  const totalAddOns = await AddOn.aggregate([...pipeline, { $count: "total" }]);

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
