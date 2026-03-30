import { useCallback, useEffect, useState, type ReactElement } from 'react';
import SearchBar from '../../components/SearchBar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Alert, Chip, Snackbar } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getRechercheHeure, getRechercheSalle, getRechercheSalleHeure } from '../../contracts/recherche';
import { getEpreuve, type APIEpreuve } from '../../contracts/epreuves';
import { formatterDateEntiere } from '../../utils/dateUtils';
import Check from '@mui/icons-material/Check';
import { DoDisturb, Public } from '@mui/icons-material';
import { EpreuveCard } from './EpreuveCard';
import { EpreuveModal } from './epreuve-modal/EpreuveModal';
import { useModal } from '../../contexts/ModalContext';
import { useEpreuvesCache } from '../../contexts/EpreuvesCacheContext';

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

    // Résultats de la recherche
    const [resultats, setResultats] = useState<APIEpreuve[]>([]);

    // Liste des épreuves de la recherche avec leurs détails complets
    const [epreuvesDetails, setEpreuvesDetails] = useState<APIEpreuve[]>([]);

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

                default:
                    setErreur("Type de recherche inconnu");
                    return;
            }

            if (response.status !== 200 || !response.data) {
                setErreur(response.error || "Erreur inconnue");
                return;
            }

            const resultatsTrouves = Array.isArray(response.data) ? response.data : [response.data];
            setResultats(resultatsTrouves);

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
    }, [fetchData, sessionId, type, value1]);


    // Navigation pour revenir à la liste des épreuves de la session
    const navigate = useNavigate();

    const handleBackEpreuve = useCallback(() => {
        navigate(`/sessions/${sessionId}/epreuves`);
    }, [navigate, sessionId]);

    console.log("Résultats de la recherche fetchData :", resultats);

    return (
        <>
            <Stack gap={2} m={4} alignItems={'center'} boxSizing={'border-box'}>
                <SearchBar sessionId={+sessionId!} handleBack={handleBackEpreuve} nomHandleBack={`Retour à la session ${sessionId}`} />;
                

                <Stack direction="column" alignItems="flex-start" spacing={4} mt={4}>

                    {/* Affichage du titre du résultat de la recherche */}
                    <Typography variant="h4" fontWeight={'bold'}>
                        Résultat de la recherche : "{value2 ? `${value1} et ${value2}` : type == 'heure' ? `${formatterDateEntiere(+value1!)}` : `${value1}`}"
                    </Typography>


                    {/* Affichage des différents types de tri possibles */}
                    <Stack direction="row" spacing={2}>
                        <Chip icon={<Public />} label={`Tous (${epreuvesDetails.length})`} color="primary" onClick={() => { }} />
                        <Chip icon={<DoDisturb />} label="Non imprimé (0)" color="default" onClick={() => { }} />
                        <Chip icon={<Check />} label="Imprimé (0)" color="default" onClick={() => { }} />
                    </Stack>

                    {/* Affichage des résultats de la recherche (WIP) */}
                    <Stack direction="column" spacing={2} width={'100%'}>
                        {epreuvesDetails.length === 0 ? (
                            <Typography variant="body1" color="textSecondary">
                                Aucun résultat trouvé pour cette recherche.
                            </Typography>
                        ) : (
                            epreuvesDetails.map((epreuve) => (
                                <EpreuveCard key={epreuve.code + epreuve.date} epreuve={epreuve} onClick={handleEpreuveClick} />
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