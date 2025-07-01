import { ONBOARDING_ENDPOINT } from "../_constants/api-endpoints";
import { OnboardingData } from "../_interface/onboarding";
import { genericPost } from "./generic-api-methods";

export const addOnboardingService = async (body: OnboardingData): Promise<any> => {
    try {
      const response = await genericPost(ONBOARDING_ENDPOINT, body);
      return response || {};
    } catch (error) {
      console.error(`Error > addOnboardingService:`, error);
      throw error;
    }
  };