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

export default function ModalSuppressionSession({ session, onClose, onSuccess }: Props) {

    const [isLoading, setIsLoading] = react.useState(false);

    const handleDelete = async () => {
        setIsLoading(true);

        const response = await deleteSession(session.id);

        if (response.status !== 200) {
            console.error("Erreur lors de la suppression de la session :", response.error || "Inconnue");
            setIsLoading(false);
            return;
        }

        setIsLoading(false);
        onSuccess();
    };

    return (
        <>
            <Modal onClose={onClose} titre={`Supprimer "${session.nom} - ${session.annee}" ?`} newbgcolor="#FFA8A4" width='600px'>
                <Typography variant="body1" sx={{ margin: 2 }}>
                    Cette session et toutes ses épreuves seront définitivement supprimées après un délai de 3 jours.
                    Êtes-vous sûr de vouloir continuer ?
                </Typography>

                <Box display="flex" justifyContent="flex-end" gap={2} margin={3}>
                    <Button onClick={onClose} color="inherit">Annuler</Button>
                    <Button onClick={handleDelete} disabled={isLoading} variant="contained" color="error">Supprimer</Button>
                </Box>
            </Modal>
        </>
    )
}