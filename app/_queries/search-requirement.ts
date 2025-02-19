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
  const regex = new RegExp(searchString, "i");
  const userIdFormat = await IdFormat.findOne({
    entity: DBModels.USER,
  });
  searchString = customIdForSearch(idObject, searchString);
  searchString = customIdForSearch(userIdFormat, searchString);

  const requirementsPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
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
    {
      $match: {
        $or: [
          { customId: parseInt(searchString) },
          {
            "assignedTo.customId": parseInt(searchString),
          },
          { title: regex },
          { "assignedTo.firstName": regex },
          { "assignedTo.lastName": regex },
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
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const requirementsPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
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
    {
      $match: {
        $or: [
          { customId: parseInt(searchString) },
          { title: regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
          { "assignedTo.firstName": regex },
          { "assignedTo.lastName": regex },
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
