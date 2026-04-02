export interface ListLocalsQueryDto {
  city?: string;
  district?: string;
  category?: string;
  minLat?: number;
  minLng?: number;
  maxLat?: number;
  maxLng?: number;
  limit?: number;
  offset?: number;
}
