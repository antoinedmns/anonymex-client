import { Alert, Box, Button, Divider, Snackbar, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { type APIEpreuve } from '../../../../contracts/epreuves';
import AnonymatCard from './composantsPresence/CodeSupplementaireCarte';
import { getConvocationsSupplementaires, patchConvocationSupplementaire as associerConvocationSupplementaire, postConvocationPresents, type APIConvocationsSupplementairesMap } from '../../../../contracts/convocations';
import React from 'react';
import { Check, Update } from '@mui/icons-material';
import { useEpreuvesCache } from '../../../../contexts/EpreuvesCacheContext';

type MenuPresenceProps = {
    epreuve: APIEpreuve;
    salleDefaultNumb: number;
}

export default function MenuPresence({ epreuve, salleDefaultNumb }: MenuPresenceProps) {
    const { patchEpreuve } = useEpreuvesCache();

    // Initialisation des convocations supplémentaires pour l'épreuve
    const [listeConvoc, setListeConvoc] = React.useState<APIConvocationsSupplementairesMap>({});

    // État de chargement pour les convocations supplémentaires
    const [loadingSupplementaires, setLoadingSupplementaires] = React.useState(false);

    // Valeur de l'input pour le nombre de présents pour l'épreuve
    const [inputNbPresents, setInputNbPresents] = React.useState<string>(epreuve.nbPresents === undefined ? '' : String(epreuve.nbPresents));

    // Nombre de présents actuellement enregistré pour l'épreuve (null si non renseigné)
    const [nbPresents, setNbPresents] = React.useState<number | null>(epreuve.nbPresents ?? null);

    // Indique si l'utilisateur est en train de modifier le nombre de présents (true si l'input est affiché, false si on affiche simplement le nombre)
    const [isEditingPresence, setIsEditingPresence] = React.useState(epreuve.nbPresents === undefined);

    // Gestion des erreurs et succès pour la mise à jour du nombre de présents et l'association des codes d'anonymat
    const [nbPresentError, setNbPresentError] = React.useState<string | null>(null);
    const [successMajPresents, setSuccessMajPresents] = React.useState<boolean | null>(null);
    const [anonymatErrors, setAnonymatErrors] = React.useState<string | null>(null);

    const [salleTabs, setSalleTabs] = React.useState(() => {
        const maxIndex = Math.max(0, epreuve.salles.length - 1);
        return Math.min(Math.max(salleDefaultNumb || 0, 0), maxIndex);
    });

    const hasSalles = epreuve.salles.length > 0;

    React.useEffect(() => {
        const nextPresence = epreuve.nbPresents ?? null;

        setNbPresents(nextPresence);
        setInputNbPresents(nextPresence === null ? '' : String(nextPresence));
        setIsEditingPresence(nextPresence === null);
        setNbPresentError(null);
        setSuccessMajPresents(null);
    }, [epreuve.session, epreuve.code, epreuve.nbPresents]);

    React.useEffect(() => {
        const maxIndex = Math.max(0, epreuve.salles.length - 1);
        setSalleTabs((currentValue) => Math.min(Math.max(currentValue, 0), maxIndex));
    }, [epreuve.salles.length]);

    React.useEffect(() => {
        let active = true;

        async function fetchCodesAnonymatSupplementaires() {
            setLoadingSupplementaires(true);

            try {
                const response = await getConvocationsSupplementaires(epreuve.session, epreuve.code);
                if (!active) return;

                if (response.status !== 200 || !response.data) {
                    setListeConvoc({});
                    setAnonymatErrors("Impossible de charger les codes d'anonymat supplémentaires.");
                    return;
                }

                setListeConvoc(response.data);
            }
            catch {
                if (active) {
                    setListeConvoc({});
                    setAnonymatErrors("Une erreur inattendue est survenue lors du chargement des codes d'anonymat supplémentaires.");
                }
            }
            finally {
                if (active) setLoadingSupplementaires(false);
            }
        }

        void fetchCodesAnonymatSupplementaires();

        return () => {
            active = false;
        };
    }, [epreuve.session, epreuve.code]);

    async function handleConfirmPresence() {
        const nextValue = Number.parseInt(inputNbPresents, 10);

        setNbPresentError(null);
        setSuccessMajPresents(null);

        if (Number.isNaN(nextValue) || nextValue < 0) {
            setNbPresentError("Le nombre de présents doit être un entier supérieur ou égal à 0.");
            return;
        }

        try {
            const rep = await postConvocationPresents(epreuve.session, epreuve.code, nextValue);

            if (rep.status !== 200 || !rep.data || !rep.data.success) {
                setNbPresentError("La mise à jour du nombre de présents a échoué.");
                setSuccessMajPresents(false);
                return;
            }

            setNbPresents(nextValue);
            setInputNbPresents(String(nextValue));
            setIsEditingPresence(false);
            setNbPresentError(null);
            setSuccessMajPresents(true);
            patchEpreuve(epreuve.code, { nbPresents: nextValue });
        }
        catch (error) {
            console.error(error);
            setNbPresentError("Une erreur inattendue est survenue lors de la mise à jour.");
            setSuccessMajPresents(false);
        }
    }

    const handleChangeSalle = (_: React.SyntheticEvent, newValue: number) => {
        setSalleTabs(newValue);
    };

    async function handleAssociateSupplementaire(codeAnonymat: string, numeroEtudiant: number) {
        const response = await associerConvocationSupplementaire(epreuve.session, epreuve.code, codeAnonymat, { numeroEtudiant });

        if (response.status !== 200 || response.error || !response.data) {
            const message = response.error ?? "Impossible d'associer ce code d'anonymat.";
            setAnonymatErrors(message);
            throw new Error(message);
        }

        if (!response.data.success) {
            const message = "L'association a été refusée par le serveur.";
            setAnonymatErrors(message);
            throw new Error(message);
        }

        // On retire localement la convocation désormais associée.
        setListeConvoc((prev) => {
            const next: APIConvocationsSupplementairesMap = {};

            for (const [salle, convocations] of Object.entries(prev)) {
                next[salle] = convocations.filter((convoc) => convoc.codeAnonymat !== codeAnonymat);
            }

            return next;
        });

        setAnonymatErrors(null);
    }

    return (
        <>
            <Stack direction={"row"} spacing={4} justifyContent={'space-evenly'} alignItems={'stretch'} width={'100%'} padding={4}>
                {/* Partie gauche du menu de présence (Input et confirmation ) */}
                <Stack direction="column" spacing={2} alignItems="stretch" width={'32%'}>
                    <Box>
                        <Typography variant="h5" fontWeight={'bold'} mb={1}>
                            Présents
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={1}>
                            Renseignez le nombre d'étudiants présents lors de l'épreuve :
                        </Typography>
                    </Box>

                    {!isEditingPresence ? (
                        <Typography variant="h6" fontWeight={'bold'}>
                            {nbPresents === null ? 'Non renseigné' : nbPresents}
                        </Typography>
                    ) : (
                        <TextField
                            label="Nombre de présents"
                            type="number"
                            value={inputNbPresents}
                            onChange={(e) => setInputNbPresents(e.target.value)}
                            slotProps={{
                                htmlInput: {
                                    min: 0
                                }
                            }}
                            helperText={nbPresentError}
                            error={!!nbPresentError}
                        />
                    )}

                    {isEditingPresence ? (
                        <Button variant="contained" color="primary" onClick={handleConfirmPresence} startIcon={<Check />}>
                            {nbPresents === null ? 'Confirmer' : 'Valider la mise à jour'}
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                setInputNbPresents(nbPresents === null ? '' : String(nbPresents));
                                setIsEditingPresence(true);
                                setNbPresentError(null);
                            }}
                            startIcon={<Update />}
                        >
                            Mettre à jour
                        </Button>
                    )}
                </Stack>

                <Divider orientation="vertical" flexItem />

                <Stack direction="row" spacing={4} alignItems="stretch" width="100%">
                    <Stack direction="column" spacing={4} width="20%">
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={hasSalles ? salleTabs : false}
                            onChange={handleChangeSalle}
                            sx={{
                                borderRight: 1,
                                borderColor: 'divider',
                                maxHeight: 400,
                            }}
                        >
                            {epreuve.salles.map((salle, index) => (
                                <Tab
                                    key={salle}
                                    label={salle}
                                    value={index}
                                    id={`vertical-tab-${index}`}
                                    aria-controls={`vertical-tabpanel-${index}`}
                                />
                            ))}
                        </Tabs>
                    </Stack>

                    <Box sx={{ width: '100%', minWidth: 0 }}>
                        <Typography variant="h5" fontWeight="bold">
                            Codes d'anonymat supplémentaires
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={3}>
                            Associer chaque code d'anonymat supplémentaire attribué à un étudiant.
                        </Typography>

                        {!hasSalles ? (
                            <Alert severity="info" sx={{ width: '100%' }}>
                                Aucune salle n'est disponible pour cette épreuve.
                            </Alert>
                        ) : loadingSupplementaires ? (
                            <Alert severity="info" sx={{ width: '100%' }}>
                                Chargement des codes d'anonymat supplémentaires...
                            </Alert>
                        ) : (
                            epreuve.salles.map((salle, index) => {
                                const convocations = listeConvoc[salle] ?? [];

                                return (
                                    <Box
                                        key={salle}
                                        role="tabpanel"
                                        id={`vertical-tabpanel-${index}`}
                                        aria-labelledby={`vertical-tab-${index}`}
                                        sx={{
                                            display: salleTabs === index ? 'block' : 'none',
                                            width: '100%',
                                        }}
                                    >
                                        {convocations.length > 0 ? (
                                            <Stack
                                                direction="column"
                                                spacing={1.5}
                                                alignItems="stretch"
                                                width="100%"
                                                sx={{
                                                    maxHeight: 400,
                                                    minHeight: 0,
                                                    overflowY: 'auto',
                                                    overflowX: 'hidden',
                                                }}
                                                pr={1}
                                            >
                                                {convocations.map((convoc) => (
                                                    <AnonymatCard
                                                        key={`${convoc.codeAnonymat}-${convoc.idSession}`}
                                                        codeAnonymat={convoc.codeAnonymat}
                                                        numeroEtudiant={convoc.numeroEtudiant}
                                                        onAssociate={(numeroEtudiant) => handleAssociateSupplementaire(convoc.codeAnonymat, numeroEtudiant)}
                                                    />
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Alert severity="info" sx={{ width: '100%' }}>
                                                Aucun code d'anonymat supplémentaire pour la salle {salle}.
                                            </Alert>
                                        )}
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                </Stack>
            </Stack>

            {successMajPresents !== null && (
                <Snackbar open autoHideDuration={6000} onClose={() => setSuccessMajPresents(null)}>
                    <Alert severity={successMajPresents ? "success" : "error"} sx={{ width: '100%' }}>
                        {successMajPresents ? "Nombre de présents mis à jour avec succès !" : "Erreur lors de la mise à jour du nombre de présents."}
                    </Alert>
                </Snackbar>
            )
            }

            {
                anonymatErrors && (
                    <Snackbar open autoHideDuration={6000} onClose={() => setAnonymatErrors(null)}>
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {anonymatErrors}
                        </Alert>
                    </Snackbar>
                )
            }
        </>
    );
}