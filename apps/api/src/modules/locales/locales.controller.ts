import { HttpResponse, RequestContext, created, ok } from "../../common/http/http-types";
import { CreateLocalDto } from "./dto/create-local.dto";
import { ListLocalsQueryDto } from "./dto/list-locals.query.dto";
import { UpdateLocalDto } from "./dto/update-local.dto";
import { Local } from "./local.model";
import { LocalesService } from "./locales.service";

interface IdParams {
  id: string;
}

export class LocalesController {
  constructor(private readonly service: LocalesService) {}

  async list(context: RequestContext<unknown, ListLocalsQueryDto, unknown>): Promise<HttpResponse<Local[]>> {
    const data = await this.service.list(context.query);
    return ok(data);
  }

  async getById(context: RequestContext<IdParams, unknown, unknown>): Promise<HttpResponse<Local | null>> {
    const data = await this.service.findById(context.params.id);
    return ok(data);
  }

  async create(context: RequestContext<unknown, unknown, CreateLocalDto>): Promise<HttpResponse<Local>> {
    const data = await this.service.create(context.body);
    return created(data);
  }

  async update(
    context: RequestContext<IdParams, unknown, UpdateLocalDto>,
  ): Promise<HttpResponse<Local | null>> {
    const data = await this.service.update(context.params.id, context.body);
    return ok(data);
  }
}
