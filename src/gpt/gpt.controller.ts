import { Body, Controller, FileTypeValidator, Get, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer'

import { GptService } from './gpt.service';
import { AudioToTextDto, ImagenGenerationDto, ImageVariationDto, OrthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';


@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}


  @Post('orthography-check')
  orthographyCheck(
    @Body() orthographyDto: OrthographyDto,
  ){
    return this.gptService.orthographyCheck(orthographyDto)
  }

  @Post('pros-cons-discusser')
  prosConsDicusser(
    @Body() prosConsDicusserDto: ProsConsDiscusserDto,
  ){
    return this.gptService.prosConsDiscusser(prosConsDicusserDto)
  }

  @Post('pros-cons-discusser-stream')
  async prosConsDicusserStream(
    @Body() prosConsDicusserDto: ProsConsDiscusserDto,
    @Res() res: Response,
  ){
    const stream = await this.gptService.prosConsDiscusserStream(prosConsDicusserDto);

    res.setHeader('Content-Type', 'application/json');
    res.status( HttpStatus.OK );

    for await( const chunk of stream ){
      const piece = chunk.choices[0].delta.content || '';
      // console.log(piece)
      res.write(piece);
    }

    res.end();
  }

  @Post('translate')
  async translate(
    @Body() translateDto: TranslateDto,
  ){
    return this.gptService.translateText(translateDto)
  }

  @Post('text-to-audio')
  async textToAudio(
    @Body() textToAudioDto: TextToAudioDto,
    @Res() res: Response,
  ){
    const filePath = await this.gptService.textToAudio(textToAudioDto);
    res.setHeader('Content-Type','audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Get('text-to-audio/:fileId')
  async textToAudioGetter(
    @Res() res: Response,
    @Param('fileId') fileId: string,
  ){
    const filePath = await this.gptService.textToAudioGetter(fileId);
    
    res.setHeader('Content-Type','audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Post('audio-to-text')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './generated/uploads',
        filename: (req, file, callback) => {
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${ new Date().getTime() }.${ fileExtension }`;
          return callback(null, fileName);
        }
      })
    })
  )
  async audioToText(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1024 * 5, message: 'File is bigger than 5 Mb '}),
          new FileTypeValidator({ fileType: 'audio/*' })
        ]
      })
    ) file: Express.Multer.File,
    @Body('prompt') audioToTextDto: AudioToTextDto,
  ){

    return this.gptService.audioToText(file, audioToTextDto);
  }

  @Post('image-generation')
  async imageGeneration(
    @Body() imageGenerationDto: ImagenGenerationDto,
  ){
    return await this.gptService.imageGeneration( imageGenerationDto )
  }
  
  @Get('image-generation/:fileName')
  async getGeneratedImage(
    @Res() res: Response,
    @Param('fileName') fileName: string,
  ){
    const filePath = await this.gptService.getGeneratedImage(fileName);
    
    res.setHeader('Content-type','image/png');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Post('image-variation')
  async imageVariation(
    @Body() imageVariationDto: ImageVariationDto,
  ){
    return await this.gptService.generateImageVariation( imageVariationDto )
  }
}
