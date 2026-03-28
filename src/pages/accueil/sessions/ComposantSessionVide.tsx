import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import theme from "../../../theme/theme";
import { Add } from "@mui/icons-material";
import SessionParentEtape from "./session-modal/creer-session/SessionParentEtape";


export default function ComposantSessionVide() {

    const [modalOuvert, setModalOuvert] = React.useState(false);

    const openModal = () => {
        setModalOuvert(true);
    };

    return (
        <>
            <Stack justifyContent={'center'} alignItems="center" marginTop={20}>
                <Typography variant="h4" color={theme.palette.text.primary} fontWeight="bold">
                    Aucune session n'a été trouvée
                </Typography>
                <Typography variant="body1" color={theme.palette.text.secondary}>
                    Cliquez sur le bouton ci-dessous pour en créer une nouvelle.
                </Typography>
                <Button variant="contained" size="medium" color="primary" sx={{margin: 3, borderRadius: '20px'}} startIcon={<Add />} onClick={openModal}>
                    Ajouter une session
                </Button>
            </Stack>

        {modalOuvert && (
            <SessionParentEtape onClose={() => setModalOuvert(false)} />
        )}
        </>
    );
}