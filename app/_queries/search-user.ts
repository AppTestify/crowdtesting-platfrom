import { UserRoles } from "../_constants/user-roles";
import { User } from "../_models/user.model";
import { customIdForSearch } from "../_utils/common-server-side";

export async function filterUsers(
  searchString: string,
  skip: number,
  limit: number,
  idObject: any,
  role: string
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const usersPipeline = [
    {
      $match: {
        role: role,
      },
    },
    {
      $addFields: {
        fullName: { $concat: ["$firstName", " ", "$lastName"] },
        address: "$address",
      },
    },
    {
      $lookup: {
        from: "testers", // "testers" collection
        localField: "_id", // Use the _id of the user to join with testers
        foreignField: "user", // Reference the user field in testers
        as: "tester",
      },
    },
    {
      $addFields: {
        tester: {
          $cond: {
            if: { $eq: ["$role", UserRoles.TESTER] }, // Only add tester info for TESTER role
            then: { $arrayElemAt: ["$tester", 0] }, // Get the first element from the tester array
            else: null, // Otherwise, set tester to null
          },
        },
      },
    },
    {
      $match: {
        $or: [
          { customId: parseInt(searchString) },
          { email: regex },
          { firstName: regex },
          { lastName: regex },
          { role: regex },
          { fullName: regex },
          { "tester.address.country": regex },
          { "tester.address.city": regex },
        ],
      },
    },
    {
      $addFields: {
        userId: "$_id", // Add userId to keep the user's _id
      },
    },
    {
      $project: {
        user: 0, // Exclude user field to avoid conflicts
      },
    },
  ];

  // Get total count of users matching the pipeline criteria
  const totalUsers = await User.aggregate([
    ...usersPipeline,
    { $count: "total" },
  ]);

  // Get paginated list of users
  const users = await User.aggregate([
    ...usersPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    users,
    totalUsers: totalUsers[0]?.total || 0,
  };
}
