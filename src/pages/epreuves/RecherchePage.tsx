import {useEffect, useState, type ReactElement } from 'react';
import SearchBar from '../../components/SearchBar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Alert, Chip, Snackbar } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getRechercheHeure, getRechercheSalle, getRechercheSalleHeure } from '../../contracts/recherche';
import type { APIEpreuve } from '../../contracts/epreuves';

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

    async function fetchData() {
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

            setResultats(Array.isArray(response.data) ? response.data : [response.data]);

        } catch (e) {
            console.error(e);
            setErreur("Erreur serveur");
        }
    }

    useEffect(() => {
        if (sessionId === undefined || type === undefined || value1 === undefined) {
            setErreur("Paramètres de recherche manquants");
            return ;
        }

        fetchData();
    }, [sessionId, type, value1, value2]);

    return (
        <>
            <Stack gap={2} m={4} alignItems={'center'} boxSizing={'border-box'}>
                <SearchBar sessionId={+sessionId!} />

                <Stack direction="column" alignItems="flex-start" spacing={2} mt={4}>

                    {/* Affichage du titre du résultat de la recherche */}
                    <Typography variant="h4" fontWeight={'bold'}>
                        Résultat de la recherche : "{value2 ? `${type}=${value1} et ${value2}` : `${type}=${value1}`}"
                    </Typography>


                    {/* Affichage des différents types de tri possibles */}
                    <Stack direction="row" spacing={2} mt={2}>
                        <Chip label={`Tous (${resultats.length})`} color="primary" />
                        <Chip label="Non imprimé" color="primary" />
                        <Chip label="Imprimé" color="primary" />
                    </Stack>

                    {/* Affichage des résultats de la recherche (WIP) */}
                </Stack>

                {erreur && (
                    <Snackbar
                        open={true}
                        autoHideDuration={6000}
                        onClose={() => setErreur(null)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert severity="error">
                            {erreur}
                        </Alert>
                    </Snackbar>
                )}
            </Stack>
        </>
    )
}