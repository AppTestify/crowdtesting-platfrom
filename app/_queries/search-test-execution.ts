import { TestExecution } from "../_models/test-execution.model";
import { countResults, customIdForSearch } from "../_utils/common-server-side";
import { ObjectId } from "mongodb";

export async function filterTestExecutionNotForTester(
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
        from: "testcycles",
        localField: "testCycle",
        foreignField: "_id",
        as: "testCycle",
      },
    },
    { $unwind: { path: "$testCycle", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "testcaseresults",
        localField: "testCaseResults",
        foreignField: "_id",
        as: "testCaseResults",
      },
    },
    {
      $match: {
        $or: [
          { customId: parseInt(searchString) },
          { title: regex },
          { type: regex },
          { "testCycle.title": regex },
          { "testCycle.description": regex },
        ],
      },
    },
    {
      $project: {
        user: 0,
      },
    },
  ];

  const totalTestExecutions = await TestExecution.aggregate([
    ...testPlanPipeline,
    { $count: "total" },
  ]);

  const result = await TestExecution.aggregate([
    ...testPlanPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  const testExecution = result.map((res) => ({
    ...res,
    resultCounts: countResults(res?.testCaseResults || []),
  }));

  return {
    testExecution,
    totalTestExecutions: totalTestExecutions[0]?.total || 0,
  };
}

export async function filterTestExecutionForTester(
  searchString: string,
  skip: number,
  limit: number,
  idObject: any,
  query: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const testPlanPipeline = [
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
        from: "testcaseresults",
        localField: "testCaseResults",
        foreignField: "_id",
        as: "testCaseResults",
      },
    },
    {
      $match: {
        ...query,
        $or: [
          { customId: parseInt(searchString) },
          { title: regex },
          { type: regex },
          { "testCycle.title": regex },
          { "testCycle.description": regex },
        ],
      },
    },
    {
      $project: {
        user: 0,
      },
    },
  ];

  const totalTestExecutions = await TestExecution.aggregate([
    ...testPlanPipeline,
    { $count: "total" },
  ]);

  const result = await TestExecution.aggregate([
    ...testPlanPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  const testExecution = result.map((res) => ({
    ...res,
    resultCounts: countResults(res?.testCaseResults || []),
  }));

  return {
    testExecution,
    totalTestExecutions: totalTestExecutions[0]?.total || 0,
  };
}
