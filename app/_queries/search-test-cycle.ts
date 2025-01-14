import { TestCycle } from "../_models/test-cycle.model";
import { customIdForSearch } from "../_utils/common-server-side";
import { ObjectId } from "mongodb";

export async function filterTestCyclesNotForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const testCyclesPipeline = [
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

  const totalTestCycles = await TestCycle.aggregate([
    ...testCyclesPipeline,
    { $count: "total" },
  ]);

  const testCycles = await TestCycle.aggregate([
    ...testCyclesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    testCycles,
    totalTestCycles: totalTestCycles[0]?.total || 0,
  };
}

export async function filterTestCyclesForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const testCyclesPipeline = [
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
      $match: {
        $or: [
          { customId: parseInt(searchString) },
          { title: regex },
          { description: regex },
          { startDate: regex },
          { endDate: regex },
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

  const totalTestCycles = await TestCycle.aggregate([
    ...testCyclesPipeline,
    { $count: "total" },
  ]);

  const testCycles = await TestCycle.aggregate([
    ...testCyclesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    testCycles,
    totalTestCycles: totalTestCycles[0]?.total || 0,
  };
}
