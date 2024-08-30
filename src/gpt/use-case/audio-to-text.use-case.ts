import * as fs from 'fs'

import OpenAI from "openai";

interface Options {
    prompt?: string;
    audioFile: Express.Multer.File
}

export const audioToTextUseCase = async( openAI: OpenAI, options: Options) => {
    const { prompt, audioFile } = options;
    
    // console.log({prompt, audioFile})

    const response = await openAI.audio.transcriptions.create({
        model: 'whisper-1',
        file: fs.createReadStream( audioFile.path ),
        prompt: prompt, // mismo idioma que el audio
        language: 'es',
        // response_format: 'vtt', // 'srt'
        response_format: 'verbose_json',
    })

    return response;
}
