import { z } from "zod";
import { apiRequest } from "../utils/api";

export type RechercheResultatType = 0 | 1 | 2 | 3 | 4 | 5;

export const TypeRecherche: Record<RechercheResultatType, string> = {
    0: "UE",
    1: "Salle",
    2: "Heure",
    3: "SalleHeure",
    4: "Action",
    5: "Etudiant"
}

// --- Schémas ---
const BaseRechercheSchema = z.object({
    type: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
});

export const RechercheUESchema = BaseRechercheSchema.extend({
    type: z.literal(0),
    code: z.string()
});

export const RechercheSalleSchema = BaseRechercheSchema.extend({
    type: z.literal(1),
    codeSalle: z.string()
});

export const RechercheHeureSchema = BaseRechercheSchema.extend({
    type: z.literal(2),
    horodatage: z.string()
});

export const RechercheSalleHeureSchema = BaseRechercheSchema.extend({
    type: z.literal(3),
    codeSalle: z.string(),
    horodatage: z.string()
});

export const RechercheActionSchema = BaseRechercheSchema.extend({
    type: z.literal(4),
    action: z.number().int()
});

export const RechercheEtudiantSchema = BaseRechercheSchema.extend({
    type: z.literal(5),
    numero: z.number().int()
});

export const ListRechercheSchema = z.object({
    resultats: z.array(
        z.discriminatedUnion("type", [
            RechercheUESchema,
            RechercheSalleSchema,
            RechercheHeureSchema,
            RechercheSalleHeureSchema,
            RechercheActionSchema,
            RechercheEtudiantSchema
        ])
    )
});

// --- Types ---
export type APIRechercheUE = z.infer<typeof RechercheUESchema>;
export type APIRechercheSalle = z.infer<typeof RechercheSalleSchema>;
export type APIRechercheHeure = z.infer<typeof RechercheHeureSchema>;
export type APIRechercheSalleHeure = z.infer<typeof RechercheSalleHeureSchema>;
export type APIRechercheAction = z.infer<typeof RechercheActionSchema>;
export type APIRechercheEtudiant = z.infer<typeof RechercheEtudiantSchema>;
export type APIListRecherche = z.infer<typeof ListRechercheSchema>;

export type APIRechercheReponse = APIRechercheUE | APIRechercheSalle | APIRechercheHeure | APIRechercheSalleHeure | APIRechercheAction | APIRechercheEtudiant;

// --- Endpoint API ---
export const getRecherche = (sessionId: number, query: string) => {
    const q = encodeURIComponent(query);

    return apiRequest<null, APIListRecherche>(
        'GET', 
        `/session/${sessionId}/recherche?q=${q}`
    );
}