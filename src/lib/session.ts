import { writable, type Writable } from 'svelte/store';

type User = {
	email?: string | null;
	displayName?: string | null;
	photoURL?: string | null;
	uid?: string | null;
	isVerified?: boolean | null;
};

export type SessionState = {
	user: User | null;
	isLoading?: boolean;
	isLoggedIn?: boolean;
};

export const session = <Writable<SessionState>>writable();
