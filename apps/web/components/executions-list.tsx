'use client'

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, AlertCircle, MoreHorizontal, CheckCircle, Clock, Play, Loader, X } from "lucide-react";
import { ExecutionData } from "@/lib/types";
import { useExecutions } from "@/hooks/use-executions";

interface ExecutionsListProps {
    projectId: string;
}

export function ExecutionsList({ projectId }: ExecutionsListProps) {
    const [statusFilter] = useState<string>(''); // #Todo Future: add filter UI
    const loadMoreRef = useRef<HTMLDivElement>(null);
    
    const {
        executions,
        loading,
        loadingMore,
        error,
        hasMore,
        totalCount,
        loadMore,
    } = useExecutions({
        projectId,
        limit: 10,
        status: statusFilter || undefined,
        refreshInterval: 5000, // Refresh every 5 seconds for running executions
    });

    useEffect(() => {
        if (!loadMoreRef.current || loading || loadingMore || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [loading, loadingMore, hasMore, loadMore]);

    const getStatusIcon = (status: ExecutionData['status']) => {
        switch (status) {
            case 'Success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'Error':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'Running':
                return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'Starting':
                return <Play className="w-4 h-4 text-blue-500" />;
            case 'Canceled':
                return <X className="w-4 h-4 text-gray-500" />;
            case 'Crashed':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: ExecutionData['status']) => {
        switch (status) {
            case 'Success':
                return 'text-green-600';
            case 'Error':
            case 'Crashed':
                return 'text-red-600';
            case 'Running':
            case 'Starting':
                return 'text-blue-600';
            case 'Canceled':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';

        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} min ago`;
        } else if (diffInMinutes < 24 * 60) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    };

    const activeExecutions = executions.filter(ex => ex.status === 'Running' || ex.status === 'Starting').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">Loading executions...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-8">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <span className="ml-2 text-red-600">{error}</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-between gap-4">
                    <span className="text-sm text-gray-500">
                        {activeExecutions === 0 ? 'No active executions' : `${activeExecutions} active execution${activeExecutions > 1 ? 's' : ''}`}
                    </span>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Workflow</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Started</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Run Time</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Exec. ID</th>
                            <th className="w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {executions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                                    No executions found
                                </td>
                            </tr>
                        ) : (
                            executions.map((execution) => (
                                <tr key={execution.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${execution.status === 'Success' ? 'bg-green-500' :
                                                    execution.status === 'Error' || execution.status === 'Crashed' ? 'bg-red-500' :
                                                        execution.status === 'Running' || execution.status === 'Starting' ? 'bg-blue-500' :
                                                            'bg-gray-400'
                                                }`}></div>
                                            <span className="text-sm text-gray-900">{execution.workflowName}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(execution.status)}
                                            <span className={`text-sm ${getStatusColor(execution.status)}`}>
                                                {execution.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-600">
                                            {formatDate(execution.startedAt)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-600">
                                            {execution.runtimeFormatted}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">{execution?.id}</span>
                                            {(execution.status === 'Error' || execution.status === 'Crashed') && (
                                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Load More / Infinite Scrolling Section */}
                {executions.length > 0 && (
                    <div className="border-t border-gray-200">
                        {hasMore ? (
                            <div 
                                ref={loadMoreRef}
                                className="text-center py-6"
                            >
                                {loadingMore ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader className="w-4 h-4 animate-spin text-gray-500" />
                                        <span className="text-sm text-gray-500">Loading more executions...</span>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={loadMore}
                                        className="text-sm bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
                                        disabled={loadingMore}
                                    >
                                        <Loader className="w-4 h-4 mr-2" />
                                        Load more
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                {executions.length === totalCount ? (
                                    <span>No more executions to fetch</span>
                                ) : (
                                    <span>Showing {executions.length} of {totalCount} executions</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}