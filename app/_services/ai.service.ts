import { HttpStatusCode } from "@/app/_constants/http-status-code";

export interface AIRefinementResponse {
  originalDescription: string;
  refinedDescription: string;
  message: string;
}

export const refineDescriptionService = async (
  description: string,
  context?: string
): Promise<AIRefinementResponse> => {
  try {
    const response = await fetch("/api/ai/refine-description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error refining description:", error);
    throw error;
  }
}; 