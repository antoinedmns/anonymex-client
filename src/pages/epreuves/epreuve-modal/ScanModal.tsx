import { Stack, Typography, TextField, Collapse } from "@mui/material";
import { useState, useRef } from "react";
import Modal from "@mui/material/Modal";
import { green, grey, red } from "@mui/material/colors";
import BoutonStandard from "./components/BoutonStantard";
import Close from "@mui/icons-material/Close"
import { useSnackbarGlobal } from "../../../contexts/SnackbarContext";


interface ScanModalProps {
    ouvert: boolean;
    setOuvertModalScan: (ouvert: boolean) => void;
    setSuccess: (success: boolean) => void;
}

export function ScanModal(props: ScanModalProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState<boolean>(false);

    const [fichiers, setFichiers] = useState<File | null>(null);

    const { afficherErreur } = useSnackbarGlobal();

    const [codeUE, setCodeUE] = useState<string>("");

    // Cas ou l'utilisateur utilise le drag and drop pour déposer le fichier

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        if (!file.name.endsWith(".xlsx")) {
            afficherErreur("Fichier invalide, veuillez déposer un fichier au format .xlsx");
            return;
        }
        else {
            setFichiers(file);

            if (inputRef.current) {
                inputRef.current.files = e.dataTransfer.files;
            }

            console.log("Fichiers déposés :", fichiers);
        }
    };

    // Cas ou l'utilisateur utilise le bouton de sélection de fichier au lieu du drag and drop

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;

        if (file && !file.name.endsWith(".xlsx")) {
            afficherErreur("Fichier invalide, veuillez sélectionner un fichier au format .xlsx");
            return;
        }
        else {
            setFichiers(file);
            console.log("Fichier sélectionné :", fichiers);
        }
    }

    // Réinitialiser le champ de fichier et l'état associé

    const handleReset = () => {
        setFichiers(null);
        setCodeUE("");
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    // Fermer le modal et réinitialiser les états associés

    const handleClose = () => {
        handleReset();
        setCodeUE("");
        props.setOuvertModalScan(false);
    }

    // Soumettre le fichier sélectionné (appel API)

    const handleSubmit = () => {
        // Appel API pour envoyer le fichier
        if (!fichiers) {
            afficherErreur("Aucun fichier sélectionné, veuillez sélectionner un fichier avant de soumettre");
            return;
        }

        if (!codeUE) {
            afficherErreur("Code UE manquant, veuillez entrer le code UE associé au fichier");
            return;
        }
        // variable codeUE pour appel API

        // await 
        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            // Si success

            props.setSuccess(true);
            setCodeUE("");
            handleClose();
        }, 2000);


    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <Modal open={props.ouvert} onClose={handleClose}>
            <Stack
                sx={{ height: "100%", width: "100vw" }}
                alignItems="center"
                justifyContent="center"
            >
                <Stack
                    // La hauteur du modal s'adapte en fonction de la présence ou non d'un fichier sélectionné
                    sx={{ height: fichiers ? "500px" : "300px", width: 700, bgcolor: grey[100], p: 2, borderRadius: 4, transition: "height 0.3s" }}
                    direction="column" justifyContent="space-between" spacing={1} alignItems="center"
                >
                    <Stack alignItems="center" >
                        <Close onClick={() => handleClose()} sx={{ alignSelf: "flex-start", cursor: "pointer", color: grey[700], bgcolor: grey[200], '&:hover': { bgcolor: grey[300] }, borderRadius: 5 }} />
                        <Typography variant="h4" fontWeight={700} color={grey[800]}> Dépot copies scannées</Typography>
                        <Typography variant="body1" color={grey[700]} textAlign="center">
                            Déposez le fichier Excel contenant les données des copies scannées. Assurez-vous que le fichier est au format .xlsx.
                        </Typography>
                    </Stack>
                    <Stack
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        sx={{
                            width: "100%",
                            height: "200px",

                            border: "2px dashed gray",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 15,
                            bgcolor: grey[200],
                            '&:hover': { bgcolor: grey[300] + "AF" },
                            transition: "background-color 0.3s",
                        }}
                    >
                        <Stack direction="column" alignItems="center" spacing={2}>
                            <Typography> Déposer fichier </Typography>

                            <input
                                ref={inputRef}
                                type="file"
                                accept=".xlsx"
                                onChange={(e) => handleChange(e)}

                            />
                        </Stack>
                    </Stack>
                    <Collapse in={fichiers !== null} sx={{ width: "100%" }}>
                        <Stack spacing={1} width="100%">
                            <TextField value={codeUE ? codeUE : ""} label="Code UE du fichier" variant="outlined" onChange={(e) => setCodeUE(e.target.value)} />
                            <Stack direction={"row"} width={"100%"} spacing={2}>
                                <BoutonStandard color={red[400]} onClick={() => handleReset()} texte="Supprimer le fichier" width={"100%"} />
                                <BoutonStandard loading={loading ? true : false} color={green[400]} onClick={() => handleSubmit()} texte="Envoyer" width={"100%"} />
                            </Stack>
                            <Typography variant="body2" color={grey[700]} textAlign="center">
                                Fichier sélectionné : {fichiers ? fichiers.name : ""}
                            </Typography>
                        </Stack>
                    </Collapse>

                </Stack>

            </Stack>


        </Modal >
    );
}