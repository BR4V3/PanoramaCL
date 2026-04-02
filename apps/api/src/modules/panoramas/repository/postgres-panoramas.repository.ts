import { DatabaseClient } from "../../../common/database/database-client";
import { CreatePanoramaDto } from "../dto/create-panorama.dto";
import { ListPanoramasQueryDto } from "../dto/list-panoramas.query.dto";
import { UpdatePanoramaDto } from "../dto/update-panorama.dto";
import { Panorama, PanoramaStatus } from "../panorama.model";
import { PanoramasRepository } from "./panoramas.repository";

interface PanoramaRow {
  id: string;
  local_id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  event_type: string;
  flyer_url: string | null;
  status: PanoramaStatus;
  created_at: string;
  updated_at: string;
}

const mapRowToPanorama = (row: PanoramaRow): Panorama => ({
  id: row.id,
  localId: row.local_id,
  title: row.title,
  description: row.description,
  startAt: row.start_at,
  endAt: row.end_at,
  eventType: row.event_type,
  flyerUrl: row.flyer_url,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class PostgresPanoramasRepository implements PanoramasRepository {
  constructor(private readonly db: DatabaseClient) {}

  async list(query: ListPanoramasQueryDto): Promise<Panorama[]> {
    const limit = query.limit ?? 100;
    const offset = query.offset ?? 0;

    const sql = `
      SELECT id, local_id, title, description, start_at, end_at, event_type, flyer_url, status, created_at, updated_at
      FROM panoramas
      WHERE ($1::uuid IS NULL OR local_id = $1)
        AND ($2::text IS NULL OR event_type = $2)
        AND ($3::text IS NULL OR status = $3)
        AND ($4::timestamptz IS NULL OR start_at >= $4)
        AND ($5::timestamptz IS NULL OR start_at <= $5)
      ORDER BY start_at ASC
      LIMIT $6 OFFSET $7
    `;

    const result = await this.db.query<PanoramaRow>(sql, [
      query.localId ?? null,
      query.eventType ?? null,
      query.status ?? null,
      query.startAtFrom ?? null,
      query.startAtTo ?? null,
      limit,
      offset,
    ]);

    return result.rows.map(mapRowToPanorama);
  }

  async findById(id: string): Promise<Panorama | null> {
    const sql = `
      SELECT id, local_id, title, description, start_at, end_at, event_type, flyer_url, status, created_at, updated_at
      FROM panoramas
      WHERE id = $1
      LIMIT 1
    `;

    const result = await this.db.query<PanoramaRow>(sql, [id]);
    return result.rows.length === 0 ? null : mapRowToPanorama(result.rows[0]);
  }

  async create(payload: CreatePanoramaDto): Promise<Panorama> {
    const sql = `
      INSERT INTO panoramas (local_id, title, description, start_at, end_at, event_type, flyer_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, local_id, title, description, start_at, end_at, event_type, flyer_url, status, created_at, updated_at
    `;

    const result = await this.db.query<PanoramaRow>(sql, [
      payload.localId,
      payload.title,
      payload.description ?? null,
      payload.startAt,
      payload.endAt ?? null,
      payload.eventType,
      payload.flyerUrl ?? null,
      payload.status ?? "draft",
    ]);

    return mapRowToPanorama(result.rows[0]);
  }

  async update(id: string, payload: UpdatePanoramaDto): Promise<Panorama | null> {
    const sql = `
      UPDATE panoramas
      SET
        local_id = COALESCE($2, local_id),
        title = COALESCE($3, title),
        description = COALESCE($4, description),
        start_at = COALESCE($5, start_at),
        end_at = COALESCE($6, end_at),
        event_type = COALESCE($7, event_type),
        flyer_url = COALESCE($8, flyer_url),
        status = COALESCE($9, status),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, local_id, title, description, start_at, end_at, event_type, flyer_url, status, created_at, updated_at
    `;

    const result = await this.db.query<PanoramaRow>(sql, [
      id,
      payload.localId ?? null,
      payload.title ?? null,
      payload.description ?? null,
      payload.startAt ?? null,
      payload.endAt ?? null,
      payload.eventType ?? null,
      payload.flyerUrl ?? null,
      payload.status ?? null,
    ]);

    return result.rows.length === 0 ? null : mapRowToPanorama(result.rows[0]);
  }
}
