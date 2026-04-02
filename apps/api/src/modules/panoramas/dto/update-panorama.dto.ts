import { PanoramaStatus } from "../panorama.model";

export interface UpdatePanoramaDto {
  localId?: string;
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  eventType?: string;
  flyerUrl?: string;
  status?: PanoramaStatus;
}
