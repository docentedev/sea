import { useState } from "react";
import { apiService } from "../services/api";
import type { LogsResponse } from "../types/api";


import type { LogFiltersState } from "../components/LogFilters";

const useLogs = () => {
    const [logs, setLogs] = useState<LogsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [filters, setFilters] = useState<LogFiltersState>({});

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const fetchLogs = async (page: number = 1, pageSize: number = 20, customFilters?: LogFiltersState) => {
        setLoading(true);
        clearMessages();
        try {
            const data = await apiService.getLogs(page, pageSize, customFilters || filters);
            setLogs(data);
            setSuccess("Logs fetched successfully.");
        } catch {
            setError("Failed to fetch logs.");
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (newFilters: LogFiltersState) => {
        setFilters(newFilters);
        fetchLogs(1, 20, newFilters);
    };

    return {
        logs,
        loading,
        error,
        success,
        fetchLogs,
        clearMessages,
        filters,
        updateFilters,
    };
};

export default useLogs;