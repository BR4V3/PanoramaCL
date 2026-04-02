export interface Local {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}
