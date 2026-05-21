import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import * as ms from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OwnershipGuard implements CanActivate, OnModuleInit {
  private catalogService: any;

  constructor(@Inject('CATALOG_SERVICE') private clientCatalog: ms.ClientGrpc) {}

  onModuleInit() {
    this.catalogService = this.clientCatalog.getService('CatalogService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId: string = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Usuario no identificado');
    }

    // Extraer IDs de los parámetros de ruta
    const { id: courseId, moduleId, lessonId } = request.params;

    // Determinar cuál ID está disponible en jerarquía: lección > módulo > curso
    const payload: { userId: string; courseId?: string; moduleId?: string; lessonId?: string } = { userId };

    if (lessonId) {
      payload.lessonId = lessonId;
    } else if (moduleId) {
      payload.moduleId = moduleId;
    } else if (courseId) {
      payload.courseId = courseId;
    } else {
      // Si no hay ningún ID de recurso, no hay nada que verificar (ej. POST /courses que crea uno nuevo)
      return true;
    }

    try {
      const result: any = await firstValueFrom(
        this.catalogService.VerifyOwnership(payload),
      );

      if (!result.isOwner) {
        throw new ForbiddenException('No tienes permiso para modificar este recurso');
      }

      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      // Si el catálogo no responde o el recurso no existe, denegar por seguridad
      throw new ForbiddenException('No se pudo verificar la propiedad del recurso');
    }
  }
}
