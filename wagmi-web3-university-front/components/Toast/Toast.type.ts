export enum ToastType {
	SUCCESS = 'success',
	ERROR = 'error',
	WARNING = 'warning',
	INFO = 'info',
}
export interface ToastContextType {
	addToast: (message: string, type: ToastType, duration?: number) => void;
}

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}