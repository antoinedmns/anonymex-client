import react from 'react';
import { Modal } from '../../../../../components/Modal';
import { deleteSession } from '../../../../../contracts/sessions';
import { Box, Typography, Button } from '@mui/material';

type Props = {
    session: {
        id: number;
        nom: string;
        annee: number;
    };
    onClose: () => void;
    onSuccess: () => void;
};

export default function ModalArchivageSession({ session, onClose, onSuccess }: Props) {

    const [isLoading, setIsLoading] = react.useState(false);

    const handleDelete = async () => {
        setIsLoading(true);

        // TODO : remplacer deleteSession par un update pour changer le statut de la session en "archivée" au lieu de la supprimer définitivement
        const response = await deleteSession(session.id);

        if (response.status !== 200) {
            console.error("Erreur lors de l'archivage de la session :", response.error || "Inconnue");
            setIsLoading(false);
            return;
        }

        setIsLoading(false);
        //TODO : afficher une snackbar de succès "Session archivée avec succès" + ajout de la session dans la section "Sessions archivées" de la page d'accueil
        onSuccess();
    };

    return (
        <>
            <Modal onClose={onClose} titre={`Archiver "${session.nom} - ${session.annee}" ?`} newbgcolor="#acacac" width='600px'>
                <Typography variant="body1" sx={{ margin: 2 }}>
                    Cette session sera déplacée dans les sessions archivées. 
                    Vous pourrez la restaurer à tout moment depuis la page d’accueil.
                </Typography>

                <Box display="flex" justifyContent="flex-end" gap={2} margin={3}>
                    <Button onClick={onClose} color="inherit">Annuler</Button>
                    <Button onClick={handleDelete} disabled={isLoading} variant="contained" color="inherit">Archiver</Button>
                </Box>
            </Modal>
        </>
    )
}