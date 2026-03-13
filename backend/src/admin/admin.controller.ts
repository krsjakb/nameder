import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  login(@Body() body: { password: string }) {
    const VALID_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    if (body.password === VALID_PASSWORD) {
      return { token: process.env.ADMIN_SECRET || 'admin-secret-token' };
    }
    return { error: 'Invalid password' };
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  getStats() {
    return this.adminService.getStats();
  }

  @Get('sessions')
  @UseGuards(AdminGuard)
  getSessions(@Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.adminService.getSessions(Number(limit), Number(offset));
  }

  @Get('names/top')
  @UseGuards(AdminGuard)
  getTopNames(@Query('limit') limit = 20) {
    return this.adminService.getTopNames(Number(limit));
  }
}
