import { z } from "zod";
import { apiRequest } from "../utils/api";

// --- Schémas ---
export const IncidentSchema = z.object({
    idIncident: z.number().int().positive(),
    idSession: z.number().int().positive(),
    codeEpreuve: z.string(),
    titre: z.string(),
    details: z.string(),
    codeAnonymat: z.string().optional(),
    noteQuart: z.number().int().positive().optional(),
});

export const ListIncidentsSchema = z.object({
    incidents: z.array(IncidentSchema.pick({ idIncident: true, titre: true, details: true }))
});

export const PartielIncidentSchema = IncidentSchema.pick({ idIncident: true, codeAnonymat: true, noteQuart: true });

// --- Types ---
export type APIIncident = z.infer<typeof IncidentSchema>;
export type APIListIncidents = z.infer<typeof ListIncidentsSchema>;
export type APIPartielIncident = z.infer<typeof PartielIncidentSchema>;

export interface APIReponseCorrectionIncident { success: boolean, message?: string, incidents?: APIIncident[], suggestions?: string[] }

export const getIncident = (sessionId: number, epreuveCode: string, incidentId: number) => {
    return apiRequest<null, APIIncident>('GET', `/sessions/${sessionId}/epreuves/${epreuveCode}/incidents/${incidentId}`);
}

export const getIncidents = (sessionId: number, epreuveCode: string) => {
    return apiRequest<null, APIListIncidents>('GET', `/sessions/${sessionId}/epreuves/${epreuveCode}/incidents`);
}

export const corrigerIncident = (sessionId: number, epreuveCode: string, idIncident: number, codeAnonymat: string, noteQuart: number) => {
    return apiRequest<{ codeAnonymat: string, noteQuart: number }, APIReponseCorrectionIncident>('POST', `/sessions/${sessionId}/epreuves/${epreuveCode}/incidents/${idIncident}`, { codeAnonymat, noteQuart });
}