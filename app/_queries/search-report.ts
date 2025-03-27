import { ObjectId } from "mongodb";
import { Report } from "../_models/report.model";
import { ReportStatus } from "../_constants/issue";

export async function filterReportsForTester(
  searchString: string,
  skip: number,
  limit: number,
  projectId: any,
  isClient?: boolean,
  userId?: string
) {
  const regex = new RegExp(searchString, "i");

  const reportsPipeline = [
    ...(isClient
      ? [
          {
            $match: {
              status: ReportStatus.APPROVED,
              projectId: new ObjectId(projectId),
            },
          },
        ]
      : [
          {
            $match: {
              $or: [
                { userId: new ObjectId(userId) },
                {
                  projectId: new ObjectId(projectId),
                  status: ReportStatus.APPROVED,
                },
              ],
            },
          },
        ]),
    {
      $lookup: {
        from: "reportattachments",
        localField: "attachments",
        foreignField: "_id",
        as: "attachments",
      },
    },
    {
      $match: {
        $or: [
          { title: regex },
          { description: regex },
          { "attachments.name": regex },
          { name: regex },
        ],
      },
    },
    {
      $project: {
        user: 0,
      },
    },
  ];

  const totalReports = await Report.aggregate([
    ...reportsPipeline,
    { $count: "total" },
  ]);

  const reports = await Report.aggregate([
    ...reportsPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    reports,
    totalReports: totalReports[0]?.total || 0,
  };
}

export async function filterReportsForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: any
) {
  const regex = new RegExp(searchString, "i");

  const reportsPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "reportattachments",
        localField: "attachments",
        foreignField: "_id",
        as: "attachments",
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
      $match: {
        $or: [
          { title: regex },
          { description: regex },
          { "attachments.name": regex },
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

  const totalReports = await Report.aggregate([
    ...reportsPipeline,
    { $count: "total" },
  ]);

  const reports = await Report.aggregate([
    ...reportsPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    reports,
    totalReports: totalReports[0]?.total || 0,
  };
}
