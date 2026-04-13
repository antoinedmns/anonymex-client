import react from 'react';
import { Modal } from '../../../../../components/Modal';
import { deleteSession } from '../../../../../contracts/sessions';
import { Typography, Stack } from '@mui/material';
import { SessionModalBouton } from '../composantsFormulaireSession';

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
                <Stack justifyContent={'space-between'} flexDirection={'column'} gap={2} margin={4}>

                    <Typography variant="body1">
                        Cette session et toutes ses épreuves seront définitivement supprimées instantanément.
                        Êtes-vous sûr de vouloir continuer ?
                    </Typography>

                    <SessionModalBouton label="Supprimer la session" loading={isLoading} color="error" onClick={handleDelete} />

                </Stack>
            </Modal>
        </>
    )
}