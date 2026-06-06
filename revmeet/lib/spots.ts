import {
  collection, addDoc, getDocs, getDoc, doc,
  query, orderBy, updateDoc, increment, arrayUnion, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { PhotoSpot } from '@/types';

const COL = 'spots';

export async function createSpot(
  data: Omit<PhotoSpot, 'id' | 'createdAt' | 'photos' | 'rating' | 'ratingCount'>,
): Promise<string> {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    photos: [],
    rating: 0,
    ratingCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSpots(): Promise<PhotoSpot[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PhotoSpot));
}

export async function getSpot(id: string): Promise<PhotoSpot | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as PhotoSpot) : null;
}

export async function uploadSpotPhoto(spotId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const photoRef = ref(storage, `spots/${spotId}/${Date.now()}.jpg`);
  await uploadBytes(photoRef, blob);
  const url = await getDownloadURL(photoRef);
  await updateDoc(doc(db, COL, spotId), { photos: arrayUnion(url) });
  return url;
}

export async function rateSpot(id: string, rating: number): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    rating: increment(rating),
    ratingCount: increment(1),
  });
}
