import z from "zod";
import { apiRequest } from "../utils/api";
import type { APIBoolResponse } from "./common";

export type EpreuveStatut = 1 | 2 | 3 | 4 | 5;

export const EpreuveStatutNom: Record<EpreuveStatut, string> = {
    1: "Matériel non imprimé",
    2: "Matériel imprimé",
    3: "En attente de dépôt",
    4: "Dépôt complet",
    5: "Notes exportées"
};

// --- Schémas ---
export const EpreuveSchema = z.object({
    session: z.number().int().positive(),
    code: z.string(),
    nom: z.string(),
    statut: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    salles: z.array(z.string()),
    date: z.number().int().positive(), // timestamp en secondes depuis epoch
    duree: z.number().int().positive(), // durée en minutes
    copies: z.number().int().nonnegative().optional(), // nombre de copies déposées
    inscrits: z.number().int().positive().optional(), // nombre total de copies attendues
    incidents: z.number().int().nonnegative().optional() // nombre d'incidents de lecture
});

export const ListEpreuvesSchema = z.object({
    epreuvesAvenir: z.array(EpreuveSchema),
    epreuvesPassees: z.array(EpreuveSchema)
});

export const UpdateEpreuveSchema = EpreuveSchema.pick({ nom: true, salles: true, date: true, duree: true }).partial();

// --- Types ---
export type APIEpreuve = z.infer<typeof EpreuveSchema>;
export type APIUpdateEpreuve = z.infer<typeof UpdateEpreuveSchema>;
export type APIListEpreuves = z.infer<typeof ListEpreuvesSchema>;

// --- Endpoints API ---
export const getEpreuves = (sessionId: number) => {
    return apiRequest<null, APIListEpreuves>('GET', `/sessions/${sessionId}/epreuves`);
}

export const updateEpreuve = (sessionId: number, epreuveCode: string, updateData: APIUpdateEpreuve) => {
    return apiRequest<APIUpdateEpreuve, APIBoolResponse>('PATCH', `/sessions/${sessionId}/epreuves/${epreuveCode}`, updateData, UpdateEpreuveSchema);
}

export const getEpreuve = (sessionId: number, epreuveCode: string) => {
    return apiRequest<null, APIEpreuve>('GET', `/sessions/${sessionId}/epreuves/${epreuveCode}`);
}

/** Établit une connexion SSE pour suivre la progression d'un dépôt */
export const getDepotProgression = (sessionId: number, epreuveCode: string, depotId: number) => {
    return apiRequest<null, null>('GET', `/sessions/${sessionId}/epreuves/${epreuveCode}/depots/${depotId}/progression`);
}