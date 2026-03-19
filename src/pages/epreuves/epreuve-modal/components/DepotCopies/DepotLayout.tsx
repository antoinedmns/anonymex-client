import { Close } from "@mui/icons-material";
import { Collapse, Stack, TextField, Typography } from "@mui/material";
import { green, grey } from "@mui/material/colors";
import { useSnackbarGlobal } from "../../../../../contexts/SnackbarContext";
import { DropZone } from "./DropZone";
import BoutonStandard from "../BoutonStantard";
import { useEffect, useRef, useState } from "react";
import { FileList } from "./FileList";

import type { APIListIncidents, APIIncident } from "../../../../../contracts/incidents";
import { URL_API_BASE } from "../../../../../utils/api";



interface DepotLayoutProps {
    isModal: boolean;
    handleClose?: () => void;
    idSession: string; // Nécessaire pour l'appel API
    codeUE?: string; // Si ouvert depuis une UE, on peut préremplir le code UE, sinon il sera demandé à l'utilisateur
    setCodeScan?: (code: string) => void;
    setSuccess?: (success: boolean) => void;
}



export function DepotLayout(props: DepotLayoutProps) {

    // Reference pour le champ de fichier (input)
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState<boolean>(false);

    // Fichiers sélectionnés
    const [fichiers, setFichiers] = useState<FileList | null>(null);

    // Si c'est un modal, on affiche le champ de code UE
    const [codeUE, setCodeUE] = useState<string>("");


    const [incidents] = useState<APIListIncidents | null>(null); // Affichage
    const [incidentOuvert] = useState<APIIncident | null>(null); // Pour savoir quel incident est ouvert

    // Affichage barre de progression
    const [numPage, setPage] = useState<number | null>(null);
    const [totalPages, setTotalPages] = useState<number | null>(null);
    const [numFichier, setNumFichier] = useState<number>(0);
    const [debutTraitement, setDebutTraitement] = useState<boolean>(false);
    const [erreurs, setErreurs] = useState<number[]>([]);

    // Confirmation de fin
    const [afficherConfirmation, setAfficherConfirmation] = useState<boolean>(false);

    // Contexte pour afficher les messages d'erreur
    const { afficherErreur } = useSnackbarGlobal();


    // Si un codeUE est passé en props (ouverture depuis une UE), on le préremplit
    useEffect(() => {
        if (props.codeUE) {
            setCodeUE(props.codeUE);
        }
    }, [props.codeUE]);


    // Réinitialiser le champ de fichier et l'état associé
    const handleReset = () => {
        setFichiers(null);
        setNumFichier(0);
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
        setDebutTraitement(true);
        let i = 0;
        for (const fichier of Array.from(fichiers)) {

            console.log("NUM FICHIER ENVOYE :", i);
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


            setPage(null);
            setTotalPages(null);

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
                setPage(infos.n);
                setTotalPages(infos.t);

            });

            // Si le dépôt est traité avec succès, on affiche un message de succès et on ferme la connexion SSE
            evtSource.addEventListener("ok", function (event) {
                console.log(`Dépôt ${depotID} traité avec succès :`, event.data);
                evtSource.close();
                resolve(true);

            });
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
            <Stack width={"100%"} direction="row" spacing={2}>

                {/* Partie gauche, zone de dépôt & validation */}

                <Stack
                    sx={{
                        width: fichiers ? "50%" : "100%",
                        transition: "width 0.3s ease",
                        height: "100%"

                    }}
                >
                    {/* Si c'est un modal, on affiche le bouton de fermeture */}
                    {props.isModal && (
                        <Close
                            onClick={() => {
                                props.handleClose?.();
                                handleReset();
                            }}
                            sx={{ cursor: "pointer", alignItems: "flex-start" }}
                        />
                    )}


                    <Stack spacing={2} width="100%" height={"100%"}>

                        {/* Si il n'y a pas d'incidents, on affiche la dropzone, sinon on affiche les incidents */}
                        {true ? (<>

                            <DropZone inputRef={inputRef} setFichiers={setFichiers} fichiers={fichiers} />
                            <Collapse in={fichiers !== null} sx={{ width: "100%" }}>
                                <Stack spacing={1} width="100%">

                                    {/* Si c'est un modal, on affiche le champ de code UE, si non, il sera envoyé automatiquement */}
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
                        </>)

                            : (
                                /* Affichage des incidents */
                                <Stack>
                                    <Typography variant="h6" color="error">
                                        {erreurs.length} fichier(s) ont rencontré une erreur lors du traitement.
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary">
                                        Veuillez vérifier les fichiers et réessayer.
                                    </Typography>
                                </Stack>
                            )}



                    </Stack>
                </Stack>

                {/* Partie droite, affichage des fichiers sélectionnés ou des incidents */}
                {incidents === null && (

                    <Collapse in={fichiers !== null} orientation="vertical" sx={{ width: fichiers ? "50%" : "0%", transition: "width 0.3s ease" }} >
                        <Stack direction="column" alignItems="center" justifyContent={"space-between"} p={2}   >
                            <FileList fichiers={fichiers!} handleSupprFile={handleSupprFile} numPage={numPage} totalPages={totalPages} numFichier={numFichier} debutTraitement={debutTraitement} erreurs={erreurs} />
                        </Stack>
                        <Stack direction="row" width="100%" spacing={2} mt={2} justifyContent="center">
                            {afficherConfirmation && (
                                <BoutonStandard
                                    color={grey[400]}
                                    onClick={() => {
                                        setAfficherConfirmation(false);
                                        setDebutTraitement(false);
                                        setErreurs([]);
                                        setLoading(false);
                                        handleReset();
                                    }}
                                    texte="Déposer d'autres fichiers"
                                    width="75%"
                                />
                            )}
                        </Stack>

                    </Collapse>


                )}

                {/* Si un incident est ouvert, on affiche les détails de l'incident */}
                {incidentOuvert !== null && (
                    <Stack sx={{ width: "50%", transition: "width 0.3s ease" }}>
                        {/* <IncidentDetails incident={incidents[incidentOuvert]} /> */}
                    </Stack>
                )}

            </Stack>
        </Stack >

    );
}