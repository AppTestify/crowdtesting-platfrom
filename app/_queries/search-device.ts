import { Device } from "../_models/device.model";
import { ObjectId } from "mongodb";
import { IdFormat } from "../_models/id-format.model";
import { DBModels } from "../_constants";
import { replaceCustomId } from "../_utils/data-formatters";

export async function filterDevicesForAdmin(
  searchString: string,
  skip: number,
  limit: number
) {
  const regex = new RegExp(searchString, "i");
  const userIdFormat = await IdFormat.findOne({
    entity: DBModels.USER,
  });

  const devicesPipeline = [
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
          { "user.firstName": regex },
          { "user.lastName": regex },
          { "user.email": regex },
          { fullName: regex },
          { os: regex },
          { version: regex },
          { country: regex },
          { city: regex },
          { network: regex },
          { name: regex },
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

  const totalDevices = await Device.aggregate([
    ...devicesPipeline,
    { $count: "total" },
  ]);

  const devices = await Device.aggregate([
    ...devicesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  const transformedDevices = devices.map((res) => ({
    ...res,
    userId: res.userId
      ? {
          ...res.userId,
          customId: replaceCustomId(
            userIdFormat?.idFormat,
            res.userId.customId
          ),
        }
      : null,
  }));

  return {
    devices: transformedDevices,
    totalDevices: totalDevices[0]?.total || 0,
  };
}

export async function filterDevicesForClient(
  searchString: string,
  skip: number,
  limit: number
) {
  const regex = new RegExp(searchString, "i");

  const devicesPipeline = [
    {
      $match: {
        $or: [
          { os: regex },
          { version: regex },
          { country: regex },
          { city: regex },
          { network: regex },
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

  const totalDevices = await Device.aggregate([
    ...devicesPipeline,
    { $count: "total" },
  ]);

  const devices = await Device.aggregate([
    ...devicesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    devices,
    totalDevices: totalDevices[0]?.total || 0,
  };
}

export async function filterDevicesForTester(
  searchString: string,
  skip: number,
  limit: number,
  user: any
) {
  const regex = new RegExp(searchString, "i");
  const userId = new ObjectId(user._id);

  const devicesPipeline = [
    {
      $match: {
        userId: userId,
      },
    },
    {
      $match: {
        $or: [
          { os: regex },
          { version: regex },
          { country: regex },
          { city: regex },
          { network: regex },
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

  const totalDevices = await Device.aggregate([
    ...devicesPipeline,
    { $count: "total" },
  ]);

  const devices = await Device.aggregate([
    ...devicesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    devices,
    totalDevices: totalDevices[0]?.total || 0,
  };
}
