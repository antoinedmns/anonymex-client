import { Divider, Stack, Typography } from "@mui/material";
import { ButtonGererSession, CarteDeSession } from "./composantsSession";
import { Add, Archive, Download } from "@mui/icons-material";
import theme from "../../theme/theme";
import SessionParentEtape from "./session-modal/creer-session/SessionParentEtape";
import { useState } from "react";

type Props = {
    listeSessions: Array<{
        id: number;
        nom: string;
        annee: number;
        statut: 0 | 1 | 2 | 3;
    }>;
    fetchSessions: () => Promise<void>;
};

export default function ComposantSessionPleine({listeSessions, fetchSessions}: Props) {

    const [modalOpen, setModalOpen] = useState(false);

    console.log("ComposantSessionPleine fetchSessions remonté est = ", fetchSessions);

    return (
        <>
            <Stack height="100%" alignItems="center" flexDirection={'row'} divider={<Divider orientation="vertical" flexItem />} gap={6} justifyItems={"center"} mx={1}>

                <Stack gap={4} flexDirection={'column'} width="80%">
                    <Stack flexDirection={'column'} alignItems="start">
                        <Typography variant="h4" color={theme.palette.text.secondary} fontWeight="bold">
                            Liste des sessions
                        </Typography>
                        <Typography variant="body1" color={theme.palette.text.secondary}>
                            Sélectionnez une session en cliquant dessus.
                        </Typography>
                    </Stack>

                    <Stack
                        gap={1}
                        flexDirection="column"
                        width="100%"
                        marginBottom={2}
                        sx={{ overflowY: "auto", overflowX: "hidden" }}
                    >
                        {listeSessions.map((session) => (
                            <CarteDeSession
                                key={session.id}
                                annee={session.annee.toString()}
                                id={session.id}
                                nom={session.nom}
                                nombreStatut={session.statut}
                                fetchSessions={fetchSessions}
                            />
                        ))}
                    </Stack>
                </Stack>

                <Stack flexDirection={'row'} alignSelf={"center"} gap={3} pt={6}>
                    <ButtonGererSession 
                        icone={<Add sx={{fontSize: 79, opacity: 0.6}}/>} 
                        description={"Nouvelle session"} 
                        onClick={() => setModalOpen(true)} 
                    />

                    <ButtonGererSession 
                        icone={<Download sx={{fontSize: 79, opacity: 0.6}}/>} 
                        description={"Importer une session passée"} 
                        onClick={function (): void {} } 
                    />

                    <ButtonGererSession 
                        icone={<Archive sx={{fontSize: 79 , opacity: 0.6}}/>} 
                        description={"Consulter les sessions archivées"} 
                        onClick={function (): void {} } 
                    />
                </Stack>
            </Stack>

            {modalOpen && (
                <SessionParentEtape onClose={() => setModalOpen(false)} />
            )}
        </>
    );
}