import { AttachmentFolder } from "@/app/_constants/constant-server-side";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_INPUT_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import AttachmentService from "@/app/_helpers/attachment.helper";
import { isAdmin, verifySession } from "@/app/_lib/dal";
import { Invoice } from "@/app/_models/invoice.model";
import {
  filterInvoiceForAdmin,
  filterInvoiceForClient,
} from "@/app/_queries/search-invoice";
import { invoiceSchema } from "@/app/_schemas/invoice.schema";
import {
  getFileMetaData,
  serverSidePagination,
} from "@/app/_utils/common-server-side";
import { normaliseIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await verifySession();

    if (!session) {
      return Response.json(
        { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    const isDBConnected = await connectDatabase();
    if (!isDBConnected) {
      return Response.json(
        {
          message: DB_CONNECTION_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    const body = await req.formData();
    const file = body.get("file");
    const response = invoiceSchema.safeParse({ file: file });

    if (!response.success) {
      return Response.json(
        {
          message: INVALID_INPUT_ERROR_MESSAGE,
          errors: response.error.errors,
        },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const { name, contentType } = await getFileMetaData(response.data.file);

    if (!file) {
      throw new Error(GENERIC_ERROR_MESSAGE);
    }

    const attachmentService = new AttachmentService();
    const cloudId = await attachmentService.uploadFileInGivenFolderInDrive(
      file,
      AttachmentFolder.INVOICE
    );

    const newFile = new Invoice({
      name: name,
      cloudId: cloudId,
      contentType: contentType,
      userId: session.user._id,
    });

    const saveFile = await newFile.save();

    return Response.json({
      message: "Invoice added successfully",
      id: saveFile._id,
    });
  } catch (error: any) {
    return errorHandler(error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session || !session.isAuth) {
      return Response.json(
        { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    const isDBConnected = await connectDatabase();
    if (!isDBConnected) {
      return Response.json(
        {
          message: DB_CONNECTION_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    const url = new URL(req.url);
    const searchString = url.searchParams.get("searchString");
    const { skip, limit } = serverSidePagination(req);
    let response, totalInvoice;
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    let filter: any = {};

    if (from || to) {
      try {
        let decodedFrom, decodedTo;
        if (from) {
          decodedFrom = decodeURIComponent(from as string);
        }
        if (to) {
          decodedTo = decodeURIComponent(to as string);
        }

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (decodedFrom && decodedTo) {
          startDate = new Date(decodedFrom);
          endDate = new Date(decodedTo);
        } else if (decodedFrom) {
          startDate = new Date(decodedFrom);
          endDate = new Date(decodedFrom);
        } else if (decodedTo) {
          startDate = new Date(decodedTo);
          endDate = new Date(decodedTo);
        }

        if (
          startDate &&
          endDate &&
          !isNaN(startDate.getTime()) &&
          !isNaN(endDate.getTime())
        ) {
          const startOfDay = new Date(startDate);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);

          filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        } else {
          console.error("Invalid date format:", decodedFrom, decodedTo);
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }

    if (searchString) {
      if (!(await isAdmin(session.user))) {
        const { invoices, totalInvoice } = await filterInvoiceForClient(
          searchString,
          skip,
          limit,
          session.user._id
        );
        return Response.json({
          invoices: invoices,
          total: totalInvoice,
        });
      } else {
        const { invoices, totalInvoice } = await filterInvoiceForAdmin(
          searchString,
          skip,
          limit
        );
        return Response.json({
          invoices: invoices,
          total: totalInvoice,
        });
      }
    }

    if (await isAdmin(session.user)) {
      totalInvoice = await Invoice.find(filter).countDocuments();
      response = normaliseIds(
        await Invoice.find(filter)
          .populate("userId", "firstName lastName")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean()
      );
    } else {
      totalInvoice = await Invoice.find(filter)
        .find({
          userId: session.user._id,
        })
        .countDocuments();
      response = normaliseIds(
        await Invoice.find(filter)
          .find({ userId: session.user._id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean()
      );
    }

    return Response.json({ invoices: response, total: totalInvoice });
  } catch (error: any) {
    return errorHandler(error);
  }
}
