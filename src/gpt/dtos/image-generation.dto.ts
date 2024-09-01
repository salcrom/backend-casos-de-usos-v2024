import { IsOptional, IsString } from "class-validator";


export class ImagenGenerationDto {

    @IsString()
    readonly prompt: string;

    @IsString()
    @IsOptional()
    readonly originalImage?: string;

    @IsString()
    @IsOptional()
    readonly maskImage?: string;

}
