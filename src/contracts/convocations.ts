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

export const ConvocationsSupplementairesMapSchema = z.record(z.string(), z.array(ConvocationSchema));

export const UpdateConvocationSchema = z.object({
    rang: z.number().int().positive().optional(),
    note_quart: z.number().int().positive().optional(),
    code_salle: z.string().optional()
});

// --- Types ---
export type APIConvocation = z.infer<typeof ConvocationSchema>;
export type APIUpdateConvocation = z.infer<typeof UpdateConvocationSchema>;
export type APIListeConvocations = z.infer<typeof ListConvocationsSchema>;
export type APIConvocationsSupplementairesMap = z.infer<typeof ConvocationsSupplementairesMapSchema>;

// --- Endpoints API ---
export const getConvocations = (sessionId: number, epreuveCode: string) => {
    return apiRequest<null, APIListeConvocations>('GET', `/sessions/${sessionId}/epreuves/${epreuveCode}/convocations`);
}

export const getConvocationsSupplementaires = (sessionId: number, epreuveCode: string) => {
    return apiRequest<null, APIConvocationsSupplementairesMap>('GET', `/sessions/${sessionId}/epreuves/${epreuveCode}/convocations/supplementaires`);
}

export const deleteConvocations = (sessionId: number, epreuveCode: string, codesAnonymats: string[]) => {
    return apiRequest<{ codesAnonymats: string[] }, APIBoolResponse>('DELETE', `/sessions/${sessionId}/epreuves/${epreuveCode}/convocations`, { codesAnonymats });
}

export const patchConvocation = (sessionId: number, epreuveCode: string, codeAnonymat: string, data: APIUpdateConvocation) => {
    return apiRequest<APIUpdateConvocation, APIUpdateConvocation>('PATCH', `/sessions/${sessionId}/epreuves/${epreuveCode}/convocations/${codeAnonymat}`, data);
}

export const patchConvocationSupplementaire = (sessionId: number, epreuveCode: string, codeAnonymat: string, data: { numeroEtudiant: number }) => {
    return apiRequest<{ numeroEtudiant: number }, APIBoolResponse>('POST', `/sessions/${sessionId}/epreuves/${epreuveCode}/convocations/supplementaires/${codeAnonymat}`, data);
}

export const postConvocationPresents = (sessionId: number, epreuveCode: string, nbPresents: number) => {
    return apiRequest<{ nbPresents: number }, APIBoolResponse>('POST', `/sessions/${sessionId}/epreuves/${epreuveCode}/convocations/presents`, { nbPresents });
}

export const postConvocationsTransfert = (sessionId: number, epreuveCode: string, data: { sallesDepart?: string[], codesAnonymats?: string[], salleTransfert: string }) => {
    return apiRequest<{ sallesDepart?: string[], codesAnonymats?: string[], salleTransfert: string }, APIBoolResponse>('POST', `/sessions/${sessionId}/epreuves/${epreuveCode}/convocations/transfert`, data);
}