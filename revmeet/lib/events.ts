import {
  collection, addDoc, getDocs, getDoc, doc,
  query, orderBy, where, updateDoc, increment,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CarEvent } from '@/types';

const COL = 'events';

export async function createEvent(
  data: Omit<CarEvent, 'id' | 'createdAt' | 'attendeeCount'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    attendeeCount: 0,
    createdAt: serverTimestamp(),
    date: Timestamp.fromDate(data.date),
  });
  return ref.id;
}

export async function getUpcomingEvents(): Promise<CarEvent[]> {
  const q = query(
    collection(db, COL),
    where('date', '>=', Timestamp.now()),
    orderBy('date', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CarEvent));
}

export async function getEvent(id: string): Promise<CarEvent | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as CarEvent) : null;
}

export async function attendEvent(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { attendeeCount: increment(1) });
}
