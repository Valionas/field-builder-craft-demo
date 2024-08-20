import { FieldData, FieldResponse } from "../models/FieldData";


export const saveFieldData = async (formData: FieldData): Promise<FieldResponse> => {
  try {
    const response = await fetch("http://localhost:3001/fields", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const responseData: FieldResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error("Failed to post form data:", error);
    throw error;
  }
};
