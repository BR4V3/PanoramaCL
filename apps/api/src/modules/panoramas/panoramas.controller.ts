import { HttpResponse, RequestContext, created, ok } from "../../common/http/http-types";
import { CreatePanoramaDto } from "./dto/create-panorama.dto";
import { ListPanoramasQueryDto } from "./dto/list-panoramas.query.dto";
import { UpdatePanoramaDto } from "./dto/update-panorama.dto";
import { Panorama } from "./panorama.model";
import { PanoramasService } from "./panoramas.service";

interface IdParams {
  id: string;
}

export class PanoramasController {
  constructor(private readonly service: PanoramasService) {}

  async list(
    context: RequestContext<unknown, ListPanoramasQueryDto, unknown>,
  ): Promise<HttpResponse<Panorama[]>> {
    const data = await this.service.list(context.query);
    return ok(data);
  }

  async getById(context: RequestContext<IdParams, unknown, unknown>): Promise<HttpResponse<Panorama | null>> {
    const data = await this.service.findById(context.params.id);
    return ok(data);
  }

  async create(context: RequestContext<unknown, unknown, CreatePanoramaDto>): Promise<HttpResponse<Panorama>> {
    const data = await this.service.create(context.body);
    return created(data);
  }

  async update(
    context: RequestContext<IdParams, unknown, UpdatePanoramaDto>,
  ): Promise<HttpResponse<Panorama | null>> {
    const data = await this.service.update(context.params.id, context.body);
    return ok(data);
  }
}
