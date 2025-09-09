// src/utilities/errorHandler.ts
import axios, { AxiosError } from "axios";

interface ErrorResponse {
  status?: number;
  message?: string;
  errors?: string[];
}

const errorHandler = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<ErrorResponse>;

    if (err.response && err.response.data) {
      const { status, errors, message } = err.response.data;

      if (status === 401) {
        // Unauthorized → redirect to logout
        window.location.href = "/logout";
        return;
      }

      if (errors && Array.isArray(errors)) {
        errors.forEach((ele) => {
          // Example: show notifications with Ant Design
          // notification.error({
          //   message: "Error",
          //   description: ele,
          // });
          console.error("Error:", ele);
        });
      } else if (message) {
        // notification.error({ message: "Error", description: message });
        console.error("Error:", message);
      }
    } else {
      if (!axios.isCancel(err) && err.message === "Network Error") {
        // notification.error({
        //   message: "Error",
        //   description: "Maybe you are offline. Please Try again!",
        // });
        console.error("Network error - maybe offline");
      } else {
        // notification.error({
        //   message: "Error",
        //   description: "Failed. Please try again!",
        // });
        console.error("Request failed. Please try again!");
      }
    }
  } else {
    console.error("Unexpected error:", error);
  }
};

export default errorHandler;
