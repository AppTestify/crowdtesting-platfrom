import { ITesterPayload } from "../(routes)/private/profile/_components/tester-profile/_components/overview";
import {
  TESTER_ENDPOINT,
  TESTER_PROFILE_ENDPOINT,
} from "../_constants/api-endpoints";
import { genericGet, genericPost } from "./generic-api-methods";

export const getTesterByUserIdService = async (): Promise<any> => {
  try {
    const response = await genericGet(TESTER_PROFILE_ENDPOINT);

    return response || {};
  } catch (error) {
    console.error(`Error > getTesterByUserIdService:`, error);
    throw error;
  }
};

export const updateTesterProfile = async (
  body: ITesterPayload
): Promise<any> => {
  try {
    const payload = {
      firstName: body.firstName,
      lastName: body.lastName,
      skills: body.skills,
      bio: body.bio,
      certifications: body.certifications,
      address: {
        street: body.street,
        city: body.city,
        postalCode: body.postalCode,
        country: body.country,
      },
    };
    const response = await genericPost(TESTER_ENDPOINT, payload);

    return response || {};
  } catch (error) {
    console.error(`Error > updateTesterProfile:`, error);
    throw error;
  }
};
