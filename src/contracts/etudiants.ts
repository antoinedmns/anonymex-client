import { z } from "zod";
import { apiRequest } from "../utils/api";

// --- Schémas ---
export const EtudiantSchema = z.object({
    numeroEtudiant: z.number().int().positive(),
    nom: z.string(),
    prenom: z.string()
});

export const NewEtudiantSchema = EtudiantSchema;

export const UpdateEtudiantSchema = EtudiantSchema.pick({ nom: true, prenom: true }).partial();

// --- Types ---
export type APIEtudiant = z.infer<typeof EtudiantSchema>;
export type APINewEtudiant = z.infer<typeof NewEtudiantSchema>;
export type APIUpdateEtudiant = z.infer<typeof UpdateEtudiantSchema>;

// --- Endpoint API ---
export const createEtudiant = (newEtudiant: APINewEtudiant) => {
    return apiRequest<APINewEtudiant, APIEtudiant>('POST', '/etudiants/', newEtudiant, NewEtudiantSchema);
}

export const updateEtudiant = (numero: number, updateData: APIUpdateEtudiant) => {
    return apiRequest<APIUpdateEtudiant, APIEtudiant>('PATCH', `/etudiants/${numero}`, updateData, UpdateEtudiantSchema);
}