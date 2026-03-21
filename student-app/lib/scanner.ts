import { apiStandard } from './api';

export type ScanResult = {
    question: string;
    solution: string;
    steps?: string[];
    type: 'theory' | 'calculation' | 'multiple_choice';
    topic?: string;
    explanation?: string;
    summary?: string;
};

export type SolveResponse = {
    results: ScanResult[];
    cost: number;
    remaining_credits: number;
};

/**
 * Service to handle AI question solving.
 * Addresses "Separation of Concerns" by moving logic out of UI components.
 */
export const scannerService = {
    /**
     * Solves a question using a base64 image or a File/Blob (multipart).
     * Addresses "File uploads going directly to your server" by being ready for 
     * future multipart/presigned URL shifts.
     */
    solve: async (image: string | any, mode: 'base64' | 'multipart' = 'base64'): Promise<SolveResponse> => {
        if (mode === 'base64') {
            return await apiStandard.post<SolveResponse>('scan/solve', { image });
        } else {
            // Multipart support for better performance with large files
            const formData = new FormData();
            formData.append('image', image);
            return await apiStandard.post<SolveResponse>('scan/solve', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
    }
};
