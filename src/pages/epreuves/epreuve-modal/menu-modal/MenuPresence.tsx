import { Alert, Box, Button, Divider, Snackbar, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { type APIEpreuve } from '../../../../contracts/epreuves';
import AnonymatCard from './composantsPresence/AnonymatCard';
import { getConvocationsSupplementaires, postConvocationPresents, type APIConvocationsSupplementairesMap, type APIListeConvocations } from '../../../../contracts/convocations';
import React from 'react';
import { Check, Update } from '@mui/icons-material';

type MenuPresenceProps = {
    epreuve: APIEpreuve;
}

export default function MenuPresence({ epreuve }: MenuPresenceProps) {

    // Liste des convocations supplémentaires, organisée par salle
    const [listeConvoc, setListeConvoc] = React.useState<APIConvocationsSupplementairesMap>();

    // Valeur de l'input pour le nombre de présents, initialisée à la valeur actuelle de l'épreuve ou à 0 si non renseignée
    const [inputNbPresents, setInputNbPresents] = React.useState<number>(epreuve.nbPresents || 0);

    // Gestion des erreurs pour le nombre de présents (négatif ou erreur API)
    const[nbPresentError, setNbPresentError] = React.useState<string | null>(null);

    // Snackbar de succès ou d'erreur pour la confirmation du nombre de présents
    const [successMajPresents, setSuccessMajPresents] = React.useState<boolean | null>(null);

    // UseState pour affichage du champ de saisie
    const [showInput, setShowInput] = React.useState(epreuve.nbPresents === undefined);

    function handleMajPresence(){
        setShowInput(true);
        epreuve.nbPresents = undefined;
    }

    async function handleConfirmPresence(){

        // On remet à zéro les erreurs à chaque confirmation
        setNbPresentError(null);
        setSuccessMajPresents(null);
        setShowInput(false);
        

        console.log("Nombre de présents à confirmer :", inputNbPresents);

        if (inputNbPresents < 0) {
            setNbPresentError("Le nombre de présents doit être >= 0.");
        }

        try {
            const rep = await postConvocationPresents(epreuve.session, epreuve.code, inputNbPresents);

            if (rep.status !== 200) {
                setNbPresentError("Impossible de contacter le serveur.");
                return;
            }

            if (!rep.data) {
                setNbPresentError("Réponse invalide du serveur.");
                return;
            }

            if (!rep.data.success) {
                setNbPresentError("La mise à jour a été refusée.");
                return;
            }

            // Mise à jour réussie.
            epreuve.nbPresents = inputNbPresents;
            console.log("Nombre de présents mis à jour avec succès :", inputNbPresents);
            setNbPresentError(null);
            setSuccessMajPresents(true);
        }
        catch (error) {
            console.error(error);
            setNbPresentError("Une erreur inattendue est survenue.");
        }
    }

    async function fetchCodesAnonymatSupplementaires() {
        const response = await getConvocationsSupplementaires(epreuve.session, epreuve.code);

        if (response.status !== 200 || !response.data) {
            console.error("Erreur lors de la récupération des codes d'anonymat supplémentaires :", response.status);
            return;
        } else {
            setListeConvoc(response.data ?? {});
            console.log("Codes d'anonymat supplémentaires récupérés :", (response.data));
        }
    }

    React.useEffect(() => {
        fetchCodesAnonymatSupplementaires();
    }, [epreuve.session, epreuve.code]);

    // Tabs

    // UseState pour la valeur de chaque salle de l'épreuve
    const [salleTabs, setsalleTabs] = React.useState(0);

    // Fonction pour gérer le changement de tab
    const handleChangeSalle = (_: React.SyntheticEvent, newValue: number) => {
        setsalleTabs(newValue);
    };


    const currentSalle = epreuve.salles[salleTabs];
    const convocations = listeConvoc?.[currentSalle] ?? [];


    return (
        <>
            <Stack direction="column" spacing={4} justifyContent={'space-evenly'} padding={4} width={"100%"}>

                <Stack direction="row" spacing={2} alignItems="stretch">
                    <Typography variant="h6" color="textSecondary" fontWeight={'regular'} alignSelf={'center'}>
                        Nombre d'étudiants présents pour l'épreuve {epreuve.code} :
                    </Typography>

                    {!showInput ? (
                        // Affichage du nombre de présents actuel si déjà renseigné
                        <Typography variant="h6" fontWeight={'bold'} alignSelf={'center'}>
                            {epreuve.nbPresents ? `${epreuve.nbPresents}` : " Non renseigné"}
                        </Typography>
                    ) :
                        // Sinon affichage du champ de saisie
                        <TextField
                            label="Nombre de présents"
                            type="number"
                            onChange={(e) => setInputNbPresents(Number(e.target.value))}
                            slotProps={{
                                htmlInput: {
                                    min: 0
                                }
                            }}
                            helperText={nbPresentError}
                            error={!!nbPresentError}
                        />
                    }
                    {epreuve.nbPresents === undefined && (
                        <Button variant="contained" color="primary" onClick={handleConfirmPresence} startIcon={<Check />}>
                            Confirmer
                        </Button>
                    )}

                    {epreuve.nbPresents !== undefined && (
                        <Button variant="outlined" color="secondary" onClick={handleMajPresence} startIcon={<Update />}>
                            Mettre à jour
                        </Button>
                    )}
                </Stack>

                <Divider orientation="horizontal" flexItem />

                <Stack direction={"row"} spacing={12} justifyContent={'space-evenly'} alignItems={'stretch'} width={'100%'}>
                    {/* Partie gauche du menu de présence (Input et confirmation ) */}
                    <Stack direction="column" spacing={2} width={'30%'}>
                        <Typography variant="h6" fontWeight={'bold'}>
                            Choississez une salle :
                        </Typography>
                        
                        <Tabs
                            orientation='vertical'
                            variant='scrollable'
                            value={salleTabs}
                            onChange={handleChangeSalle}
                            sx={{ borderRight: 1, 
                                borderColor: 'divider', 
                                height: '100%',
                            }}
                        >
                            {epreuve.salles.map((salle, index) => (
                                <Tab 
                                    key={salle} 
                                    label={salle}
                                />
                            ))}

                        </Tabs>
                    </Stack>

                    {epreuve.salles.map((salle, index) => (
                        <Box key={salle} 
                            role="tabpanel" 
                            id={`vertical-tabpanel-${index}`} 
                            aria-labelledby={`vertical-tab-${index}`} 
                            sx={{ width: '100%', 
                                flexDirection: 'row', 
                                justifyContent: 'space-between', 
                                display: salleTabs === index ? 'flex' : 'none',
                               
                                }}
                                >

                            {/* Partie droite du menu de présence (Codes d'anonymat supplémentaires) */}
                            <Stack direction="column" spacing={2} alignItems="flex-start" width={"75%"}>
                                <Typography variant="h5" fontWeight={'bold'}>
                                    Codes d'anonymat supplémentaires
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Associer chaque code d'anonymat supplémentaire attribué à un étudiant :
                                </Typography>

                                {/* TODO : Afficher la liste des codes d'anonymat supplémentaires avec un champ de saisie pour associer un étudiant (peut-être un select/autocomplete avec les étudiants de la session ou inscrits à l'epreuve ?) */}
                                <Stack direction="column" spacing={1} alignItems="flex-start" width={"100%"} overflow={'y-scroll'} maxHeight={300} paddingRight={1}>

                                    {convocations.length > 0 ? convocations.map((convoc) => (
                                        <AnonymatCard key={convoc.codeAnonymat + convoc.idSession} codeAnonymat={convoc.codeAnonymat} />
                                    )) : (
                                        <Alert severity="info" sx={{ width: '100%' }}>
                                            Aucun code d'anonymat supplémentaire pour la salle {salle}.
                                        </Alert>
                                    )}
                                </Stack>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Stack>

            {successMajPresents !== null && (
            <Snackbar open={true} autoHideDuration={6000} onClose={() => setSuccessMajPresents(null)}>
                <Alert severity={successMajPresents ? "success" : "error"} sx={{ width: '100%' }}>
                    {successMajPresents ? "Nombre de présents mis à jour avec succès !" : "Erreur lors de la mise à jour du nombre de présents."}
                </Alert>
            </Snackbar>
            )}
        </>
    );
}