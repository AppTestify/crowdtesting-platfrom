import { TestPlan } from "../_models/test-plan.model";
import { customIdForSearch } from "../_utils/common-server-side";
import { ObjectId } from "mongodb";

export async function filterTestPlanNotForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const testPlanPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    {
      $match: {
        $or: [{ customId: parseInt(searchString) }, { title: regex }],
      },
    },

    {
      $project: {
        user: 0,
      },
    },
  ];

  const totalTestPlans = await TestPlan.aggregate([
    ...testPlanPipeline,
    { $count: "total" },
  ]);

  const testPlans = await TestPlan.aggregate([
    ...testPlanPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    testPlans,
    totalTestPlans: totalTestPlans[0]?.total || 0,
  };
}

export async function filterTestPlanForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const testPlanPipeline = [
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

  const totalTestPlans = await TestPlan.aggregate([
    ...testPlanPipeline,
    { $count: "total" },
  ]);

  const testPlans = await TestPlan.aggregate([
    ...testPlanPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    testPlans,
    totalTestPlans: totalTestPlans[0]?.total || 0,
  };
}
