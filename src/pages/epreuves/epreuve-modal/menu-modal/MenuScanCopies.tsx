import { Stack, Typography, Collapse } from "@mui/material";
import { useState, useRef } from "react";
import { green, grey, red } from "@mui/material/colors";
import BoutonStandard from "../components/BoutonStantard";
import { useSnackbarGlobal } from "../../../../contexts/SnackbarContext";
import { DropZone } from "../components/DropZone";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close"
import VisibilityIcon from '@mui/icons-material/Visibility';

interface MenuScanCopiesProps {
    menuColor: string;
    codeUE: string
}

export function MenuScanCopies(props: MenuScanCopiesProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState<boolean>(false);

    const [fichiers, setFichiers] = useState<FileList | null>(null);

    const { afficherErreur } = useSnackbarGlobal();

    // Cas ou l'utilisateur utilise le drag and drop pour déposer le fichier


    // Réinitialiser le champ de fichier et l'état associé

    const handleReset = () => {
        setFichiers(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    // Fermer le modal et réinitialiser les états associés

    const handleClose = () => {
        handleReset();
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

        // props.codeUE 

        // await 
        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            // Si success
            handleClose();
        }, 2000);
    }

    // Afficher le pdf 

    const handleViewFile = (file: File) => {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
        URL.revokeObjectURL(fileURL);
    }


    return (
        <Stack
            sx={{
                height: fichiers ? "100%" : "100%",
                width: fichiers ? "100%" : "100%",
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
                    width: fichiers ? "100%" : "100%",
                    transition: "width 0.3s ease"
                }}
            >
                <Stack alignItems="center" spacing={1} mb={1}>
                    <Typography variant="h4" fontWeight={700} color={grey[800]}>
                        Dépot copies scannées
                    </Typography>
                    <Typography variant="body1" color={grey[700]} textAlign="center">
                        Formats acceptés : PDF, JPG, PNG, ZIP et RAR.
                    </Typography>
                </Stack>

                <Stack spacing={2} width="100%" pt={2}>
                    <DropZone inputRef={inputRef} setFichiers={setFichiers} fichiers={fichiers} />
                    <Collapse in={fichiers !== null} sx={{ width: "100%" }}>
                        <Stack spacing={1} width="100%">

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
            <Collapse in={fichiers !== null} orientation="vertical" sx={{ width: fichiers ? "100%" : "0%", transition: "width 0.3s ease", overflow: "scroll" }} >
                <Stack sx={{ overflow: "scroll" }} >
                    {fichiers && Array.from(fichiers).map((file, index) => (
                        <Stack key={index} direction="row" alignItems="center" spacing={1} p={1} >
                            <IconButton onClick={() => handleSupprFile(index)} sx={{ color: grey[600] }}>
                                <Close />
                            </IconButton>
                            <IconButton onClick={() => handleViewFile(file)} sx={{ color: grey[600] }}>
                                <VisibilityIcon />
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

    );
}