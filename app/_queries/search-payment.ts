import { Payment } from "../_models/payment.model";
import { ObjectId } from "mongodb";

export async function filterPaymentsForAdmin(
  searchString: string,
  skip: number,
  limit: number
) {
  const regex = new RegExp(searchString, "i");

  const issuesPipeline = [
    {
      $addFields: {
        amountStr: { $toString: "$amount" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "senderId",
        foreignField: "_id",
        as: "senderId",
      },
    },
    { $unwind: "$senderId" },
    {
      $addFields: {
        fullName: {
          $concat: ["$senderId.firstName", " ", "$senderId.lastName"],
        },
        address: "$senderId.address",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "receiverId",
        foreignField: "_id",
        as: "receiverId",
      },
    },
    { $unwind: { path: "$receiverId", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        receiverFullName: {
          $concat: ["$receiverId.firstName", " ", "$receiverId.lastName"],
        },
        address: "$receiverId.address",
      },
    },
    {
      $match: {
        $or: [
          { description: regex },
          { amountStr: regex },
          { "senderId.firstName": regex },
          { "senderId.lastName": regex },
          { fullName: regex },
          { "receiverId.firstName": regex },
          { "receiverId.lastName": regex },
          { receiverFullName: regex },
          { status: regex },
        ],
      },
    },
    {
      $addFields: {
        senderId: "$senderId",
      },
    },
 
  ];

  const totalPayments = await Payment.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  const payments = await Payment.aggregate([
    ...issuesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    payments,
    totalPayments: totalPayments[0]?.total || 0,
  };
}

export async function filterPaymentsForNonAdmin(
  searchString: string,
  skip: number,
  limit: number,
  receiverId: string
) {
  const regex = new RegExp(searchString, "i");

  const issuesPipeline = [
    {
      $match: {
        receiverId: new ObjectId(receiverId),
      },
    },
    {
      $addFields: {
        amountStr: { $toString: "$amount" },
      },
    },
    {
      $match: {
        $or: [
          { amountStr: regex },
          { description: regex },
          { amount: regex },
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

  const totalPayments = await Payment.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  const payments = await Payment.aggregate([
    ...issuesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    payments,
    totalPayments: totalPayments[0]?.total || 0,
  };
}
