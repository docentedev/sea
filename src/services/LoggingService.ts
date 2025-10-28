import { config } from '../config/index.js';
import console from 'console';
import fs from 'fs';

export interface LogEntry {
    level: 'info' | 'warn' | 'error' | 'debug';
    service: string;
    message: string;
    userId?: number;
    userEmail?: string;
    username?: string;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
    timestamp?: string;
}

export class LoggingService {
    private static instance: LoggingService;
    private logServerUrl: string;

    private constructor() {
        this.logServerUrl = `http://localhost:${config.loggingPort || 3001}`;
    }

    public static getInstance(): LoggingService {
        if (!LoggingService.instance) {
            LoggingService.instance = new LoggingService();
        }
        return LoggingService.instance;
    }

    private async sendLogToServer(logEntry: LogEntry): Promise<void> {
        try {
            if (!config.loggingEnabled) {
                return;
            }

            const response = await fetch(`${this.logServerUrl}/api/logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...logEntry,
                    timestamp: logEntry.timestamp || new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                console.warn(`Failed to send log to server: ${response.status}`);
            }
        } catch (error) {
            // Fallback to console logging if server is unavailable
            console.error('Failed to send log to logging server:', error);
        }
    }

    public async info(service: string, message: string, metadata?: Record<string, any>): Promise<void> {
        // Write debug info to file
        fs.appendFileSync('/tmp/debug.log', `DEBUG LoggingService.info called: ${service} - ${message} - metadata: ${JSON.stringify(metadata)}\n`);
        
        const logEntry: LogEntry = {
            level: 'info',
            service,
            message,
            userId: metadata?.userId,
            userEmail: metadata?.userEmail,
            username: metadata?.username,
            ip: metadata?.ip,
            userAgent: metadata?.userAgent,
            metadata,
        };

        // Send to logging server
        await this.sendLogToServer(logEntry);

        // Also log locally
        console.log(`[${service}] ${message}`, metadata ? JSON.stringify(metadata) : '');
    }

    public async warn(service: string, message: string, metadata?: Record<string, any>): Promise<void> {
        const logEntry: LogEntry = {
            level: 'warn',
            service,
            message,
            userId: metadata?.userId,
            userEmail: metadata?.userEmail,
            username: metadata?.username,
            ip: metadata?.ip,
            userAgent: metadata?.userAgent,
            metadata,
        };

        await this.sendLogToServer(logEntry);
        console.warn(`[${service}] ${message}`, metadata ? JSON.stringify(metadata) : '');
    }

    public async error(service: string, message: string, metadata?: Record<string, any>): Promise<void> {
        const logEntry: LogEntry = {
            level: 'error',
            service,
            message,
            userId: metadata?.userId,
            userEmail: metadata?.userEmail,
            username: metadata?.username,
            ip: metadata?.ip,
            userAgent: metadata?.userAgent,
            metadata,
        };

        await this.sendLogToServer(logEntry);
        console.error(`[${service}] ${message}`, metadata ? JSON.stringify(metadata) : '');
    }

    public async debug(service: string, message: string, metadata?: Record<string, any>): Promise<void> {
        const logEntry: LogEntry = {
            level: 'debug',
            service,
            message,
            userId: metadata?.userId,
            userEmail: metadata?.userEmail,
            username: metadata?.username,
            ip: metadata?.ip,
            userAgent: metadata?.userAgent,
            metadata,
        };

        await this.sendLogToServer(logEntry);
        console.debug(`[${service}] ${message}`, metadata ? JSON.stringify(metadata) : '');
    }

    // Specialized logging methods for user operations
    public async logUserAction(
        action: string,
        userId: number,
        userEmail: string,
        performedBy?: { id: number; email: string },
        metadata?: Record<string, any>
    ): Promise<void> {
        const message = `User ${action}: ${userEmail} (ID: ${userId})`;
        const logMetadata = {
            action,
            targetUserId: userId,
            targetUserEmail: userEmail,
            performedBy: performedBy ? { id: performedBy.id, email: performedBy.email } : undefined,
            ...metadata,
        };

        await this.info('users', message, logMetadata);
    }

    public async logAuthAction(
        action: string,
        userEmail: string,
        ip?: string,
        userAgent?: string,
        success: boolean = true,
        metadata?: Record<string, any>
    ): Promise<void> {
        const status = success ? 'successful' : 'failed';
        const message = `Authentication ${action} ${status} for user: ${userEmail}`;
        const logMetadata = {
            action,
            userEmail,
            ip,
            userAgent,
            success,
            ...metadata,
        };

        if (success) {
            await this.info('auth', message, logMetadata);
        } else {
            await this.warn('auth', message, logMetadata);
        }
    }

    public async logFileAction(
        action: string,
        fileName: string,
        userId: number,
        userEmail: string,
        fileSize?: number,
        metadata?: Record<string, any>
    ): Promise<void> {
        const message = `File ${action}: ${fileName} by ${userEmail}`;
        const logMetadata = {
            action,
            fileName,
            userId,
            userEmail,
            fileSize,
            ...metadata,
        };

        await this.info('files', message, logMetadata);
    }

    public async logSystemEvent(
        event: string,
        message: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        await this.info('system', `${event}: ${message}`, metadata);
    }

    // Get all with filters and pagination
    // /api/logs
    public async getLogs(
        filters: {
            level?: string;
            service?: string;
            userId?: number;
            startDate?: string;
            endDate?: string;
        },
        page: number,
        pageSize: number
    ): Promise<LogEntry[]> {
        return this.loggingRepo.getLogs(filters, page, pageSize);
    }

    private loggingRepo = {
        getLogs: async (
            filters: {
                level?: string;
                service?: string;
                userId?: number;
                startDate?: string;
                endDate?: string;
            },
            page: number,
            pageSize: number
        ): Promise<LogEntry[]> => {
            try {
                const queryParams = new URLSearchParams();
                if (filters.level) queryParams.append('level', filters.level);
                if (filters.service) queryParams.append('service', filters.service);
                if (filters.userId) queryParams.append('userId', filters.userId.toString());
                if (filters.startDate) queryParams.append('startDate', filters.startDate);
                if (filters.endDate) queryParams.append('endDate', filters.endDate);
                queryParams.append('page', page.toString());
                queryParams.append('pageSize', pageSize.toString());

                const response = await fetch(`${this.logServerUrl}/api/logs?${queryParams.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.warn(`Failed to retrieve logs from server: ${response.status}`);
                    return [];
                }

                const data = await response.json();
                console.log('📝 Logs retrieved successfully:', data);
                return data.data as LogEntry[];
            } catch (error) {
                console.error('Failed to retrieve logs from logging server:', error);
                return [];
            }
        },
    };
}

// Export singleton instance
export const loggingService = LoggingService.getInstance();