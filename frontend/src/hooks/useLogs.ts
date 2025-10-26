import { useState } from "react";
import { apiService } from "../services/api";
import type { LogsResponse } from "../types/api";

const useLogs = () => {
    const [logs, setLogs] = useState<LogsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const fetchLogs = async (page: number = 1, pageSize: number = 20) => {
        setLoading(true);
        clearMessages();
        try {
            const data = await apiService.getLogs(page, pageSize);
            setLogs(data);
            setSuccess("Logs fetched successfully.");
        } catch {
            setError("Failed to fetch logs.");
        } finally {
            setLoading(false);
        }
    };

    return {
        logs,
        loading,
        error,
        success,
        fetchLogs,
        clearMessages,
    };
};

export default useLogs;