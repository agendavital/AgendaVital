import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { UpdateRolePermissionsDto } from '../dto/update-role-permissions.dto';
import { AccessControlService } from '../services/access-control.service';

@Controller('access-control')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Get('roles')
  getRoleMatrix() {
    return this.accessControlService.getRoleMatrix();
  }

  @Put('roles/:roleId/permissions')
  updateRolePermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() body: UpdateRolePermissionsDto,
  ) {
    return this.accessControlService.updateRolePermissions(
      roleId,
      body.permissions,
    );
  }
}
