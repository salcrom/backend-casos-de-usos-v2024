import * as path from "path";
import * as fs  from "fs";
import { Injectable, NotFoundException } from '@nestjs/common';

import OpenAI from 'openai';

import { audioToTextUseCase, imageGenerationUseCase, imageVariationUseCase, orthographyCheckUseCase, prosConsDiscusserStreamUseCase, prosConsDiscusserUseCase, textToAudioUseCase, translateUseCase } from './use-case';
import { AudioToTextDto, ImagenGenerationDto, ImageVariationDto, OrthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';

@Injectable()
export class GptService {

    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })

    // Solo va a llamar casos de uso

    async orthographyCheck(orthographyDto: OrthographyDto){
        return await orthographyCheckUseCase( this.openai, {
            prompt: orthographyDto.prompt
        })
    }

    async prosConsDiscusser({ prompt }: ProsConsDiscusserDto){
        return await prosConsDiscusserUseCase(this.openai, { prompt })
    }
    
    async prosConsDiscusserStream({ prompt }: ProsConsDiscusserDto){
        return await prosConsDiscusserStreamUseCase(this.openai, { prompt })
    }

    async translateText({ prompt, lang }: TranslateDto){
        return await translateUseCase(this.openai, { prompt, lang })
    }
    
    async textToAudio({ prompt, voice }: TextToAudioDto){
        return await textToAudioUseCase(this.openai, { prompt, voice })
    }

    async textToAudioGetter( fileId: string ){

        const filePath = path.resolve(
            __dirname ,
            '../../generated/audios/',
            `${fileId}.mp3`
        );

        const wasFound = fs.existsSync( filePath );

        if( !wasFound ) throw new NotFoundException(`File ${ fileId } not found`);

        return filePath;
    }

    async audioToText(
        audioFile: Express.Multer.File,
        audioToTextDto: AudioToTextDto
    ){
        const { prompt } = audioToTextDto;

        return await audioToTextUseCase( this.openai, { audioFile, prompt });
    }

    async imageGeneration( imageGenerationDto: ImagenGenerationDto ){
        return await imageGenerationUseCase( this.openai, { ...imageGenerationDto } );
    }

    async getGeneratedImage( fileName: string ){
        
        const filePath = path.resolve(
            './',
            './generated/images/',
            fileName
        );

        const exists = fs.existsSync( filePath );

        if( !exists ) throw new NotFoundException('File not found');

        return filePath;
    }

    async generateImageVariation( { baseImage }:ImageVariationDto ) {
        return imageVariationUseCase( this.openai, { baseImage } );
    }
}
