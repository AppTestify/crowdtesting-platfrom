import { Task } from "../_models/task.model";
import { ObjectId } from "mongodb";

export async function filterTasksForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string
) {
  const regex = new RegExp(searchString, "i");

  const testCyclesPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    // for reporter
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
    // for assignee
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
        AssigedfullName: {
          $concat: ["$assignedTo.firstName", " ", "$assignedTo.lastName"],
        },
        address: "$assignedTo.address",
      },
    },
    // for issue
    {
      $lookup: {
        from: "requirements",
        localField: "requirementIds",
        foreignField: "_id",
        as: "requirementIds",
      },
    },
    {
      $lookup: {
        from: "issues",
        localField: "issueId",
        foreignField: "_id",
        as: "issueId",
      },
    },
    {
      $addFields: {
        issueId: {
          $cond: {
            if: { $gt: [{ $size: "$issueId" }, 0] },
            then: {
              _id: { $arrayElemAt: ["$issueId._id", 0] },
              title: { $arrayElemAt: ["$issueId.title", 0] },
            },
            else: null,
          },
        },
      },
    },
    {
      $match: {
        $or: [
          { title: regex },
          { priority: regex },
          { status: regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
          { fullName: regex },
          { "assigned.firstName": regex },
          { "assigned.lastName": regex },
          { AssigedfullName: regex },
          { "issueId.title": regex },
          { "requirementIds.title": regex },
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

  const totalTasks = await Task.aggregate([
    ...testCyclesPipeline,
    { $count: "total" },
  ]);

  const tasks = await Task.aggregate([
    ...testCyclesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    tasks,
    totalTasks: totalTasks[0]?.total || 0,
  };
}

export async function filterTasksForNonAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string
) {
  const regex = new RegExp(searchString, "i");

  const testCyclesPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "requirements",
        localField: "requirementIds",
        foreignField: "_id",
        as: "requirementIds",
      },
    },
    // for assignee
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
        AssigedfullName: {
          $concat: ["$assignedTo.firstName", " ", "$assignedTo.lastName"],
        },
        address: "$assignedTo.address",
      },
    },
    // for issue
    {
      $lookup: {
        from: "issues",
        localField: "issueId",
        foreignField: "_id",
        as: "issueId",
      },
    },
    {
      $addFields: {
        issueId: {
          $cond: {
            if: { $gt: [{ $size: "$issueId" }, 0] },
            then: {
              _id: { $arrayElemAt: ["$issueId._id", 0] },
              title: { $arrayElemAt: ["$issueId.title", 0] },
            },
            else: null,
          },
        },
      },
    },
    {
      $match: {
        $or: [
          { title: regex },
          { priority: regex },
          { status: regex },
          { fullName: regex },
          { "assigned.firstName": regex },
          { "assigned.lastName": regex },
          { AssigedfullName: regex },
          { "issueId.title": regex },
          { "requirementIds.title": regex },
        ],
      },
    },
    {
      $project: {
        user: 0,
      },
    },
  ];

  const totalTasks = await Task.aggregate([
    ...testCyclesPipeline,
    { $count: "total" },
  ]);

  const tasks = await Task.aggregate([
    ...testCyclesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    tasks,
    totalTasks: totalTasks[0]?.total || 0,
  };
}
