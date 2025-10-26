import { useEffect } from "react";
import { DataTable, Pagination } from "../components";
import useLogs from "../hooks/useLogs";
import Container from "../components/Container";

const LogsPage: React.FC = () => {
    const { logs, loading, error, success, fetchLogs } = useLogs();

    useEffect(() => {
        fetchLogs(1, 8);
    }, []);

    const handlePageChange = (page: number) => {
        fetchLogs(page, 8);
    };
    return (
        <Container
            header="Logs"
            description="View and manage application logs."
            loading={loading}
            error={error}
            success={success}
        >
            <DataTable data={logs?.logs || []} columns={[
                { header: 'Timestamp', key: 'timestamp' },
                { header: 'Level', key: 'level' },
                { header: 'Service', key: 'service' },
                { header: 'Message', key: 'message' },
                { header: 'User ID', key: 'user_id' },
                { header: 'User Email', key: 'user_email' },
            ]} keyField={"id"} />
            <div className="mt-4 flex justify-end">
                <Pagination
                    currentPage={logs?.pagination.page || 1}
                    totalPages={logs?.pagination.totalPages || 1}
                    onPageChange={handlePageChange}
                />
            </div>
        </Container>
    );
};
export default LogsPage;