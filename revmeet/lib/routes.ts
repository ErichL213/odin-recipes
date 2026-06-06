import {
  collection, addDoc, getDocs, getDoc, doc,
  query, orderBy, updateDoc, increment, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { DrivingRoute } from '@/types';

const COL = 'routes';

export async function createRoute(
  data: Omit<DrivingRoute, 'id' | 'createdAt' | 'likeCount'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    likeCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getRoutes(): Promise<DrivingRoute[]> {
  const q = query(collection(db, COL), orderBy('likeCount', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DrivingRoute));
}

export async function getRoute(id: string): Promise<DrivingRoute | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as DrivingRoute) : null;
}

export async function likeRoute(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { likeCount: increment(1) });
}
