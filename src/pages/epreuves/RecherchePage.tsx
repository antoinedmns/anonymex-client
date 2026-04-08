import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import SearchBar from '../../components/SearchBar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Alert, Chip, Snackbar } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getRechercheEtudiant, getRechercheHeure, getRechercheSalle, getRechercheSalleHeure } from '../../contracts/recherche';
import { getEpreuve, type APIEpreuve } from '../../contracts/epreuves';
import { formatterDateEntiere } from '../../utils/dateUtils';
import { AssignmentTurnedIn, History, HourglassEmpty, Print, PrintDisabled, Public, Schedule, UploadFile } from '@mui/icons-material';
import { EpreuveCard } from './EpreuveCard';
import { EpreuveModal } from './epreuve-modal/EpreuveModal';
import { useModal } from '../../contexts/ModalContext';
import { useEpreuvesCache } from '../../contexts/EpreuvesCacheContext';

const STATUS = {
    NON_IMPRIME: 1,
    IMPRIME: 2,
    ATTENTE_DEPOT: 3,
    DEPOT_COMPLET: 4,
    NOTES_EXPORTEES: 5
} as const;

export default function RecherchePage(): ReactElement {

    //Paramètres de l'URL
    const { sessionId, type, value1, value2 } = useParams<{
        sessionId: string;
        type: string;
        value1: string;
        value2?: string;
    }>();

    // Erreur snackbar
    const [erreur, setErreur] = useState<string | null>(null);

    // Liste des épreuves de la recherche avec leurs détails complets
    const [epreuvesDetails, setEpreuvesDetails] = useState<APIEpreuve[]>([]);

    // Filtre d'affichage des épreuves
    const [filter, setFilter] = useState<'all' | 'avenir' | 'passe'>('all');

    // Sous filtre des épreuves
    const [subFilter, setSubFilter] = useState<number| null>(null);

    // Modal
    const { ouvrir } = useModal();
    const { getEpreuveByCode, upsertEpreuve } = useEpreuvesCache();

    // Ouvre le modal de l'épreuve cliquée
    const handleEpreuveClick = useCallback((epreuve: APIEpreuve) => {
        if (sessionId === undefined) return;
        ouvrir(<EpreuveModal codeEpreuve={epreuve.code} sessionId={sessionId} tab={"details"} />);
    }, [ouvrir, sessionId]);

    const fetchData = useCallback(async () => {
        if (!sessionId || !type || !value1) return;

        try {
            let response;

            switch (type) {
                case "salle":
                    response = await getRechercheSalle(+sessionId, value1);
                    break;

                case "heure":
                    response = await getRechercheHeure(+sessionId, value1);
                    break;

                case "salleheure":
                    if (!value2) {
                        setErreur("Paramètre manquant pour salle + heure");
                        return;
                    }
                    response = await getRechercheSalleHeure(+sessionId, value1, value2);
                    break;

                case "etudiant":
                    response = await getRechercheEtudiant(+sessionId, value1);
                    break;

                default:
                    setErreur("Type de recherche inconnu");
                    return;
            }

            if (response.status !== 200 || !response.data) {
                setErreur(response.error || "Erreur inconnue");
                return;
            }

            const resultatsTrouves = Array.isArray(response.data) ? response.data : [response.data];

            if (resultatsTrouves.length === 0) {
                setEpreuvesDetails([]);
                return;
            }

            const res_epreuve = await Promise.all(resultatsTrouves.map(async (epreuve) => {
                const epreuveCache = getEpreuveByCode(epreuve.code);
                if (epreuveCache) {
                    return { status: 200, data: epreuveCache };
                }

                return getEpreuve(+sessionId!, epreuve.code);
            }));

            if (res_epreuve.some(res => res.status !== 200 || !res.data)) {
                setErreur("Erreur lors de la récupération des détails des épreuves");
                return;
            } else if (res_epreuve.every(res => res.data)) {
                const details = res_epreuve.map(res => res.data!);
                details.forEach((epreuve) => upsertEpreuve(epreuve));
                setEpreuvesDetails(details);
            }


        } catch (e) {
            console.error(e);
            setErreur("Erreur serveur");
        }
    }, [getEpreuveByCode, sessionId, type, upsertEpreuve, value1, value2]);

    useEffect(() => {
        if (sessionId === undefined || type === undefined || value1 === undefined) {
            setErreur("Paramètres de recherche manquants");
            return;
        }

        void fetchData();
    }, [sessionId, type, value1]);

    const { epreuvesFiltrees, statutMap } = useMemo(() => {

        const map = new Map<number, number>();

        const res = epreuvesDetails.filter(epreuve => {

            map.set(epreuve.statut, (map.get(epreuve.statut) ?? 0) + 1);

            if (filter === 'avenir') {
                if (epreuve.statut !== STATUS.NON_IMPRIME && epreuve.statut !== STATUS.IMPRIME) return false;
            }

            if (filter === 'passe') {
                if (epreuve.statut !== STATUS.ATTENTE_DEPOT && epreuve.statut !== STATUS.DEPOT_COMPLET && epreuve.statut !== STATUS.NOTES_EXPORTEES) return false;
            }

            if (subFilter !== null && epreuve.statut !== subFilter) return false;

            return true;
        });

        return { epreuvesFiltrees: res, statutMap: map };

    }, [epreuvesDetails, filter, subFilter]);


    // Navigation pour revenir à la liste des épreuves de la session
    const navigate = useNavigate();

    const handleBackEpreuve = useCallback(() => {
        navigate(`/sessions/${sessionId}/epreuves`);
    }, [navigate, sessionId]);

    console.log("Résultats de la recherche filtrés :", epreuvesFiltrees);

    return (
        <>
            <Stack gap={2} m={4} alignItems={'center'} boxSizing={'border-box'}>
                <SearchBar sessionId={+sessionId!} handleBack={handleBackEpreuve} nomHandleBack={`Retour à la session ${sessionId}`} />


                <Stack direction="column" alignItems="flex-start" spacing={4} mt={4} width={'60%'}>

                    {/* Affichage du titre du résultat de la recherche */}
                    <Typography variant="h4" fontWeight={'bold'}>
                        Résultat de la recherche : "{value2 ? `${value1} et ${value2}` : type == 'heure' ? `${formatterDateEntiere(+value1!)}` : `${value1}`}"
                    </Typography>


                    {/* Affichage des différents types de tri possibles */}
                    <Stack direction="row" spacing={2}>

                        {/* Toutes les épreuves*/}
                        <Chip
                            icon={<Public />}
                            label={`Tous (${epreuvesDetails.length})`}
                            color={filter === 'all' ? 'primary' : 'default'}
                            onClick={() => {
                                setFilter('all');
                                setSubFilter(null);
                            }}
                        />

                        <Chip
                            icon={<Schedule />}
                            label={`À venir (${(statutMap.get(1) ?? 0) + (statutMap.get(2) ?? 0)})`}
                            color={filter === 'avenir' ? 'primary' : 'default'}
                            onClick={() => {
                                setFilter('avenir');
                                setSubFilter(null);
                            }}
                        />

                        <Chip
                            icon={<History />}
                            label={`Passées (${(statutMap.get(3) ?? 0) + (statutMap.get(4) ?? 0) + (statutMap.get(5) ?? 0)})`}
                            color={filter === 'passe' ? 'primary' : 'default'}
                            onClick={() => {
                                setFilter('passe');
                                setSubFilter(null);
                            }}
                        />

                        {/* Affichage des sous-filtres pour les épreuves à venir */}
                        {filter === 'avenir' && (
                            <Stack direction="row" spacing={2}>
                                <Chip
                                    icon={<PrintDisabled />}
                                    label={`Non imprimé (${statutMap.get(1) ?? 0})`}
                                    color={subFilter === 1 ? 'primary' : 'default'}
                                    onClick={() => setSubFilter(1)}
                                />
                                <Chip
                                    icon={<Print />}
                                    label={`Imprimé (${statutMap.get(2) ?? 0})`}
                                    color={subFilter === 2 ? 'primary' : 'default'}
                                    onClick={() => setSubFilter(2)}
                                />
                            </Stack>
                        )}

                        {filter === 'passe' && (
                            <Stack direction="row" spacing={2}>
                                <Chip icon={<HourglassEmpty />} label={`Attente (${statutMap.get(3) ?? 0})`} color={subFilter === 3 ? 'primary' : 'default'} onClick={() => setSubFilter(3)} />
                                <Chip icon={<UploadFile />} label={`Dépôt (${statutMap.get(4) ?? 0})`} color={subFilter === 4 ? 'primary' : 'default'} onClick={() => setSubFilter(4)} />
                                <Chip icon={<AssignmentTurnedIn />} label={`Notes (${statutMap.get(5) ?? 0})`} color={subFilter === 5 ? 'primary' : 'default'} onClick={() => setSubFilter(5)} />
                            </Stack>
                        )}

                    </Stack>

                    {/* Affichage des résultats de la recherche */}
                    <Stack width={'100%'} spacing={2}>
                        {epreuvesFiltrees.length === 0 ? (
                            <Alert severity="info" sx={{ width: '100%' }}>
                                Aucun résultat trouvé pour cette recherche.
                            </Alert>
                        ) : (
                            epreuvesFiltrees.map((epreuve) => (
                                <EpreuveCard
                                    key={epreuve.code + epreuve.date}
                                    epreuve={epreuve}
                                    onClick={handleEpreuveClick}
                                />
                            ))
                        )}
                    </Stack>
                </Stack>

                {erreur && (
                    <Snackbar
                        open={true}
                        autoHideDuration={10000}
                        onClose={() => setErreur(null)}
                    >
                        <Alert severity="error" variant='filled'>
                            Erreur: {erreur}
                        </Alert>
                    </Snackbar>
                )}
            </Stack>
        </>
    )
}