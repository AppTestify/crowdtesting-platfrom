import { Mail } from "../_models/mail.model";

export async function filterMails(searchString: string) {
  const regex = new RegExp(searchString, "i");

  const mailsPipeline = [
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
          { subject: regex },
          { body: regex },
          { "user.firstName": regex },
          { "user.lastName": regex },
        ],
      },
    },

    {
      $addFields: {
        userId: "$user",
      },
    },
  ];

  const mails = await Mail.aggregate([...mailsPipeline]);

  return {
    mails,
  };
}
