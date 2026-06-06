export type EventType = 'meetup' | 'car-show' | 'cruise' | 'track-day' | 'other';
export type SpotType = 'scenic' | 'urban' | 'bridge' | 'parking' | 'overlook' | 'other';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
}

export interface CarEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  location: GeoPoint;
  address: string;
  date: Date;
  endDate?: Date;
  createdBy: string;
  creatorName: string;
  attendeeCount: number;
  imageURL?: string;
  createdAt: Date;
  tags: string[];
}

export interface PhotoSpot {
  id: string;
  title: string;
  description: string;
  type: SpotType;
  location: GeoPoint;
  address: string;
  photos: string[];
  createdBy: string;
  creatorName: string;
  rating: number;
  ratingCount: number;
  tips?: string;
  createdAt: Date;
  tags: string[];
}

export interface RouteWaypoint {
  location: GeoPoint;
  title?: string;
  note?: string;
}

export interface DrivingRoute {
  id: string;
  title: string;
  description: string;
  waypoints: RouteWaypoint[];
  distance: number;
  duration: number;
  highlights: string;
  createdBy: string;
  creatorName: string;
  likeCount: number;
  coverImageURL?: string;
  createdAt: Date;
  tags: string[];
}
