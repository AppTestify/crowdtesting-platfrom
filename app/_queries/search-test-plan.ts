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
