import { CreateLocalDto } from "./dto/create-local.dto";
import { ListLocalsQueryDto } from "./dto/list-locals.query.dto";
import { UpdateLocalDto } from "./dto/update-local.dto";
import { Local } from "./local.model";
import { LocalesRepository } from "./repository/locales.repository";

export class LocalesService {
  constructor(private readonly repository: LocalesRepository) {}

  list(query: ListLocalsQueryDto): Promise<Local[]> {
    return this.repository.list(query);
  }

  findById(id: string): Promise<Local | null> {
    return this.repository.findById(id);
  }

  create(payload: CreateLocalDto): Promise<Local> {
    return this.repository.create(payload);
  }

  update(id: string, payload: UpdateLocalDto): Promise<Local | null> {
    return this.repository.update(id, payload);
  }
}
