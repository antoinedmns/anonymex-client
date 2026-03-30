import { Button, Card, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useState } from "react";
import { createEtudiant, getEtudiant } from "../../../../../contracts/etudiants";
import { Add } from "@mui/icons-material";
import { ModalCreationEtudiant } from "./ModalCreationEtudiant";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type CodeSupplementaireCarteProps = {
    codeAnonymat: string;
    OnError?: ( message: string ) => void; // Callback pour remonter les erreurs à afficher dans le menu de présence
}

export default function CodeSupplementaireCarte({ codeAnonymat, OnError }: CodeSupplementaireCarteProps) {

    const [inputValue, setInputValue] = useState("");

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [modalCreation, setModalCreation] = useState(false);

    const [confirmAssociation, setConfirmAssociation] = useState(false);

    function numeroEtudiantValide(value: string): boolean {
        return /^\d{8}$/.test(value);
    }

    function OuvertureModal() {
        const numero = inputValue.trim();

        if (!numeroEtudiantValide(numero)) {
            const error = "Le numéro étudiant doit être un nombre de 8 chiffres.";
            setErrorMessage(error);
            OnError?.(error);
            return;
        }

        setModalCreation(true);

    }

    async function CreationEtudiant(data: { nom: string; prenom: string }) {
        const numero = inputValue.trim();

        console.log("Création de l'étudiant avec le numéro :", numero);
        console.log("Données de l'étudiant :", data);

        const response = await createEtudiant({ numeroEtudiant: +numero, nom: data.nom, prenom: data.prenom });

        if (response.error || !response.data) {
            const error = response.error ?? "Erreur lors de la création de l'étudiant.";
            setErrorMessage(error);
            OnError?.(error);
            return;
        }

        setModalCreation(false);
        setInputValue(numero); // Remplit le champ avec le numéro de l'étudiant créé pour permettre l'association
    }



    async function handleClickAssocier() {

        let error: string | null = null;

        console.log("appel de la fonction");

        const value = inputValue.trim();

        if (!numeroEtudiantValide(value)) {
            error = "Le numéro étudiant doit être un nombre de 8 chiffres.";
        }

        if (error) {
            setErrorMessage(error);
            OnError?.(error);
            return;
        }

        const res = await getEtudiant(+value);

        if (res.error || !res.data) {
            error = res.error ?? "Aucun étudiant trouvé.";
        } else if (res.status !== 200) {
            error = "Erreur lors de la récupération de l'étudiant.";
        }

        if (error) {
            setErrorMessage(error);
            OnError?.(error);
            return;
        }

        const etudiant = res.data;
        setConfirmAssociation(true);

        setErrorMessage(null);
        OnError?.(""); // ou undefined si tu préfères
    }

    return (
        <>
            {modalCreation && (
                <ModalCreationEtudiant
                    open={modalCreation}
                    onClose={() => setModalCreation(false)}
                    onSubmit={CreationEtudiant}
                />
            )}
            <Card
                variant="outlined"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: grey[50],
                    width: "100%",
                }}
            >
                {/* Partie gauche */}
                <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                    <Typography variant="h6" fontWeight="bold" minWidth={100}>
                        {codeAnonymat}
                    </Typography>

                    <TextField
                        placeholder="Numéro étudiant"
                        type="text"
                        variant="standard"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}

                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={OuvertureModal} edge="end">
                                            <Add />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Stack>

                {/* Bouton */}
                <Button
                    variant="contained"
                    color="success"
                    sx={{ flexShrink: 0 }} // empêche le bouton de se compresser
                    disabled={confirmAssociation} // TODO : Grisé si déjà associé
                    onClick={() => {
                        handleClickAssocier();
                    }}
                >
                    Associer
                </Button>
                {confirmAssociation && (
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                )}
            </Card>
        </>
    );
}