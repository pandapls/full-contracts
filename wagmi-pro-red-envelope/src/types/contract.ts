export interface GrabInfo {
	amount: bigint;
	hasGrabbed: boolean;
	grabTime: bigint;
	grabIndex: bigint;
}

export interface RedEnvelopeData {
	totalAmount?: bigint;
	redEnvelopeCount?: bigint;
	grabbedCount?: bigint;
	isRedEnvelopeSet?: boolean;
	remainingCount?: bigint;
	userGrabInfo?: GrabInfo;
	redOwner?: string;
	isEqualDistribution?: boolean;
	allGrabbers?: string[];
	contracBlance?: bigint;
}

export interface ContractWrites {
	createRedEnvelope: (amount: string, count: string, isEqual: boolean) => void;
	grabRedEnvelope: () => void;
	isSetPending: boolean;
	isSetConfirming: boolean;
	isSetSuccess: boolean;
	isGrabPending: boolean;
	isGrabConfirming: boolean;
	isGrabSuccess: boolean;
}
