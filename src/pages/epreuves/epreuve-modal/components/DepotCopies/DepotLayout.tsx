import { Close } from "@mui/icons-material";
import { Alert, Box, Collapse, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { green, grey } from "@mui/material/colors";
import { useSnackbarGlobal } from "../../../../../contexts/SnackbarContext";
import { DropZone } from "./DropZone";
import BoutonStandard from "../BoutonStantard";
import { useEffect, useRef, useState } from "react";
import { FileList } from "./FileList";

import { type APIIncident } from "../../../../../contracts/incidents";
import { URL_API_BASE } from "../../../../../utils/api";
import IncidentListe from "../../menu-modal/composantsIncidents/IncidentListe";
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import IncidentDetails from "../../menu-modal/composantsIncidents/IncidentDetail";

interface DepotLayoutProps {
    isModal: boolean;
    handleClose?: () => void;
    idSession: string; // Nécessaire pour l'appel API
    codeUE?: string; // Si ouvert depuis une UE, on peut préremplir le code UE, sinon il sera demandé à l'utilisateur
    setCodeScan?: (code: string) => void;
    setSuccess?: (success: boolean) => void;
    onIncidentCreated?: () => void;
    onIncidentResolved?: () => void;
}

export function DepotLayout(props: DepotLayoutProps) {

    // Reference pour le champ de fichier (input)
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState<boolean>(false);

    // Fichiers sélectionnés
    const [fichiers, setFichiers] = useState<FileList | null>(null);

    // Si c'est un modal, on affiche le champ de code UE
    const [codeUE, setCodeUE] = useState<string>("");


    const [incidents, setIncidents] = useState<APIIncident[]>([]); // Affichage
    const [incidentOuvert, setIncidentOuvert] = useState<APIIncident | null>(null); // Pour savoir quel incident est ouvert

    // Affichage barre de progression
    const [numPage, setPage] = useState<number[]>([]);
    const [totalPages, setTotalPages] = useState<number[]>([]);
    const [numFichier, setNumFichier] = useState<number>(0);
    const [debutTraitement, setDebutTraitement] = useState<boolean>(false);
    const [erreurs, setErreurs] = useState<number[]>([]);

    // Confirmation de fin
    const [afficherConfirmation, setAfficherConfirmation] = useState<boolean>(false);

    // State pour le Snackbar de succès / erreur lors de la correction d'un incident
    const [ouvertSucces, setOuvertSucces] = useState<boolean>(false);
    const [ouvertEchec, setOuvertEchec] = useState<boolean>(false);
    const [messageSnackbar, setMessageSnackbar] = useState<string>("");

    // Contexte pour afficher les messages d'erreur
    const { afficherErreur } = useSnackbarGlobal();


    // Si un codeUE est passé en props (ouverture depuis une UE), on le préremplit
    useEffect(() => {
        if (props.codeUE) {
            setCodeUE(props.codeUE);
        }
    }, [props.codeUE]);

    useEffect(() => {
        console.log("Incident ouvert : 1", incidentOuvert);
    }, [incidentOuvert]);

    // Réinitialiser le champ de fichier et l'état associé
    const handleReset = () => {
        setFichiers(null);
        setNumFichier(0);
        setPage([]);
        setTotalPages([]);
        setDebutTraitement(false);
        setAfficherConfirmation(false);
        setErreurs([]);
        setLoading(false);
        setIncidents([]);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };



    // Gestion de la suppression d'un fichier de la liste
    const handleSupprFile = (index: number) => {
        const dt = new DataTransfer();
        if (fichiers) {
            for (let i = 0; i < fichiers.length; i++) {
                if (i !== index) {
                    dt.items.add(fichiers[i]);
                }
            }
        }

        if (dt.files.length == 0) {
            handleReset();
        }
        else {
            setFichiers(dt.files);
        }
    }




    // Soumettre le fichier sélectionné (appel API)
    const handleSubmit = async () => {
        // Appel API pour envoyer le fichier
        if (!fichiers) {
            afficherErreur("Aucun fichier sélectionné, veuillez sélectionner un fichier avant de soumettre");
            return;
        }

        if (!codeUE) {
            afficherErreur("Code UE manquant, veuillez entrer le code UE associé au fichier");
            return;
        }
        setErreurs([]);
        setLoading(true);
        setNumFichier(0);
        setPage([]);
        setTotalPages([]);
        setDebutTraitement(true);
        let i = 0;
        for (const fichier of Array.from(fichiers)) {

            const formData = new FormData();
            formData.append("fichier", fichier);

            const response = await fetch(`${URL_API_BASE}/sessions/${props.idSession}/epreuves/${codeUE}/depot`, {
                method: "POST",
                body: formData,
            });

            const info = await response.json();

            await appelerAPI(info, i);
            i = i + 1;
            setNumFichier(i);

        }

        console.log("Tous les fichiers ont été traités");


        setAfficherConfirmation(true);

        // setFichiers(null);

        {/* 
        {
            props.isModal && (
                props.setSuccess!(true),
                props.setCodeScan!(codeUE),
                props.handleClose!()
            )
        }

        setFichiers(null)
        setCodeUE("");

        */}
    }

    const ajouterIncident = (incident: APIIncident) => {
        setIncidents((prev) => {
            if (prev.some((item) => item.idIncident === incident.idIncident)) {
                return prev;
            }

            props.onIncidentCreated?.();
            return [...prev, incident];
        });
    }

    const retirerIncident = (idIncident: number) => {
        setIncidents((prev) => {
            const next = prev.filter(incident => incident.idIncident !== idIncident);
            if (next.length < prev.length) {
                props.onIncidentResolved?.();
            }
            return next;
        });
    }

    // Appeler l'API pour écouter les événements de progression du dépôt via SSE
    const appelerAPI = async (depotID: string, i: number): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {

            const url = `${URL_API_BASE}/sessions/${props.idSession}/epreuves/${codeUE}/depot/${depotID}/progress`;
            console.log("Écoute des événements de progression pour le dépôt :", depotID, "via l'URL :", url);
            const evtSource = new EventSource(url);

            // Écouter les événements de progression envoyés par le serveur
            evtSource.addEventListener("progress", function (event) {

                console.log(`Progression du dépôt ${depotID} :`, event.data);
                const infos = JSON.parse(event.data);

                // set page d'index numFichier à jour
                setPage(prev => {
                    const newPage = [...(prev || [])];
                    newPage[i] = Number(infos.n ?? infos.p) || 0;
                    return newPage;
                });

                setTotalPages(prev => {
                    const newTotalPages = [...(prev || [])];
                    if (newTotalPages[i] === undefined) {
                        newTotalPages[i] = Number(infos.t ?? infos.totalPages) || 0;
                    }
                    return newTotalPages;
                });

            });

            // Si le dépôt est traité avec succès, on affiche un message de succès et on ferme la connexion SSE
            evtSource.addEventListener("ok", function (event) {
                console.log(`Dépôt ${depotID} traité avec succès :`, event.data);
                evtSource.close();

                resolve(true);
            });

            evtSource.addEventListener("incident", function (event) {
                console.log('Erreur, INCIDENT détécté', event.data);
                const info = JSON.parse(event.data)
                setIncidents((prev) => {
                    if (prev.some((item) => item.idIncident === info.idIncident)) {
                        return prev;
                    }

                    props.onIncidentCreated?.();
                    return [...prev, info];
                });
            })

            // En cas d'erreur lors du traitement du dépôt, on affiche un message d'erreur et on ferme la connexion SSE
            evtSource.onerror = function (event) {
                console.error(`Erreur lors du dépôt ${depotID} :`, event);
                setErreurs(prev => [...prev, i]);
                evtSource.close();
                resolve(false);
            };
        }
        );
    }


    return (
        <Stack
            sx={{
                height: props.isModal ? (fichiers ? "500px" : "400px") : "100%",
                width: props.isModal ? (fichiers ? "900px" : "500px") : "100%",
                bgcolor: "white",
                borderRadius: 4,
                p: 3,
                pt: props.isModal ? 3 : 0,
                transition: "height 0.3s ease, width 0.3s ease",
            }}
            spacing={2}
        >
            <Stack width="100%" direction="row" spacing={2}>

                {/* Partie gauche */}
                <Stack
                    sx={{
                        width: fichiers
                            ? incidentOuvert
                                ? "40%"
                                : "50%"
                            : "100%",
                        transition: "width 0.3s ease",
                        height: "100%",
                    }}
                >
                    {props.isModal && (
                        <Close
                            onClick={() => {
                                props.handleClose?.();
                                handleReset();
                            }}
                            sx={{ cursor: "pointer", alignSelf: "flex-start" }}
                        />
                    )}

                    <Stack spacing={2} height="100%" alignItems="center">
                        {!debutTraitement ? (
                            <>
                                <DropZone inputRef={inputRef} setFichiers={setFichiers} fichiers={fichiers} />
                                <Collapse in={!!fichiers} sx={{ width: "100%", transition: "width 0.3s ease" }}>
                                    <Stack spacing={1} width="100%">
                                        {props.isModal && (
                                            <TextField
                                                value={codeUE ?? ""}
                                                label="Code UE du fichier"
                                                variant="outlined"
                                                onChange={(e) => setCodeUE(e.target.value)}
                                                fullWidth
                                            />
                                        )}
                                        <Stack direction="row" width="100%" spacing={2}>
                                            <BoutonStandard
                                                loading={loading}
                                                color={green[400]}
                                                onClick={handleSubmit}
                                                texte="Envoyer"
                                                width="100%"
                                            />
                                        </Stack>
                                    </Stack>
                                </Collapse>
                            </>
                        ) : (
                            <Stack width="100%">
                                {incidents.length === 0 ? (
                                    <Stack alignItems="center" spacing={2} pt={8}>
                                        <QueryBuilderIcon sx={{ fontSize: 100, color: grey[600] }} />
                                        <Typography variant="h5" fontWeight={500} color={grey[700]} textAlign="center">
                                            Ici seront affichés les<br />incidents de lecture
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <IncidentListe liste={incidents} onClick={setIncidentOuvert} selectedIncidentId={incidentOuvert?.idIncident || null} />
                                )}
                            </Stack>
                        )}
                    </Stack>
                </Stack>

                {/* Partie droite */}
                {!incidentOuvert && (
                    <Collapse
                        in={!!fichiers}
                        unmountOnExit
                        orientation="vertical"
                        sx={{
                            width: fichiers ? "50%" : "0%",
                            transition: "width 0.3s ease",
                        }}
                    >
                        <Box p={2}>
                            {fichiers && (
                                <FileList
                                    fichiers={fichiers}
                                    handleSupprFile={handleSupprFile}
                                    numPage={numPage}
                                    totalPages={totalPages}
                                    numFichier={numFichier}
                                    debutTraitement={debutTraitement}
                                    erreurs={erreurs}
                                />
                            )}
                            <Stack direction="row" width="100%" spacing={2} justifyContent="center">
                                {afficherConfirmation && (
                                    <BoutonStandard
                                        color={grey[400]}
                                        onClick={handleReset}
                                        texte="NOUVEAU DÉPÔT"
                                        width="80%"
                                    />
                                )}
                            </Stack>
                        </Box>
                    </Collapse>
                )}

                {/* Détails incident ouvert */}
                {incidentOuvert && (
                    <Stack
                        width="60%"
                        sx={{
                            transition: "width 0.3s ease",
                        }}
                    >
                        <IncidentDetails
                            onClick={() => setIncidentOuvert(null)}
                            onClose={() => setIncidentOuvert(null)}
                            incident={incidentOuvert}
                            ajouterIncident={ajouterIncident}
                            retirerIncident={retirerIncident}
                            setOuvertSucces={setOuvertSucces}
                            setOuvertEchec={setOuvertEchec}
                            setMessageSnackbar={setMessageSnackbar}
                        />
                    </Stack>
                )}
            </Stack>
            <Snackbar
                open={ouvertSucces}
                autoHideDuration={3000}
                onClose={() => setOuvertSucces(false)}
            >
                <Alert severity="success" variant="filled">
                    {messageSnackbar}
                </Alert>
            </Snackbar>
            <Snackbar
                open={ouvertEchec}
                autoHideDuration={3000}
                onClose={() => setOuvertEchec(false)}
            >
                <Alert severity="error" variant="filled">
                    {messageSnackbar}
                </Alert>
            </Snackbar>
        </Stack>
    );
}