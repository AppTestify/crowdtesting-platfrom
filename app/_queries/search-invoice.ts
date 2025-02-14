import { ObjectId } from "mongodb";
import { Invoice } from "../_models/invoice.model";

export async function filterInvoiceForClient(
  searchString: string,
  skip: number,
  limit: number,
  userId: string
) {
  const regex = new RegExp(searchString, "i");

  const issuesPipeline = [
    {
      $match: {
        userId: new ObjectId(userId),
      },
    },
    {
      $match: {
        $or: [{ name: regex }],
      },
    },
  ];

  const totalInvoice = await Invoice.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  const invoices = await Invoice.aggregate([
    ...issuesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    invoices,
    totalInvoice: totalInvoice[0]?.total || 0,
  };
}

export async function filterInvoiceForAdmin(
  searchString: string,
  skip: number,
  limit: number
) {
  const regex = new RegExp(searchString, "i");

  const issuesPipeline = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
      },
    },
    { $unwind: "$userId" },
    {
      $addFields: {
        fullName: { $concat: ["$userId.firstName", " ", "$userId.lastName"] },
        address: "$userId.address",
      },
    },
    {
      $match: {
        $or: [
          { name: regex },
          { endDate: regex },
          { "userId.firstName": regex },
          { "userId.lastName": regex },
          { fullName: regex },
        ],
      },
    },
  ];

  const totalInvoice = await Invoice.aggregate([
    ...issuesPipeline,
    { $count: "total" },
  ]);

  const invoices = await Invoice.aggregate([
    ...issuesPipeline,
    { $skip: skip },
    { $limit: limit },
  ]);

  return {
    invoices,
    totalInvoice: totalInvoice[0]?.total || 0,
  };
}
