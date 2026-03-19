
import { Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { keyframes } from "@emotion/react";
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import BoutonStandard from "../BoutonStantard";
import { useEffect, useState } from "react";

interface DropZoneProps {
    inputRef: React.RefObject<HTMLInputElement | null>;
    setFichiers: (files: FileList | null) => void;
    fichiers: FileList | null;
}


const fadeInFadeOut = keyframes`
    0% {
    border: 2px dashed ${grey[500]};
    background-color: ${grey[200]};
    }
    50% {
    border: 2px dashed ${grey[200]};
    background-color: ${grey[100]};
    }
    100% {
    border: 2px dashed ${grey[500]};
    background-color: ${grey[200]};
    }
`;

export function DropZone(props: DropZoneProps) {


    const [animate, setAnimate] = useState<boolean>(false);


    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setAnimate(true);
    };


    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setAnimate(false);

        const files = e.dataTransfer.files;


        const dt = new DataTransfer();

        // ajouter les anciens fichiers
        if (props.fichiers) {
            for (let i = 0; i < props.fichiers.length; i++) {
                dt.items.add(props.fichiers[i]);
            }
        }

        if (files) {
            // ajouter les nouveaux fichiers
            for (let i = 0; i < files.length; i++) {
                dt.items.add(files[i]);
            }
        }
        props.setFichiers(dt.files);

        if (props.inputRef.current) {
            props.inputRef.current.files = e.dataTransfer.files;
        }
    };

    // Cas ou l'utilisateur utilise le bouton de sélection de fichier au lieu du drag and drop

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        console.log("Fichiers sélectionnés via le bouton :", files);

        const dt = new DataTransfer();

        // ajouter les anciens fichiers
        if (props.fichiers) {
            for (let i = 0; i < props.fichiers.length; i++) {
                dt.items.add(props.fichiers[i]);
            }
        }

        if (files) {
            // ajouter les nouveaux fichiers
            for (let i = 0; i < files.length; i++) {
                dt.items.add(files[i]);
            }
        }

        props.setFichiers(dt.files);

    }

    useEffect(() => {
        console.log("Fichiers sélectionnés mis à jour :", props.fichiers);
    }, [props.fichiers]);

    return (
        <Stack spacing={1} alignItems="center" width="100%" p={1}>
            <Stack alignItems="center" spacing={1} pb={2}>
                <Typography variant="h4" fontWeight={700} color={grey[800]}>
                    Dépôt copies scannées
                </Typography>
                <Typography variant="body1" color={grey[700]} textAlign="center">
                    Formats acceptés : PDF, PNG, JPG, ZIP et RAR.
                </Typography>
            </Stack>

            <Stack
                onDrop={(e) => handleDrop(e)}
                onDragOver={(e) => handleDragOver(e)}
                onDragLeave={() => setAnimate(false)}
                onClick={() => props.inputRef.current?.click()}
                sx={{
                    width: "100%",
                    height: "200px",

                    border: `2px dashed ${grey[500]}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 4,
                    bgcolor: grey[200],
                    '&:hover': {
                        bgcolor: grey[200],
                        borderColor: grey[500],
                        cursor: "pointer",
                        animation: `${fadeInFadeOut} 2s ease-in-out infinite`,
                        animationPlayState: "running",
                    },
                    animationPlayState: "paused",
                    animation: animate ? `${fadeInFadeOut} 2s ease-in-out infinite` : "none",

                }}
            >
                <Stack direction="column" alignItems="center" spacing={1}>
                    <DriveFolderUploadIcon sx={{ fontSize: 100, color: grey[600] }} />
                    <BoutonStandard color={grey[500]} >
                        <label htmlFor="file-upload" style={{ cursor: "pointer", color: grey[700] }}> Selectionner </label>
                    </BoutonStandard>
                    <input
                        id="file-upload"
                        ref={props.inputRef}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleChange(e)}
                        style={{ display: "none" }}
                    />
                </Stack>
            </Stack>
        </Stack>
    );
}