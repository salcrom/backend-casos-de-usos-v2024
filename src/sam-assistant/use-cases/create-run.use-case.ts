import OpenAI from "openai";


interface Options {
    threadId: string;
    assitantId?: string;
}

export const createRunUseCase = async( openai: OpenAI, options: Options ) => {

    const { threadId, assitantId = 'asst_sEGl3n9J8oppjTuJRmWimqyP' } = options;

    const run = await openai.beta.threads.runs.create(threadId,{
        assistant_id: assitantId,
        // instructions; // OJO! Sobre esccribe el asistente
    });
    console.log({ run });

    return run;
}
