import { CreateLocalDto } from "../dto/create-local.dto";
import { ListLocalsQueryDto } from "../dto/list-locals.query.dto";
import { UpdateLocalDto } from "../dto/update-local.dto";
import { Local } from "../local.model";

export interface LocalesRepository {
  list(query: ListLocalsQueryDto): Promise<Local[]>;
  findById(id: string): Promise<Local | null>;
  create(payload: CreateLocalDto): Promise<Local>;
  update(id: string, payload: UpdateLocalDto): Promise<Local | null>;
}
