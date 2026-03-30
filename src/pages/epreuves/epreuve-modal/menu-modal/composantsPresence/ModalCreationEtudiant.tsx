import React, { useState } from 'react';
import {
    TextField,
    Button,
    Stack,
} from '@mui/material';
import { Modal } from '../../../../../components/Modal';

interface ModalCreationEtudiantProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { nom: string; prenom: string }) => void;
}

export const ModalCreationEtudiant: React.FC<ModalCreationEtudiantProps> = ({
    onClose,
    onSubmit,
}) => {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');

    const handleSubmit = () => {
        if (nom.trim() && prenom.trim()) {
            onSubmit({ nom: nom.trim(), prenom: prenom.trim() });
            setNom('');
            setPrenom('');
        }
    };

    const handleClose = () => {
        setNom('');
        setPrenom('');
        onClose();
    };

    return (
        <Modal onClose={handleClose} titre={'Création d\'un étudiant'}>
            <Stack spacing={2} sx={{ p: 4 }}>
                <TextField
                    fullWidth
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Nom de l'étudiant"
                    variant="outlined"
                />
                <TextField
                    fullWidth
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Prénom de l'étudiant"
                    variant="outlined"
                />
            </Stack>
        
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
                <Button onClick={handleClose} color="inherit">
                    Annuler
                </Button>
                
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!nom.trim() || !prenom.trim()}
                >
                    Créer
                </Button>
            </Stack>
        </Modal>
    );
};
