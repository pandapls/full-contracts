import { useCallback, useMemo, useState } from "react";
import { CourseMetadata, createPinataService, PinataConfig } from "../utils/PinataService";

export const usePinataUpload = (config: PinataConfig) => {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const pinataService = useMemo(() => createPinataService(config), [config]);

	const uploadCourseMetadata = useCallback(
		async (metadata: CourseMetadata): Promise<string | null> => {
			setUploading(true);
			setError(null);

			try {
				// 测试认证
				const isAuthenticated = await pinataService.testAuthentication();
				if (!isAuthenticated) {
					throw new Error('Pinata authentication failed');
				}

				// 上传数据
				const ipfsHash = await pinataService.uploadJSON(
					metadata,
					`course-${metadata.title}`
				);
				console.log('Course metadata uploaded to IPFS:', ipfsHash);

				return ipfsHash;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Upload failed';
				setError(errorMessage);
				console.error('Upload error:', err);
				return null;
			} finally {
				setUploading(false);
			}
		},
		[pinataService]
	);

	return {
		uploadCourseMetadata,
		uploading,
		error,
		pinataService,
	};
};
