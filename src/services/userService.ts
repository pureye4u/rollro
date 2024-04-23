import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '$lib/firebase.client';

export async function getIsVerified(uid: string): Promise<boolean> {
	let ref = doc(db, 'user', uid);
	const document = await getDoc(ref);
	let isVerified = false;
	if (document.exists()) {
		isVerified = document.data()?.isVerified ?? false;
	} else {
		setDoc(ref, { isVerified: false }, { merge: true });
	}
	return isVerified;
}