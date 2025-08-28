import { Requirement } from "../_models/requirement.model";
import { customIdForSearch } from "../_utils/common-server-side";
import { ObjectId } from "mongodb";
import { replaceCustomId } from "../_utils/data-formatters";
import { IdFormat } from "../_models/id-format.model";
import { DBModels } from "../_constants";

export async function filterRequirementsNotForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any
) {
  // Parse search string for status filter
  let statusFilter = null;
  let cleanSearchString = searchString;
  
  if (searchString.includes('status:')) {
    const statusMatch = searchString.match(/status:(\w+)/);
    if (statusMatch) {
      statusFilter = statusMatch[1];
      cleanSearchString = searchString.replace(/status:\w+/, '').trim();
    }
  }
  
  const regex = new RegExp(cleanSearchString, "i");
  const userIdFormat = await IdFormat.findOne({
    entity: DBModels.USER,
  });
  const requirementCustomId = customIdForSearch(idObject, cleanSearchString);
  const assigneCustomId = customIdForSearch(userIdFormat, cleanSearchString);

  const requirementsPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
        ...(statusFilter && { status: statusFilter }),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
      },
    },
    { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        firstName: "$assignedTo.firstName",
        lastName: "$assignedTo.lastName",
        AssigedfullName: {
          $concat: ["$assignedTo.firstName", " ", "$assignedTo.lastName"],
        },
        address: "$address",
      },
    },
    ...(cleanSearchString ? [{
      $match: {
        $or: [
          { customId: parseInt(requirementCustomId) },
          {
            "assignedTo.customId": parseInt(assigneCustomId),
          },
          { title: regex },
          { "assignedTo.firstName": regex },
          { "assignedTo.lastName": regex },
        ],
      },
    }] : []),
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

  const transformedRequirements = requirements.map((res) => ({
    ...res,
    assignedTo: res.assignedTo
      ? {
          ...res.assignedTo,
          customId: replaceCustomId(
            userIdFormat?.idFormat,
            res.assignedTo.customId
          ),
        }
      : null,
  }));

  return {
    requirements: transformedRequirements,
    totalRequirements: totalRequirements[0]?.total || 0,
  };
}

export async function filterRequirementsForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any
) {
  // Parse search string for status filter
  let statusFilter = null;
  let cleanSearchString = searchString;
  
  if (searchString.includes('status:')) {
    const statusMatch = searchString.match(/status:(\w+)/);
    if (statusMatch) {
      statusFilter = statusMatch[1];
      cleanSearchString = searchString.replace(/status:\w+/, '').trim();
    }
  }
  
  const regex = new RegExp(cleanSearchString, "i");
  cleanSearchString = customIdForSearch(idObject, cleanSearchString);

  const requirementsPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
        ...(statusFilter && { status: statusFilter }),
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
        address: "$user.address",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
      },
    },
    { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        firstName: "$assignedTo.firstName",
        lastName: "$assignedTo.lastName",
        AssigedfullName: {
          $concat: ["$assignedTo.firstName", " ", "$assignedTo.lastName"],
        },
        address: "$address",
      },
    },
    ...(cleanSearchString ? [{
      $match: {
        $or: [
          { customId: parseInt(cleanSearchString) },
          { title: regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
          { "assignedTo.firstName": regex },
          { "assignedTo.lastName": regex },
          { fullName: regex },
        ],
      },
    }] : []),
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
