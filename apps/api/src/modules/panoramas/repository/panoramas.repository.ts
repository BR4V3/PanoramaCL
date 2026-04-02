import { CreatePanoramaDto } from "../dto/create-panorama.dto";
import { ListPanoramasQueryDto } from "../dto/list-panoramas.query.dto";
import { UpdatePanoramaDto } from "../dto/update-panorama.dto";
import { Panorama } from "../panorama.model";

export interface PanoramasRepository {
  list(query: ListPanoramasQueryDto): Promise<Panorama[]>;
  findById(id: string): Promise<Panorama | null>;
  create(payload: CreatePanoramaDto): Promise<Panorama>;
  update(id: string, payload: UpdatePanoramaDto): Promise<Panorama | null>;
}
