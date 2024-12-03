import { TEST_CYCLE_ENPOINT } from "../_constants/api-endpoints";
import { genericGet } from "./generic-api-methods";

export const getTestExecutionsService = async (projectId: string, testCycleId: string):
    Promise<any> => {
    try {
        const response = await genericGet(`${TEST_CYCLE_ENPOINT(projectId)}/${testCycleId}/test-execution`);
        return response || [];
    } catch (error) {
        console.error(`Error > getTestExecutionsService:`, error);
        throw error;
    }
};