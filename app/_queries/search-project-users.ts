import { Project } from "../_models/project.model";
import { ObjectId } from "mongodb";
import { customIdForSearch } from "../_utils/common-server-side";
import { User } from "../_models/user.model";
import { replaceCustomId } from "../_utils/data-formatters";
import { Tester } from "../_models/tester.model";
import { IProject } from "../_interface/project";

export async function filterProjectUsers(
  searchString: string,
  skip: number,
  limit: number,
  idObject: any,
  projectId: string,
  project: any,
  totalUsers: number
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const projectUsersPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    {
      $match: {
        $or: [
          { customId: parseInt(searchString) },
          { title: regex },
          { startDate: regex },
          { endDate: regex },
          { fullName: regex },
          { status: regex },
        ],
      },
    },
    {
      $project: {
        user: 0,
      },
    },
  ];

  const populatedUsers = await User.aggregate([
    ...projectUsersPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  // Step 5: Map users and add additional data
  const usersWithCustomIds = await Promise.all(
    populatedUsers.map(async (user: any) => {
      const userInfo = await User.findById(user.userId)
        .select("firstName lastName role customId")
        .lean();

      const customIdTransformed = replaceCustomId(
        idObject.idFormat,
        Array.isArray(userInfo) ? undefined : userInfo?.customId
      );

      const tester = await Tester.findOne({
        user: Array.isArray(userInfo) ? undefined : userInfo?._id,
      })
        .select("address languages skills")
        .sort({ _id: -1 });

      return {
        ...user,
        userId: userInfo,
        customId: customIdTransformed,
        tester: tester,
      };
    })
  );

  // Step 6: Return the result with populated users and the total count
  const result = {
    _id: project._id,
    users: usersWithCustomIds,
    total: totalUsers,
  };

  return { data: result };
}
