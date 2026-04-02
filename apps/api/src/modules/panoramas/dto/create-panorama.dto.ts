import { PanoramaStatus } from "../panorama.model";

export interface CreatePanoramaDto {
  localId: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  eventType: string;
  flyerUrl?: string;
  status?: PanoramaStatus;
}
