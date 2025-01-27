import { TestSuite } from "../_models/test-suite.model";
import { customIdForSearch } from "../_utils/common-server-side";
import { ObjectId } from "mongodb";
import { replaceCustomId } from "../_utils/data-formatters";
import { IdFormat } from "../_models/id-format.model";
import { DBModels } from "../_constants";

export async function filterTestSuiteNotForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const testSuitePipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "requirements",
        localField: "requirements",
        foreignField: "_id",
        as: "requirements",
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

  const totalTestSuites = await TestSuite.aggregate([
    ...testSuitePipeline,
    { $count: "total" },
  ]);

  let testSuites = await TestSuite.aggregate([
    ...testSuitePipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  const requirementIdFormat = await IdFormat.findOne({
    entity: DBModels.REQUIREMENT,
  });
  testSuites = testSuites.map((suite) => ({
    ...suite,
    requirements: suite?.requirements?.map((requirement: any) => ({
      ...requirement,
      customId: replaceCustomId(
        requirementIdFormat.idFormat,
        requirement?.customId
      ),
    })),
  }));

  return {
    testSuites,
    totalTestSuites: totalTestSuites[0]?.total || 0,
  };
}

export async function filterTestSuiteForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const testSuitePipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "requirements",
        localField: "requirements",
        foreignField: "_id",
        as: "requirements",
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

  const requirementIdFormat = await IdFormat.findOne({
    entity: DBModels.REQUIREMENT,
  });

  const totalTestSuites = await TestSuite.aggregate([
    ...testSuitePipeline,
    { $count: "total" },
  ]);

  let testSuites = await TestSuite.aggregate([
    ...testSuitePipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  testSuites = testSuites.map((suite) => ({
    ...suite,
    requirements: suite?.requirements?.map((requirement: any) => ({
      ...requirement,
      customId: replaceCustomId(
        requirementIdFormat.idFormat,
        requirement?.customId
      ),
    })),
  }));

  return {
    testSuites,
    totalTestSuites: totalTestSuites[0]?.total || 0,
  };
}
