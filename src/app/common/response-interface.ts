export interface MessageApiResponse {
    status: number;
    message: string;
    error: string | null;
    data?: any;
}

