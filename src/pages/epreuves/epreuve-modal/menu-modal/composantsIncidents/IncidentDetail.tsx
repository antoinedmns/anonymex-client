import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

interface IncidentDetailProps {
    numeroAnonymat: string | null;
    note: string | null;
    idIncident: number;
    onClick: () => void;
    onClose: (id: number) => void;
    fichier: string | undefined;
}

export default function IncidentDetail({ numeroAnonymat, note, idIncident, onClick, onClose, fichier }: IncidentDetailProps) {

    const [numero, setNumero] = React.useState(numeroAnonymat);
    const [noteValue, setNoteValue] = React.useState(note);

    const [errors, setErrors] = React.useState({
        note: "",
        numero: ""
    });

    function FormValide(numero: string | null, note: string | null) {
        const newErrors = {
            note: "",
            numero: ""
        };

        if (note === null || note.trim() === "") {
            newErrors.note = "La note est requise.";
        } else if (Number(note) < 0 || Number(note) > 20) {
            newErrors.note = "La note doit être comprise entre 0 et 20.";
        } else if (isNaN(Number(note))) {
            newErrors.note = "La note doit être un nombre.";
        }

        if (numero === null || numero.trim() === "") {
            newErrors.numero = "Le numéro d'anonymat est requis.";
        } else if (numero.length > 6) {
            newErrors.numero = "Max 6 caractères.";
        }

        const hasError = newErrors.note || newErrors.numero;

        setErrors(newErrors);

        if (!hasError) {
            // TODO Enregistrer les modifications (en attendant, on ferme le détail de l'incident).
            onClose(idIncident);
        }
    }

    return (
        <Stack gap={2}>
            <Box onClick={onClick} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center'}} maxHeight={'40px'} maxWidth={'80px'}>
                <ArrowBackIosIcon/>
                <Typography variant="h6" marginLeft={1}>Retour</Typography>
            </Box>

            <TransformWrapper initialScale={1}>
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        <Stack gap={2} direction="row" justifyContent="center">
                            <Button onClick={() => zoomIn()}>Zoom +</Button>
                            <Button onClick={() => zoomOut()}>Zoom -</Button>
                            <Button onClick={() => resetTransform()}>Reset</Button>
                        </Stack>

                        <TransformComponent>
                            <img src={fichier} alt={"Image de l'incident N°" + idIncident} style={{ maxWidth: "100%", maxHeight: "400px" }} />
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>

            <TextField
                label="Numéro Anonymat"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                error={!!errors.numero}
                helperText={errors.numero}
            />

            <TextField
                label="Note"
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                error={!!errors.note}
                helperText={errors.note}
            />

            <Button variant="contained" onClick={() => FormValide(numero, noteValue)}>
                Enregistrer
            </Button>
        </Stack>
    );
}