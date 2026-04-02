import { DatabaseClient } from "../../../common/database/database-client";
import { CreateLocalDto } from "../dto/create-local.dto";
import { ListLocalsQueryDto } from "../dto/list-locals.query.dto";
import { UpdateLocalDto } from "../dto/update-local.dto";
import { Local } from "../local.model";
import { LocalesRepository } from "./locales.repository";

interface LocalRow {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  category: string;
  latitude: string;
  longitude: string;
  description: string | null;
  image_urls: unknown;
  created_at: string;
  updated_at: string;
}

const mapRowToLocal = (row: LocalRow): Local => ({
  id: row.id,
  name: row.name,
  address: row.address,
  district: row.district,
  city: row.city,
  category: row.category,
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  description: row.description,
  imageUrls: Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class PostgresLocalesRepository implements LocalesRepository {
  constructor(private readonly db: DatabaseClient) {}

  async list(query: ListLocalsQueryDto): Promise<Local[]> {
    const limit = query.limit ?? 100;
    const offset = query.offset ?? 0;

    const sql = `
      SELECT id, name, address, district, city, category, latitude, longitude, description, image_urls, created_at, updated_at
      FROM locals
      WHERE ($1::text IS NULL OR city = $1)
        AND ($2::text IS NULL OR district = $2)
        AND ($3::text IS NULL OR category = $3)
        AND ($4::numeric IS NULL OR latitude >= $4)
        AND ($5::numeric IS NULL OR longitude >= $5)
        AND ($6::numeric IS NULL OR latitude <= $6)
        AND ($7::numeric IS NULL OR longitude <= $7)
      ORDER BY created_at DESC
      LIMIT $8 OFFSET $9
    `;

    const result = await this.db.query<LocalRow>(sql, [
      query.city ?? null,
      query.district ?? null,
      query.category ?? null,
      query.minLat ?? null,
      query.minLng ?? null,
      query.maxLat ?? null,
      query.maxLng ?? null,
      limit,
      offset,
    ]);

    return result.rows.map(mapRowToLocal);
  }

  async findById(id: string): Promise<Local | null> {
    const sql = `
      SELECT id, name, address, district, city, category, latitude, longitude, description, image_urls, created_at, updated_at
      FROM locals
      WHERE id = $1
      LIMIT 1
    `;

    const result = await this.db.query<LocalRow>(sql, [id]);
    return result.rows.length === 0 ? null : mapRowToLocal(result.rows[0]);
  }

  async create(payload: CreateLocalDto): Promise<Local> {
    const sql = `
      INSERT INTO locals (name, address, district, city, category, latitude, longitude, description, image_urls)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      RETURNING id, name, address, district, city, category, latitude, longitude, description, image_urls, created_at, updated_at
    `;

    const result = await this.db.query<LocalRow>(sql, [
      payload.name,
      payload.address,
      payload.district,
      payload.city,
      payload.category,
      payload.latitude,
      payload.longitude,
      payload.description ?? null,
      JSON.stringify(payload.imageUrls ?? []),
    ]);

    return mapRowToLocal(result.rows[0]);
  }

  async update(id: string, payload: UpdateLocalDto): Promise<Local | null> {
    const sql = `
      UPDATE locals
      SET
        name = COALESCE($2, name),
        address = COALESCE($3, address),
        district = COALESCE($4, district),
        city = COALESCE($5, city),
        category = COALESCE($6, category),
        latitude = COALESCE($7, latitude),
        longitude = COALESCE($8, longitude),
        description = COALESCE($9, description),
        image_urls = COALESCE($10::jsonb, image_urls),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, address, district, city, category, latitude, longitude, description, image_urls, created_at, updated_at
    `;

    const imageUrlsParam = payload.imageUrls ? JSON.stringify(payload.imageUrls) : null;

    const result = await this.db.query<LocalRow>(sql, [
      id,
      payload.name ?? null,
      payload.address ?? null,
      payload.district ?? null,
      payload.city ?? null,
      payload.category ?? null,
      payload.latitude ?? null,
      payload.longitude ?? null,
      payload.description ?? null,
      imageUrlsParam,
    ]);

    return result.rows.length === 0 ? null : mapRowToLocal(result.rows[0]);
  }
}
