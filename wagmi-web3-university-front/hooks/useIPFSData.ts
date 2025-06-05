// useIPFSData.ts - 新增的 IPFS 数据获取 Hook
import { useState, useEffect, useCallback } from 'react';
import { CourseMetadata } from '../types/Course.type';

export const useIPFSData = (ipfsCid: string | null) => {
	const [data, setData] = useState<CourseMetadata | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchIPFSData = useCallback(async (cid: string) => {
		if (!cid) return;

		setLoading(true);
		setError(null);

		try {
			// 使用 IPFS 网关获取数据
			const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch IPFS data: ${response.status}`);
			}

			const metadata = await response.json();
			setData(metadata);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to fetch IPFS data'
			);
			console.error('IPFS fetch error:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (ipfsCid) {
			fetchIPFSData(ipfsCid);
		}
	}, [ipfsCid, fetchIPFSData]);

	return {
		data,
		loading,
		error,
		refetch: () => ipfsCid && fetchIPFSData(ipfsCid),
	};
};

