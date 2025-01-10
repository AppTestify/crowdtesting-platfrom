import "server-only";

import { Issue } from "../_models/issue.model";
import { IssueStatus } from "../_constants/issue";

export async function filterIssuesForAdmin(
  searchString: string,
  skip: number,
  limit: number
) {
  const regex = new RegExp(searchString, "i");

  const issuesPipeline = [
    // Step 1: Populate userId
    {
      $lookup: {
        from: "users", // User collection name
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" }, // Unwind the user array to get a single object

    // Step 2: Populate devices
    {
      $lookup: {
        from: "devices", // Device collection name
        localField: "device",
        foreignField: "_id",
        as: "devices",
      },
    },

    // Step 3: Populate testCycle
    {
      $lookup: {
        from: "testcycles", // TestCycle collection name
        localField: "testCycle",
        foreignField: "_id",
        as: "testCycle",
      },
    },
    { $unwind: { path: "$testCycle", preserveNullAndEmptyArrays: true } }, // Unwind testCycle, allowing null if not present

    // Step 4: Match the search string on multiple fields
    {
      $match: {
        $or: [
          { title: regex },
          { severity: regex },
          { priority: regex },
          { description: regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
          { status: regex },
          { issueType: regex },
          { "devices.name": regex }, // Matches on device name
          { "testCycle.name": regex }, // Matches on testCycle name (example field)
        ],
      },
    },

    // Step 5: Embed user details into userId
    {
      $addFields: {
        userId: "$user", // Replace userId with the full user object
      },
    },

    // Step 6: Remove unnecessary intermediate fields
    {
      $project: {
        user: 0, // Remove the original user field
      },
    },
  ];

  // Get total count of matching issues
  const totalIssues = await Issue.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  // Get paginated issues
  const issues = await Issue.aggregate([
    ...issuesPipeline,
    { $skip: skip }, // Apply pagination
    { $limit: limit }, // Limit the number of results
  ]);

  return {
    issues,
    totalIssues: totalIssues[0]?.total || 0, // Return the count or 0 if no issues
  };
}

export async function filterIssuesForClient(
  searchString: string,
  skip: number,
  limit: number
) {
  const regex = new RegExp(searchString, "i");

  const issuesPipeline = [
    // Step 1: Exclude issues with status "New"
    {
      $match: {
        status: { $ne: IssueStatus.NEW  }, // Exclude issues where status is "New"
      },
    },

    // Step 2: Populate devices
    {
      $lookup: {
        from: "devices", // Device collection name
        localField: "device",
        foreignField: "_id",
        as: "devices",
      },
    },

    // Step 3: Populate testCycle
    {
      $lookup: {
        from: "testcycles", // TestCycle collection name
        localField: "testCycle",
        foreignField: "_id",
        as: "testCycle",
      },
    },
    { $unwind: { path: "$testCycle", preserveNullAndEmptyArrays: true } }, // Unwind testCycle, allowing null if not present

    // Step 4: Match the search string on multiple fields
    {
      $match: {
        $or: [
          { title: regex },
          { severity: regex },
          { priority: regex },
          { description: regex },
          { status: regex },
          { issueType: regex },
          { "devices.name": regex }, // Matches on device name
          { "testCycle.name": regex }, // Matches on testCycle name (example field)
        ],
      },
    },
  ];

  // Get total count of matching issues
  const totalIssues = await Issue.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  // Get paginated issues
  const issues = await Issue.aggregate([
    ...issuesPipeline,
    { $skip: skip }, // Apply pagination
    { $limit: limit }, // Limit the number of results
  ]);

  return {
    issues,
    totalIssues: totalIssues[0]?.total || 0, // Return the count or 0 if no issues
  };
}

export async function filterIssuesForTester(
  searchString: string,
  skip: number,
  limit: number
) {
  const regex = new RegExp(searchString, "i");

  const issuesPipeline = [
    // Step 2: Populate devices
    {
      $lookup: {
        from: "devices", // Device collection name
        localField: "device",
        foreignField: "_id",
        as: "devices",
      },
    },

    // Step 3: Populate testCycle
    {
      $lookup: {
        from: "testcycles", // TestCycle collection name
        localField: "testCycle",
        foreignField: "_id",
        as: "testCycle",
      },
    },
    { $unwind: { path: "$testCycle", preserveNullAndEmptyArrays: true } }, // Unwind testCycle, allowing null if not present

    // Step 4: Match the search string on multiple fields
    {
      $match: {
        $or: [
          { title: regex },
          { severity: regex },
          { priority: regex },
          { description: regex },
          { status: regex },
          { issueType: regex },
          { "devices.name": regex }, // Matches on device name
          { "testCycle.name": regex }, // Matches on testCycle name (example field)
        ],
      },
    },
  ];

  // Get total count of matching issues
  const totalIssues = await Issue.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  // Get paginated issues
  const issues = await Issue.aggregate([
    ...issuesPipeline,
    { $skip: skip }, // Apply pagination
    { $limit: limit }, // Limit the number of results
  ]);

  return {
    issues,
    totalIssues: totalIssues[0]?.total || 0, // Return the count or 0 if no issues
  };
}
