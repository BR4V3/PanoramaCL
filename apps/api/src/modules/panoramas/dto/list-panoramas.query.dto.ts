import { PanoramaStatus } from "../panorama.model";

export interface ListPanoramasQueryDto {
  localId?: string;
  eventType?: string;
  status?: PanoramaStatus;
  startAtFrom?: string;
  startAtTo?: string;
  limit?: number;
  offset?: number;
}
