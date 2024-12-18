import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function getUserTokens(userId: string): Promise<number> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().tokens || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return 0;
  }
}