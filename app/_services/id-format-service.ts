import { ID_FORMAT_ENDPOINT } from "../_constants/api-endpoints";
import { IIdFormat } from "../_interface/id-format";
import { genericGet, genericPut } from "./generic-api-methods";

export const getIdFormatService = async (): Promise<any> => {
    try {
        const response = await genericGet(ID_FORMAT_ENDPOINT);
        return response || [];
    } catch (error) {
        console.error(`Error > getIdFormatService:`, error);
        throw error;
    }
};

export const updateIdFormatService = async (idFormatId: string,
    body: IIdFormat): Promise<any> => {
    try {
        const response = await genericPut(`${ID_FORMAT_ENDPOINT}/${idFormatId}`, body);
        return response || [];
    } catch (error) {
        console.error(`Error > updateIdFormatService:`, error);
        throw error;
    }
};