import { Requirement } from "../_models/requirement.model";
import { customIdForSearch } from "../_utils/common-server-side";
import { ObjectId } from "mongodb";

export async function filterRequirementsForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const requirementsPipeline = [
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
          { description: regex },
          { startDate: regex },
          { endDate: regex },
        ],
      },
    },

    {
      $project: {
        user: 0,
      },
    },
  ];

  const totalRequirements = await Requirement.aggregate([
    ...requirementsPipeline,
    { $count: "total" },
  ]);

  const requirements = await Requirement.aggregate([
    ...requirementsPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    requirements,
    totalRequirements: totalRequirements[0]?.total || 0,
  };
}
