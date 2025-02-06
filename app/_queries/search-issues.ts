import "server-only";
import { ObjectId } from "mongodb";
import { Issue } from "../_models/issue.model";
import { IssueStatus } from "../_constants/issue";
import { customIdForSearch } from "../_utils/common-server-side";

export async function filterIssuesForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any,
  severity?: string,
  priority?: string,
  status?: string,
  testCycle?: string
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const issuesPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    ...(severity
      ? [
          {
            $match: {
              severity: severity,
            },
          },
        ]
      : []),
    ...(priority
      ? [
          {
            $match: {
              priority: priority,
            },
          },
        ]
      : []),
    ...(status
      ? [
          {
            $match: {
              status: status,
            },
          },
        ]
      : []),
    ...(testCycle
      ? [
          {
            $match: {
              testCycle: testCycle,
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
      $lookup: {
        from: "devices",
        localField: "device",
        foreignField: "_id",
        as: "device",
      },
    },
    {
      $lookup: {
        from: "testcycles",
        localField: "testCycle",
        foreignField: "_id",
        as: "testCycle",
      },
    },
    { $unwind: { path: "$testCycle", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "projectId",
      },
    },
    {
      $addFields: {
        projectId: {
          $cond: {
            if: { $gt: [{ $size: "$projectId" }, 0] },
            then: {
              _id: { $arrayElemAt: ["$projectId._id", 0] },
              title: { $arrayElemAt: ["$projectId.title", 0] },
            },
            else: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: "users", // Lookup for assignedTo field
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
      },
    },
    { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        fullName: { $concat: ["$firstName", " ", "$lastName"] },
        address: "$address",
      },
    },
    {
      $addFields: {
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
          { severity: regex },
          { priority: regex },
          { description: regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
          { fullName: regex },
          { status: regex },
          { issueType: regex },
          { "device.name": regex },
          { "testCycle.title": regex },
          { "assignedTo.firstName": regex },
          { "assignedTo.lastName": regex },
          { AssigedfullName: regex },
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

  const totalIssues = await Issue.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  const issues = await Issue.aggregate([
    ...issuesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    issues,
    totalIssues: totalIssues[0]?.total || 0,
  };
}

export async function filterIssuesForClient(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any,
  severity?: string,
  priority?: string,
  status?: string,
  testCycle?: string
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const issuesPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
        status: { $ne: IssueStatus.NEW },
      },
    },
    ...(severity
      ? [
          {
            $match: {
              severity: severity,
            },
          },
        ]
      : []),
    ...(priority
      ? [
          {
            $match: {
              priority: priority,
            },
          },
        ]
      : []),
    ...(status
      ? [
          {
            $match: {
              status: status,
            },
          },
        ]
      : []),
    ...(testCycle
      ? [
          {
            $match: {
              testCycle: testCycle,
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
      $lookup: {
        from: "devices",
        localField: "device",
        foreignField: "_id",
        as: "device",
      },
    },

    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "projectId",
      },
    },
    {
      $addFields: {
        projectId: {
          $cond: {
            if: { $gt: [{ $size: "$projectId" }, 0] },
            then: {
              _id: { $arrayElemAt: ["$projectId._id", 0] },
              title: { $arrayElemAt: ["$projectId.title", 0] },
            },
            else: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: "users", // Lookup for assignedTo field
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
      },
    },
    { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        fullName: { $concat: ["$firstName", " ", "$lastName"] },
        address: "$address",
      },
    },
    {
      $addFields: {
        AssigedfullName: {
          $concat: ["$assignedTo.firstName", " ", "$assignedTo.lastName"],
        },
        address: "$address",
      },
    },
    {
      $lookup: {
        from: "testcycles",
        localField: "testCycle",
        foreignField: "_id",
        as: "testCycle",
      },
    },
    { $unwind: { path: "$testCycle", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { customId: parseInt(searchString) },
          { title: regex },
          { severity: regex },
          { priority: regex },
          { description: regex },
          { status: regex },
          { issueType: regex },
          { "device.name": regex },
          { "testCycle.title": regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
          { fullName: regex },
          { "assignedTo.firstName": regex },
          { "assignedTo.lastName": regex },
          { AssigedfullName: regex },
        ],
      },
    },
    {
      $addFields: {
        userId: "$user",
      },
    },
  ];

  const totalIssues = await Issue.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  const issues = await Issue.aggregate([
    ...issuesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    issues,
    totalIssues: totalIssues[0]?.total || 0,
  };
}

export async function filterIssuesForTester(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any,
  severity?: string,
  priority?: string,
  status?: string,
  testCycle?: string
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const issuesPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    ...(severity
      ? [
          {
            $match: {
              severity: severity,
            },
          },
        ]
      : []),
    ...(priority
      ? [
          {
            $match: {
              priority: priority,
            },
          },
        ]
      : []),
    ...(status
      ? [
          {
            $match: {
              status: status,
            },
          },
        ]
      : []),
    ...(testCycle
      ? [
          {
            $match: {
              testCycle: testCycle,
            },
          },
        ]
      : []),
    {
      $lookup: {
        from: "devices",
        localField: "device",
        foreignField: "_id",
        as: "device",
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "projectId",
      },
    },
    {
      $addFields: {
        projectId: {
          $cond: {
            if: { $gt: [{ $size: "$projectId" }, 0] },
            then: {
              _id: { $arrayElemAt: ["$projectId._id", 0] },
              title: { $arrayElemAt: ["$projectId.title", 0] },
            },
            else: null,
          },
        },
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
        AssigedfullName: {
          $concat: ["$assignedTo.firstName", " ", "$assignedTo.lastName"],
        },
        address: "$address",
      },
    },
    {
      $lookup: {
        from: "testcycles",
        localField: "testCycle",
        foreignField: "_id",
        as: "testCycle",
      },
    },
    { $unwind: { path: "$testCycle", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { customId: parseInt(searchString) },
          { title: regex },
          { severity: regex },
          { priority: regex },
          { description: regex },
          { status: regex },
          { issueType: regex },
          { "device.name": regex },
          { "testCycle.title": regex },
          { fullName: regex },
          { "assignedTo.firstName": regex },
          { "assignedTo.lastName": regex },
          { AssigedfullName: regex },
        ],
      },
    },
    {
      $addFields: {
        userId: "$user",
      },
    },
  ];

  const totalIssues = await Issue.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  const issues = await Issue.aggregate([
    ...issuesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    issues,
    totalIssues: totalIssues[0]?.total || 0,
  };
}
