import { CreatePanoramaDto } from "./dto/create-panorama.dto";
import { ListPanoramasQueryDto } from "./dto/list-panoramas.query.dto";
import { UpdatePanoramaDto } from "./dto/update-panorama.dto";
import { Panorama } from "./panorama.model";
import { PanoramasRepository } from "./repository/panoramas.repository";

export class PanoramasService {
  constructor(private readonly repository: PanoramasRepository) {}

  list(query: ListPanoramasQueryDto): Promise<Panorama[]> {
    return this.repository.list(query);
  }

  findById(id: string): Promise<Panorama | null> {
    return this.repository.findById(id);
  }

  create(payload: CreatePanoramaDto): Promise<Panorama> {
    return this.repository.create(payload);
  }

  update(id: string, payload: UpdatePanoramaDto): Promise<Panorama | null> {
    return this.repository.update(id, payload);
  }
}
