export interface CourseStruct {
	id: bigint;
	ipfsCid: string;
	price: bigint;
	instructor: `0x${string}`;
	isActive: boolean;
	createdAt: bigint;
	totalStudents: bigint;
}

export interface GetActiveCoursesResult {
	0: CourseStruct[]; // courses array
	1: bigint; // totalCount
}

// 类型保护函数
export function isCourseStruct(data: any): data is CourseStruct {
	return (
		data &&
		typeof data.id === 'bigint' &&
		typeof data.ipfsCid === 'string' &&
		typeof data.price === 'bigint' &&
		typeof data.instructor === 'string' &&
		typeof data.isActive === 'boolean' &&
		typeof data.createdAt === 'bigint' &&
		typeof data.totalStudents === 'bigint'
	);
}
