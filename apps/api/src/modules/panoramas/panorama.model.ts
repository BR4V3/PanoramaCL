export type PanoramaStatus = "draft" | "published" | "archived";

export interface Panorama {
  id: string;
  localId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  eventType: string;
  flyerUrl: string | null;
  status: PanoramaStatus;
  createdAt: string;
  updatedAt: string;
}
