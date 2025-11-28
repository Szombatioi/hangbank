import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './entities/createUser.dto';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user-dto';
import { ChangePasswordDto } from './dto/change-password-dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/me")
  @UseGuards(JwtAuthGuard)
  getByToken(@Req() req){
    return this.userService.findByToken(req.user);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  modifyUser(@Req() req, @Body() dto: UpdateUserDto){
    return this.userService.modifyUser(req.user, dto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Put("change-password")
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req, @Body() data: ChangePasswordDto){
    return await this.userService.changePassword(req.user, data);
  }
}
