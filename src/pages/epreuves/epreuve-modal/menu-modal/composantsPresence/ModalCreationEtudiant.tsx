import React, { useState } from 'react';
import { Alert, TextField, Button, Stack } from '@mui/material';
import { Modal } from '../../../../../components/Modal';
import { createEtudiant } from '../../../../../contracts/etudiants';

interface ModalCreationEtudiantProps {
    onClose: () => void;
    onEtudiantCree: (numeroEtudiant: number) => Promise<void>;
    initialNumeroEtudiant?: string;
    isSubmitting?: boolean;
}

export const ModalCreationEtudiant: React.FC<ModalCreationEtudiantProps> = ({
    onClose,
    onEtudiantCree,
    initialNumeroEtudiant,
    isSubmitting,
}) => {
    const [numeroEtudiant, setNumeroEtudiant] = useState(initialNumeroEtudiant ?? '');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async () => {
        const numero = Number(numeroEtudiant.trim());
        const data = {
            nom: nom.trim(),
            prenom: prenom.trim(),
        };

        if (Number.isInteger(numero) && numero > 0 && data.nom && data.prenom) {

            try {
                const response = await createEtudiant({
                    numeroEtudiant: numero,
                    nom: data.nom,
                    prenom: data.prenom,
                });

                if (response.error || !response.data) {
                    setErrorMessage(response.error ?? "Erreur lors de la création de l'étudiant.");
                    return;
                }

            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "Erreur lors de la création de l'étudiant.");
                return;
            }

            onEtudiantCree(numero);
            onClose();
        }
    };

    const handleClose = () => {
        setNumeroEtudiant('');
        setNom('');
        setPrenom('');
        onClose();
    };

    return (
        <Modal onClose={handleClose} titre={'Création d\'un étudiant'} width="400px">
            <Stack spacing={2} sx={{ p: 4 }}>
                <TextField
                    fullWidth
                    value={numeroEtudiant}
                    onChange={(e) => setNumeroEtudiant(e.target.value)}
                    label="Numéro étudiant"
                    variant="outlined"
                    type="text"
                    inputProps={{ inputMode: 'numeric' }}
                />
                <TextField
                    fullWidth
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    label="Nom"
                    variant="outlined"
                />
                <TextField
                    fullWidth
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    label="Prénom"
                    variant="outlined"
                />
                {errorMessage && (
                    <Alert severity="error">
                        {errorMessage}
                    </Alert>
                )}
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    Annuler
                </Button>

                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={
                        !numeroEtudiant.trim()
                        || !Number.isInteger(Number(numeroEtudiant.trim()))
                        || Number(numeroEtudiant.trim()) <= 0
                        || !nom.trim()
                        || !prenom.trim()
                        || isSubmitting
                    }
                >
                    {isSubmitting ? 'Création...' : 'Créer'}
                </Button>
            </Stack>
        </Modal>
    );
};
