import { DBModels } from "@/app/_constants";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { UserRoles } from "@/app/_constants/user-roles";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { IdFormat } from "@/app/_models/id-format.model";
import { User } from "@/app/_models/user.model";
import { serverSidePagination } from "@/app/_utils/common-server-side";
import { addCustomIds } from "@/app/_utils/data-formatters";
import { errorHandler } from "@/app/_utils/error-handler";

export async function GET(req: Request) {
  try {
    const session = await verifySession();

    if (!session) {
      return Response.json(
        { message: USER_UNAUTHORIZED_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    // Only clients can access this endpoint
    if (session.user.role !== UserRoles.CLIENT) {
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

    // Filter by role and status
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const searchString = url.searchParams.get("searchString");
    
    // Filter to only show users created/invited by this client
    const sessionUserId = session.user.id || session.user._id;
    const filter: any = { 
      _id: { $ne: sessionUserId },
      $or: [
        { createdBy: 'client', clientId: sessionUserId },
        { invitedBy: sessionUserId }
      ]
    };
    
    if (role) {
      filter.role = role;
    }
    if (status) {
      filter.isActive = status;
    }

    const userIdFormat = await IdFormat.findOne({ entity: DBModels.USER });
    const { skip, limit } = serverSidePagination(req);

    let users;
    let totalUsers;

    if (searchString) {
      // Implement search functionality for client users
      const searchFilter = {
        ...filter,
        $or: [
          { firstName: { $regex: searchString, $options: 'i' } },
          { lastName: { $regex: searchString, $options: 'i' } },
          { email: { $regex: searchString, $options: 'i' } },
        ],
      };
      
      users = await User.find(searchFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();
        
      totalUsers = await User.countDocuments(searchFilter);
    } else {
      users = await User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();
        
      totalUsers = await User.countDocuments(filter);
    }

    const usersWithCustomIds = addCustomIds(users, userIdFormat?.idFormat);

    return Response.json({ 
      users: usersWithCustomIds, 
      total: totalUsers 
    });
  } catch (error: any) {
    return errorHandler(error);
  }
} 