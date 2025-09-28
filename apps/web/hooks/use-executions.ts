import { useState, useEffect, useCallback, useRef } from 'react';
import { ExecutionData } from '@/lib/types';

interface UseExecutionsOptions {
  projectId: string;
  limit?: number;
  status?: string;
  workflowId?: string;
  refreshInterval?: number; // For real-time updates
}

interface ExecutionsResponse {
  executions: ExecutionData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  filters: {
    status?: string;
    workflowId?: string;
  };
}

export function useExecutions({
  projectId,
  limit = 20,
  status,
  workflowId,
  refreshInterval = 0, // 0 means no auto-refresh
}: UseExecutionsOptions) {
  const [allExecutions, setAllExecutions] = useState<ExecutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Use ref to track if filters have changed to reset data
  const prevFilters = useRef({ status, workflowId });

  const fetchExecutions = useCallback(async (page: number, isLoadMore: boolean = false) => {
    if (!projectId) return;

    try {
      if (!isLoadMore) {
        setError(null);
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) params.append('status', status);
      if (workflowId) params.append('workflowId', workflowId);

      const response = await fetch(
        `/api/rest/projects/${projectId}/executions?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch executions');
      }

      const responseData: ExecutionsResponse = await response.json();
      
      if (isLoadMore) {
        // Append new executions to existing ones
        setAllExecutions(prev => [...prev, ...responseData.executions]);
      } else {
        // Replace executions (initial load or filter change)
        setAllExecutions(responseData.executions);
      }
      
      setHasMore(responseData.pagination.hasMore);
      setTotalCount(responseData.pagination.total);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Error fetching executions:', err);
      setError('Failed to load executions');
      if (!isLoadMore) {
        setAllExecutions([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [projectId, limit, status, workflowId]);

  // Reset data when filters change
  useEffect(() => {
    const filtersChanged = 
      prevFilters.current.status !== status || 
      prevFilters.current.workflowId !== workflowId;
    
    if (filtersChanged) {
      setAllExecutions([]);
      setCurrentPage(1);
      setHasMore(true);
      prevFilters.current = { status, workflowId };
    }
  }, [status, workflowId]);

  // Initial fetch and when filters change
  useEffect(() => {
    setLoading(true);
    fetchExecutions(1, false);
  }, [fetchExecutions]);

  // Auto-refresh for running executions
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      // Only refresh if we have running executions
      const hasRunningExecutions = allExecutions.some(
        (ex) => ex.status === 'Running' || ex.status === 'Starting'
      );

      if (hasRunningExecutions) {
        // Refresh only the first page to update running executions
        fetchExecutions(1, false);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, allExecutions, fetchExecutions]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchExecutions(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, currentPage, fetchExecutions]);

  const refetch = useCallback(() => {
    setAllExecutions([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchExecutions(1, false);
  }, [fetchExecutions]);

  return {
    executions: allExecutions,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refetch,
  };
}