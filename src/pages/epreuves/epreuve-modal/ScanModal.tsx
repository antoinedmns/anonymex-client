import { Stack, Typography, TextField, Collapse, IconButton } from "@mui/material";
import { useState, useRef } from "react";
import Modal from "@mui/material/Modal";
import { green, grey } from "@mui/material/colors";
import BoutonStandard from "./components/BoutonStantard";
import Close from "@mui/icons-material/Close"
import { useSnackbarGlobal } from "../../../contexts/SnackbarContext";
import { DropZone } from "./components/DropZone";



interface ScanModalProps {
    ouvert: boolean;
    setOuvertModalScan: (ouvert: boolean) => void;
    setSuccess: (success: boolean) => void;
    setCodeScan: (code: string) => void;
}

export function ScanModal(props: ScanModalProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState<boolean>(false);

    const [fichiers, setFichiers] = useState<FileList | null>(null);

    const { afficherErreur } = useSnackbarGlobal();

    const [codeUE, setCodeUE] = useState<string>("");


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
            props.setCodeScan(codeUE);
            setCodeUE("");
            handleClose();
        }, 2000);


    }


    return (
        <Modal open={props.ouvert} onClose={handleClose}>
            <Stack
                sx={{ height: "100%", width: "100%" }}
                alignItems="center"
                justifyContent="center"
                direction={"row"}
            >

                <Stack
                    sx={{
                        height: fichiers ? "550px" : "400px",
                        width: fichiers ? "900px" : "500px",
                        bgcolor: grey[100],
                        p: 3,
                        borderRadius: 4,
                        transition: "height 0.3s ease, width 0.3s ease",

                    }}
                    direction="row"
                    spacing={2}
                >
                    {/* Partie gauche */}
                    <Stack
                        sx={{
                            width: fichiers ? "50%" : "100%",
                            transition: "width 0.3s ease"
                        }}
                    >
                        <Close onClick={handleClose} sx={{ mb: 1, cursor: "pointer" }} />
                        <Stack alignItems="center" spacing={1}>
                            <Typography variant="h4" fontWeight={700} color={grey[800]}>
                                Dépot copies scannées
                            </Typography>
                            <Typography variant="body1" color={grey[700]} textAlign="center">
                                Déposez le fichier PDF contenant les données des copies scannées. Assurez-vous que le fichier est au format .pdf.
                            </Typography>
                        </Stack>

                        <Stack spacing={2} width="100%" pt={2}>
                            <DropZone inputRef={inputRef} setFichiers={setFichiers} fichiers={fichiers} />
                            <Collapse in={fichiers !== null} sx={{ width: "100%" }}>
                                <Stack spacing={1} width="100%">
                                    <TextField
                                        value={codeUE ?? ""}
                                        label="Code UE du fichier"
                                        variant="outlined"
                                        onChange={(e) => setCodeUE(e.target.value)}
                                    />
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
                        </Stack>
                    </Stack>

                    {/* Partie droite */}
                    <Collapse in={fichiers !== null} orientation="vertical" sx={{ width: fichiers ? "50%" : "0%", transition: "width 0.3s ease", overflow: "scroll" }} >
                        <Stack sx={{ overflow: "scroll" }} >
                            {fichiers && Array.from(fichiers).map((file, index) => (
                                <Stack key={index} direction="row" alignItems="center" spacing={1} p={1} >
                                    <IconButton onClick={() => handleSupprFile(index)} sx={{ color: grey[600] }}>
                                        <Close />
                                    </IconButton>

                                    <Typography variant="body1" color={grey[800]} fontWeight={500}>
                                        {file.name}
                                    </Typography>
                                    <Typography variant="body2" color={grey[600]}>
                                        {(file.size / 1024).toFixed(2)} KB
                                    </Typography>

                                </Stack>
                            ))}
                        </Stack>
                    </Collapse>
                </Stack>

            </Stack >



        </Modal >
    );
}