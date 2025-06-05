// utils/pinata.ts
// Pinata IPFS 上传工具

export interface PinataConfig {
	apiKey: string;
	apiSecret: string;
	jwt?: string; // JWT token (推荐使用)
}

export interface CourseMetadata {
	title: string;
	description: string;
	imageUrl: string;
	contentUrls: string[];
	category?: string;
	tags?: string[];
	level?: string;
	duration?: string;
	prerequisites?: string[];
	learningOutcomes?: string[];
}

export interface PinataResponse {
	IpfsHash: string;
	PinSize: number;
	Timestamp: string;
}

class PinataService {
	private config: PinataConfig;
	private baseURL = 'https://api.pinata.cloud';

	constructor(config: PinataConfig) {
		this.config = config;
	}

	// 上传JSON数据到IPFS
	async uploadJSON(data: CourseMetadata, name?: string): Promise<string> {
		try {
			const url = `${this.baseURL}/pinning/pinJSONToIPFS`;

			const body = {
				pinataContent: data,
				pinataMetadata: {
					name: name || `course-${Date.now()}`,
					keyvalues: {
						type: 'course-metadata',
						timestamp: new Date().toISOString(),
					},
				},
				pinataOptions: {
					cidVersion: 1,
				},
			};

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
			};

			// 优先使用JWT，否则使用API Key/Secret
			if (this.config.jwt) {
				headers['Authorization'] = `Bearer ${this.config.jwt}`;
			} else {
				headers['pinata_api_key'] = this.config.apiKey;
				headers['pinata_secret_api_key'] = this.config.apiSecret;
			}

			const response = await fetch(url, {
				method: 'POST',
				headers,
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Pinata upload failed: ${response.status} - ${errorText}`
				);
			}

			const result: PinataResponse = await response.json();
			console.log('Pinata upload successful:', result);

			return result.IpfsHash;
		} catch (error) {
			console.error('Pinata upload error:', error);
			throw error;
		}
	}

	// 测试Pinata连接
	async testAuthentication(): Promise<boolean> {
		try {
			const url = `${this.baseURL}/data/testAuthentication`;

			const headers: Record<string, string> = {};

			if (this.config.jwt) {
				headers['Authorization'] = `Bearer ${this.config.jwt}`;
			} else {
				headers['pinata_api_key'] = this.config.apiKey;
				headers['pinata_secret_api_key'] = this.config.apiSecret;
			}

			const response = await fetch(url, {
				method: 'GET',
				headers,
			});

			return response.ok;
		} catch (error) {
			console.error('Pinata auth test failed:', error);
			return false;
		}
	}

	// 获取固定的文件列表
	async listPinnedFiles(): Promise<any[]> {
		try {
			const url = `${this.baseURL}/data/pinList?status=pinned&pageLimit=10`;

			const headers: Record<string, string> = {};

			if (this.config.jwt) {
				headers['Authorization'] = `Bearer ${this.config.jwt}`;
			} else {
				headers['pinata_api_key'] = this.config.apiKey;
				headers['pinata_secret_api_key'] = this.config.apiSecret;
			}

			const response = await fetch(url, {
				method: 'GET',
				headers,
			});

			if (!response.ok) {
				throw new Error(`Failed to list files: ${response.status}`);
			}

			const result = await response.json();
			return result.rows || [];
		} catch (error) {
			console.error('Failed to list pinned files:', error);
			return [];
		}
	}
}

// 创建Pinata服务实例
export const createPinataService = (config: PinataConfig): PinataService => {
	return new PinataService(config);
};
