import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter';
import { fileNamer } from './helpers/fileNamer.helper';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}
  @Get('products/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getstaticProductImage(imageName);
    res.sendFile(path);
  }
  @Post('products')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './files/uploads',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Make sure file is an image');
    const secureUrl = `${this.configService.get('HOST_API')}/files/products/${
      file.filename
    }`;
    return { secureUrl };
  }
}
