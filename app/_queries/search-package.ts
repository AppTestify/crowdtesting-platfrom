import "server-only";
import { Package } from "../_models/package.model";

// export async function filterPackageForAdmin(
//   searchString: string,
//   skip: number,
//   limit: number,
//   status?: boolean
// ) {
//     const regex = new RegExp(searchString, "i");

//   const pipeline: any[] = [
//     {
//       $match: {
//         deletedAt: { $exists: false },
//       },
//     },
//     ...(status !== undefined
//       ? [
//           {
//             $match: {
//               isActive: status,
//             },
//           },
//         ]
//       : []),
//     {
//       $lookup: {
//         from: "users",
//         localField: "userId",
//         foreignField: "_id",
//         as: "user",
//       },
//     },
//     { $unwind: "$user" },
//     {
//       $addFields: {
//         fullName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
//       },
//     },
//     {
//       $match: {
//         $or: [
//           { name: regex },
//           { description: regex },
//           { amount: regex },
//           { amountType: regex },
//           { "user.firstName": regex },
//           { "user.lastName": regex },
//           { fullName: regex },
//         ],
//       },
//     },
//     {
//       $addFields: {
//         userId: "$user",
//       },
//     },
//     {
//       $project: {
//         user: 0,
//       },
//     },
//   ];

//   const totalPackages = await Package.aggregate([
//     ...pipeline,
//     { $count: "total" },
//   ]);

//   const packages = await Package.aggregate([
//     ...pipeline,
//     { $skip: skip },
//     { $limit: limit },
//   ]);

//   return {
//     packages,
//     totalPackages: totalPackages[0]?.total || 0,
//   };
// }


export async function filterPackageForAdmin(
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

    // Convert non-string fields to strings for regex matching
    {
      $addFields: {
        fullName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
        amountStr: { $toString: "$amount" },
        testersStr: { $toString: "$testers" },
        durationStr: { $toString: "$durationHours" },
        bugsStr: { $toString: "$bugs" },
        testExecutionStr: { $toString: "$testExecution" },
      },
    },

    // Use regex match on those new string fields
    {
      $match: {
        $or: [
          { name: regex },
          { type: regex }, 
          { description: regex },
          { currency: regex },
          { amountStr: regex },
          { testersStr: regex },
          { durationStr: regex },
          { bugsStr: regex },
          { testExecutionStr: regex },
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
        amountStr: 0,
        testersStr: 0,
        durationStr: 0,
        bugsStr: 0,
        testExecutionStr: 0,
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
