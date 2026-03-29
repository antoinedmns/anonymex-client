import { Button, Divider, Stack, Typography } from '@mui/material';
import type { APIEpreuve } from '../../../../contracts/epreuves';
import AnonymatCard from './composantsPresence/AnonymatCard';
import { getConvocationsSupplementaires, type APIListeConvocations } from '../../../../contracts/convocations';
import React from 'react';

type MenuPresenceProps = {
    epreuve: APIEpreuve;
}

export default function MenuPresence({ epreuve }: MenuPresenceProps) {

    const listeCodesAnonymatSupplementaires: APIListeConvocations = {
        convocations: [
            {
                idSession: epreuve.session,
                codeAnonymat: "ZPOLOP",
                codeEpreuve: epreuve.code,
                codeSalle: epreuve.salles[0],
            },
            {
                idSession: epreuve.session,
                codeAnonymat: "ZAELKE",
                codeEpreuve: epreuve.code,
                codeSalle: epreuve.salles[0],
            },
            {
                idSession: epreuve.session,
                codeAnonymat: "ZTRUIO",
                codeEpreuve: epreuve.code,
                codeSalle: epreuve.salles[0],
            },
            {
                idSession: epreuve.session,
                codeAnonymat: "ZPLMNB",
                codeEpreuve: epreuve.code,
                codeSalle: epreuve.salles[0],
            }
        ]
    };


    const [listeConvoc, setListeConvoc] = React.useState<APIListeConvocations>();

    async function fetchCodesAnonymatSupplementaires() {
        const response = await getConvocationsSupplementaires(epreuve.session, epreuve.code);

        if (response.status !== 200 || !response.data) {
            console.error("Erreur lors de la récupération des codes d'anonymat supplémentaires :", response.status);
            return;
        } else {
            setListeConvoc(response.data);
            console.log("Codes d'anonymat supplémentaires récupérés :", response.data.convocations);
        }
    }

    React.useEffect(() => {
        fetchCodesAnonymatSupplementaires();
    }, [epreuve.session, epreuve.code]);


    return (
        <>
            <Stack direction="row" spacing={4} alignItems="flex-start" justifyContent={'space-evenly'} padding={4}>

                {/* Partie gauche du menu de présence (Input et confirmation ) */}
                <Stack direction="column" spacing={2} alignItems="flex-start" mt={4}>
                    <Typography variant="subtitle1">
                        Nombre d'étudiants présents :
                        {/* TODO : Afficher le nombre d'étudiants présents (barre de rpogression?)*/}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={/* handleConfirmPresence */() => { }}>
                        Confirmer les modifications
                    </Button>
                </Stack>

                <Divider orientation="vertical" flexItem />

                {/* Partie droite du menu de présence (Codes d'anonymat supplémentaires) */}
                <Stack direction="column" spacing={2} alignItems="flex-start" mt={4}>
                    <Typography variant="h5" fontWeight={'bold'}>
                        Codes d'anonymat supplémentaires
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Associer chaque code d'anonymat supplémentaire attribué à un étudiant :
                    </Typography>

                    {/* TODO : Afficher la liste des codes d'anonymat supplémentaires avec un champ de saisie pour associer un étudiant (peut-être un select/autocomplete avec les étudiants de la session ou inscrits à l'epreuve ?) */}
                    <Stack direction="column" spacing={1} alignItems="flex-start" width={"100%"}>

                        {listeConvoc?.convocations && listeConvoc.convocations.length > 0 ? listeConvoc.convocations.map((convoc) => (
                            <AnonymatCard key={convoc.codeAnonymat + convoc.idSession} codeAnonymat={convoc.codeAnonymat} />
                        )) :

                            listeCodesAnonymatSupplementaires.convocations.map((convoc) => (
                                <AnonymatCard key={convoc.codeAnonymat + convoc.idSession} codeAnonymat={convoc.codeAnonymat} />
                            ))
                        }
                    </Stack>
                </Stack>
            </Stack>
        </>
    );

}