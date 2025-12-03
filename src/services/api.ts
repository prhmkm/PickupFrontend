import axios from "axios";

const api = axios.create({
  baseURL: "http://79.137.202.137:1050/api",
  headers: {
    "Content-Type": "application/json",
  },
});

type ApiEnvelope<T> = {
  responseCode: number;
  message: string;
  value: {
    response: T;
    [key: string]: unknown;
  };
};

export interface DeviceDto {
  id: number;
  serialNumber: string;
  phoneNumber: string;
  deviceStatus: number;
  batteryAmount: number;
  tankVolume: number;
  creationDatetime: string;
  location?: string | null;
  bucketHeight?: number | null;
  sense?: string | null;
  day?: string | null;
}

export interface DeviceDetailDto {
  id: number;
  batteryAmount: number;
  deviceStatus: number;
  tankVolume: number;
  creationDatetime: string;
}

export const login = async (
  username: string,
  password: string
): Promise<{ token: string | null; message: string | null }> => {
  try {
    const response = await api.post<ApiEnvelope<{ token: string }>>(
      "/Admin/User/Login",
      { username, password }
    );
    if (response.data.responseCode === 200) {
      return {
        token: response.data.value.response.token,
        message: response.data.message,
      };
    }

    return { token: null, message: response.data.message };
  } catch (error: unknown) {
    console.error("Login failed", error);
    if (axios.isAxiosError(error)) {
      const message =
        typeof error.response?.data === "object" &&
        error.response?.data !== null &&
        "message" in error.response.data
          ? String(
              (error.response.data as { message?: string | null }).message ??
                "An error occurred"
            )
          : "An error occurred";
      return { token: null, message };
    }

    return { token: null, message: "An unexpected error occurred" };
  }
};

export const fetchData = async (
  token: string
): Promise<ApiEnvelope<DeviceDto[]> | null> => {
  try {
    const response = await api.get<ApiEnvelope<DeviceDto[]>>(
      "/Admin/Device/BOGetAllDevices",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Fetching data failed", error);
    return null;
  }
};

export const fetchItemDetails = async (
  id: number,
  token: string,
  pageSize: number,
  pageNumber: number
): Promise<ApiEnvelope<DeviceDetailDto[]> | null> => {
  try {
    const response = await api.get<ApiEnvelope<DeviceDetailDto[]>>(
      "/Admin/BucketInfo/BOGetBucketInfosById",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          id: id.toString(),
          pageSize: pageSize.toString(),
          pageNumber: pageNumber.toString(),
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Fetching item details failed", error);
    return null;
  }
};

export const deleteBucket = async (
  id: number,
  token: string
): Promise<ApiEnvelope<unknown> | null> => {
  try {
    const response = await api.post<ApiEnvelope<unknown>>(
      "/Admin/Device/BODeleteDevice",
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          id: id.toString(),
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Deleting bucket failed", error);
    return null;
  }
};