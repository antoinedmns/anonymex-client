import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getEpreuves, type APIEpreuve, type APIListEpreuves } from '../contracts/epreuves';

const EMPTY_EPREUVES: APIListEpreuves = {
    epreuvesAvenir: [],
    epreuvesPassees: []
};

interface EpreuvesCacheContexte {
    sessionId: number;
    epreuves: APIListEpreuves;
    estChargement: boolean;
    erreurChargement: string | null;
    chargerEpreuves: (force?: boolean) => Promise<void>;
    getEpreuveByCode: (code: string) => APIEpreuve | undefined;
    upsertEpreuve: (epreuve: APIEpreuve) => void;
    patchEpreuve: (epreuveCode: string, patch: Partial<APIEpreuve>) => void;
    incrementEpreuveIncidents: (epreuveCode: string, delta: number) => void;
    remplacerEpreuves: (epreuves: APIListEpreuves) => void;
    viderCache: () => void;
}

const EpreuvesCacheContext = createContext<EpreuvesCacheContexte | undefined>(undefined);

function choisirGroupe(epreuve: APIEpreuve): 'epreuvesAvenir' | 'epreuvesPassees' {
    return epreuve.date >= Date.now() ? 'epreuvesAvenir' : 'epreuvesPassees';
}

function remplacerDansListe(liste: APIEpreuve[], epreuve: APIEpreuve) {
    const index = liste.findIndex((item) => item.code === epreuve.code);
    if (index === -1) return null;

    const copie = [...liste];
    copie[index] = epreuve;
    return copie;
}

function upsertDansCache(cache: APIListEpreuves, epreuve: APIEpreuve): APIListEpreuves {
    const futurMaj = remplacerDansListe(cache.epreuvesAvenir, epreuve);
    if (futurMaj !== null) {
        return { ...cache, epreuvesAvenir: futurMaj };
    }

    const passeMaj = remplacerDansListe(cache.epreuvesPassees, epreuve);
    if (passeMaj !== null) {
        return { ...cache, epreuvesPassees: passeMaj };
    }

    const groupe = choisirGroupe(epreuve);
    return {
        ...cache,
        [groupe]: [...cache[groupe], epreuve]
    };
}

export function EpreuvesCacheProvider({ sessionId, children }: { sessionId: number; children: ReactNode }) {
    const [epreuves, setEpreuves] = useState<APIListEpreuves>(EMPTY_EPREUVES);
    const [estChargement, setEstChargement] = useState(false);
    const [erreurChargement, setErreurChargement] = useState<string | null>(null);

    const viderCache = useCallback(() => {
        setEpreuves(EMPTY_EPREUVES);
    }, []);

    const remplacerEpreuves = useCallback((nouvellesEpreuves: APIListEpreuves) => {
        setEpreuves(nouvellesEpreuves);
    }, []);

    const chargerEpreuves = useCallback(async (force = false) => {
        if (!force && (epreuves.epreuvesAvenir.length > 0 || epreuves.epreuvesPassees.length > 0)) {
            return;
        }

        setEstChargement(true);
        setErreurChargement(null);
        const reponse = await getEpreuves(sessionId);
        if (reponse.status === 200 && reponse.data) {
            setEpreuves(reponse.data);
        } else {
            setErreurChargement(reponse.error ?? 'Erreur inconnue');
        }
        setEstChargement(false);
    }, [epreuves.epreuvesAvenir.length, epreuves.epreuvesPassees.length, sessionId]);

    // recuperer une epreuve par son code
    const getEpreuveByCode = useCallback((code: string) => {
        return epreuves.epreuvesAvenir.find((epreuve) => epreuve.code === code)
            ?? epreuves.epreuvesPassees.find((epreuve) => epreuve.code === code);
    }, [epreuves.epreuvesAvenir, epreuves.epreuvesPassees]);

    const upsertEpreuve = useCallback((epreuve: APIEpreuve) => {
        setEpreuves((actuelles) => upsertDansCache(actuelles, epreuve));
    }, []);

    // mettre à jour une epreuve par son code
    const patchEpreuve = useCallback((epreuveCode: string, patch: Partial<APIEpreuve>) => {
        setEpreuves((actuelles) => {
            const epreuveActuelle = actuelles.epreuvesAvenir.find((item) => item.code === epreuveCode)
                ?? actuelles.epreuvesPassees.find((item) => item.code === epreuveCode);

            if (!epreuveActuelle) return actuelles;

            return upsertDansCache(actuelles, { ...epreuveActuelle, ...patch });
        });
    }, []);

    const incrementEpreuveIncidents = useCallback((epreuveCode: string, delta: number) => {
        if (delta === 0) return;

        setEpreuves((actuelles) => {
            const epreuveActuelle = actuelles.epreuvesAvenir.find((item) => item.code === epreuveCode)
                ?? actuelles.epreuvesPassees.find((item) => item.code === epreuveCode);

            if (!epreuveActuelle) return actuelles;

            const incidentsActuels = epreuveActuelle.incidents ?? 0;
            const incidentsMaj = Math.max(0, incidentsActuels + delta);

            return upsertDansCache(actuelles, { ...epreuveActuelle, incidents: incidentsMaj });
        });
    }, []);

    // Réinitialiser le cache à chaque changement de session
    useEffect(() => {
        setEpreuves(EMPTY_EPREUVES);
        setErreurChargement(null);
    }, [sessionId]);

    // Charger les épreuves à l'initialisation ou au changement de session
    useEffect(() => {
        void chargerEpreuves();
    }, [chargerEpreuves]);

    const valeur = useMemo(() => ({
        sessionId,
        epreuves,
        estChargement,
        erreurChargement,
        chargerEpreuves,
        getEpreuveByCode,
        upsertEpreuve,
        patchEpreuve,
        incrementEpreuveIncidents,
        remplacerEpreuves,
        viderCache
    }), [sessionId, epreuves, estChargement, erreurChargement, chargerEpreuves, getEpreuveByCode, upsertEpreuve, patchEpreuve, incrementEpreuveIncidents, remplacerEpreuves, viderCache]);

    return (
        <EpreuvesCacheContext.Provider value={valeur}>
            {children}
        </EpreuvesCacheContext.Provider>
    );
}

export function useEpreuvesCache() {
    const contexte = useContext(EpreuvesCacheContext);

    if (!contexte) {
        throw new Error('useEpreuvesCache doit être utilisé dans EpreuvesCacheProvider');
    }

    return contexte;
}
