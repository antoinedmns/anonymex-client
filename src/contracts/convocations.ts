import { z } from "zod";
import { apiRequest } from "../utils/api";
import type { APIBoolResponse } from "./common";

// --- Schémas ---
export const ConvocationSchema = z.object({
    idSession: z.number().int().positive(),
    codeEpreuve: z.string(),
    numeroEtudiant: z.number().int().positive().optional(),
    rang: z.number().int().positive().optional(),
    codeAnonymat: z.string(),
    noteQuart: z.number().int().positive().optional(),
    codeSalle: z.string()
});

export const ListConvocationsSchema = z.object({
    convocations: z.array(ConvocationSchema)
});

export const UpdateConvocationSchema = ConvocationSchema.pick({ rang: true, noteQuart: true, codeSalle: true }).partial();

// --- Types ---
export type APIConvocation = z.infer<typeof ConvocationSchema>;
export type APIUpdateConvocation = z.infer<typeof UpdateConvocationSchema>;
export type APIListeConvocations = z.infer<typeof ListConvocationsSchema>;

// --- Endpoints API ---
export const getConvocations = (sessionId: number, epreuveCode: string) => {
    return apiRequest<null, APIListeConvocations>('GET', `/sessions/${sessionId}/epreuves/${epreuveCode}/convocations`);
}

export const deleteConvocations = (sessionId: number, epreuveCode: string, codesAnonymats: string[]) => {
    return apiRequest<{ codesAnonymats: string[] }, APIBoolResponse>('DELETE', `/sessions/${sessionId}/epreuves/${epreuveCode}/convocations`, { codesAnonymats });
}

export const patchConvocation = (sessionId: number, epreuveCode: string, codeAnonymat: string, data: APIUpdateConvocation) => {
    return apiRequest<APIUpdateConvocation, APIUpdateConvocation>('PATCH', `/sessions/${sessionId}/epreuves/${epreuveCode}/convocations/${codeAnonymat}`, data);
}

export const postConvocationPresents = (sessionId: number, epreuveCode: string, nbPresents: number) => {
    return apiRequest<{nbPresents: number}, APIBoolResponse>('POST', `/sessions/${sessionId}/epreuves/${epreuveCode}/presents`, { nbPresents });
}