import "server-only";
import { Project } from "../_models/project.model";
import { customIdForSearch } from "../_utils/common-server-side";
import { ObjectId } from "mongodb";

export async function filterProjectsForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  idObject: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const issuesPipeline = [
    {
      $match: {
        deletedAt: { $exists: false },
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
          { customId: parseInt(searchString) },
          { title: regex },
          { startDate: regex },
          { endDate: regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
          { fullName: regex },
          { status: regex },
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

  const totalProjects = await Project.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  const projects = await Project.aggregate([
    ...issuesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    projects,
    totalProjects: totalProjects[0]?.total || 0,
  };
}

export async function filterProjectsForClient(
  searchString: string,
  skip: number,
  limit: number,
  idObject: any,
  user: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const userId = new ObjectId(user._id);
  const issuesPipeline = [
    {
      $match: {
        deletedAt: { $exists: false },
        userId: userId,
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
          { customId: parseInt(searchString) },
          { title: regex },
          { startDate: regex },
          { endDate: regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
          { fullName: regex },
          { status: regex },
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

  const totalProjects = await Project.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  const projects = await Project.aggregate([
    ...issuesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    projects,
    totalProjects: totalProjects[0]?.total || 0,
  };
}

export async function filterProjectsForTester(
  searchString: string,
  skip: number,
  limit: number,
  idObject: any,
  user: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const userId = new ObjectId(user._id);
  const issuesPipeline = [
    {
      $match: {
        deletedAt: { $exists: false },
        users: { $elemMatch: { userId: userId } },
      },
    },
    {
      $match: {
        $or: [
          { customId: parseInt(searchString) },
          { title: regex },
          { startDate: regex },
          { endDate: regex },
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

  const totalProjects = await Project.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  const projects = await Project.aggregate([
    ...issuesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    projects,
    totalProjects: totalProjects[0]?.total || 0,
  };
}
