import { IRequirement } from "../_interface/requirement";
import { TestCase } from "../_models/test-case.model";
import { customIdForSearch } from "../_utils/common-server-side";
import { ObjectId } from "mongodb";
import { replaceCustomId } from "../_utils/data-formatters";

export async function filterTestCasesNotForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any,
  requirement?: string,
  requirementUserIdFormat?: any,
  testSuiteIdFormat?: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const testCasesPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    ...(requirement
      ? [
          {
            $match: {
              requirements: new ObjectId(requirement),
            },
          },
        ]
      : []),
    {
      $lookup: {
        from: "testsuites",
        localField: "testSuite",
        foreignField: "_id",
        as: "testSuite",
      },
    },
    {
      $unwind: "$testSuite",
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
        $or: [
          { customId: parseInt(searchString) },
          { title: regex },
          { "testSuite.title": regex },
          { "requirements.title": regex },
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

  const totalTestCases = await TestCase.aggregate([
    ...testCasesPipeline,
    { $count: "total" },
  ]);

  let testCases = await TestCase.aggregate([
    ...testCasesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  testCases = testCases.map((res) => ({
    ...res,
    requirements: res?.requirements?.map((requirement: IRequirement) => ({
      ...requirement,
      customId: replaceCustomId(
        requirementUserIdFormat.idFormat,
        requirement?.customId
      ),
    })),
    testSuite: res?.testSuite
      ? {
          ...res?.testSuite,
          customId: replaceCustomId(
            testSuiteIdFormat.idFormat,
            res?.testSuite?.customId
          ),
        }
      : undefined,
  }));

  return {
    testCases,
    totalTestCases: totalTestCases[0]?.total || 0,
  };
}

export async function filterTestCasesForAdmin(
  searchString: string,
  skip: number,
  limit: number,
  projectId: string,
  idObject: any,
  requirement?: string,
  requirementUserIdFormat?: any,
  testSuiteIdFormat?: any
) {
  const regex = new RegExp(searchString, "i");
  searchString = customIdForSearch(idObject, searchString);

  const testCasesPipeline = [
    {
      $match: {
        projectId: new ObjectId(projectId),
      },
    },
    ...(requirement
      ? [
          {
            $match: {
              requirements: new ObjectId(requirement),
            },
          },
        ]
      : []),
    {
      $lookup: {
        from: "testsuites",
        localField: "testSuite",
        foreignField: "_id",
        as: "testSuite",
      },
    },
    {
      $unwind: "$testSuite",
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
        from: "requirements",
        localField: "requirements",
        foreignField: "_id",
        as: "requirements",
      },
    },
    {
      $match: {
        $or: [
          { customId: parseInt(searchString) },
          { title: regex },
          { "testSuite.title": regex },
          { "requirements.title": regex },
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

  const totalTestCases = await TestCase.aggregate([
    ...testCasesPipeline,
    { $count: "total" },
  ]);

  let testCases = await TestCase.aggregate([
    ...testCasesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  testCases = testCases.map((res) => ({
    ...res,
    requirements: res?.requirements?.map((requirement: IRequirement) => ({
      ...requirement,
      customId: replaceCustomId(
        requirementUserIdFormat.idFormat,
        requirement?.customId
      ),
    })),
    testSuite: res?.testSuite
      ? {
          ...res?.testSuite,
          customId: replaceCustomId(
            testSuiteIdFormat.idFormat,
            res?.testSuite?.customId
          ),
        }
      : undefined,
  }));

  return {
    testCases,
    totalTestCases: totalTestCases[0]?.total || 0,
  };
}
