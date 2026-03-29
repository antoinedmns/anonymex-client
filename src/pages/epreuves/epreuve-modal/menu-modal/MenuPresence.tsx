import { Button, Stack, Typography } from '@mui/material';
import type { APIEpreuve } from '../../../../contracts/epreuves';
import AnonymatCard from './composantsPresence/AnonymatCard';

type MenuPresenceProps = {
    epreuve: APIEpreuve;
}

export default function MenuPresence() {


    return (
        <>
            {/* Partie gauche du menu de présence (Input et confirmation ) */}
            <Stack direction="column" spacing={2} alignItems="flex-start" mt={4}>
                <Typography variant="h5" fontWeight={'bold'}>
                    Nombre d'étudiants présents :
                    {/* TODO : Afficher le nombre d'étudiants présents (barre de rpogression?)*/}
                </Typography>
                <Button variant="contained" color="primary" onClick={/* handleConfirmPresence */() => { }}>
                    Confirmer les modifications
                </Button>
            </Stack>

            {/* Partie droite du menu de présence (Codes d'anonymat supplémentaires) */}
            <Stack direction="column" spacing={2} alignItems="flex-start" mt={4}>
                <Typography variant="h5" fontWeight={'bold'}>
                    Codes d'anonymat supplémentaires :
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Associer chaque code d'anonymat supplémentaire attribué à un étudiant :
                </Typography>

                {/* TODO : Afficher la liste des codes d'anonymat supplémentaires avec un champ de saisie pour associer un étudiant (peut-être un select/autocomplete avec les étudiants de la session ou inscrits à l'epreuve ?) */}
                <Stack direction="column" spacing={1} alignItems="flex-start">
                    <AnonymatCard codeAnonymat="ZPOLOP" />
                    <AnonymatCard codeAnonymat="ZAELKE" />
                    <AnonymatCard codeAnonymat="ZKIBIDI" />
                </Stack>
            </Stack>
        </>
    );

}