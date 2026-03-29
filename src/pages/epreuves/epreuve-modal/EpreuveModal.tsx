import React, { useEffect } from "react";

import { Modal } from "../../../components/Modal";
import { useModal } from "../../../contexts/ModalContext";
import { type APIEpreuve } from "../../../contracts/epreuves";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import DetailsEpreuve from "./menu-modal/MenuDetailsEpreuve";
import MenuListeEtudiants from "./menu-modal/MenuListeEtudiants";
import MenuGenererMatExam from "./menu-modal/MenuGenererMatExam";
import { IncidentsComplets } from "./menu-modal/composantsIncidents/IncidentsComplets";

import { useState } from "react";
import { colors, Stack } from "@mui/material";

import { themeEpreuves } from "../../../theme/epreuves";
import { MenuScanCopies } from "./menu-modal/MenuScanCopies";
import { BrowserRouter } from "react-router-dom";
import MenuPresence from "./menu-modal/MenuPresence";


export interface EpreuveModalProps {
    epreuve: APIEpreuve;
    sessionId: string;
    tab?: string | null;
    nbIncidents?: number;
}

export function EpreuveModal({ epreuve, sessionId, tab, nbIncidents }: EpreuveModalProps) {
    const { fermer } = useModal();

    const [numeroOnglet, setNumeroOnglet] = useState<0 | 1 | 2 | 3 | 4>(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: 0 | 1 | 2 | 3 | 4) => {
        setNumeroOnglet(newValue);
    };

    // Gestion route pour ouvrir le modal sur un onglet précis
    useEffect(() => {
        if (tab === "presence") {
            setNumeroOnglet(4);
        }
        if (tab === "scan") {
            setNumeroOnglet(2);
        }
        if (tab === "etudiants") {
            setNumeroOnglet(1);
        }
        if (tab === "details") {
            setNumeroOnglet(0);
        }

    }, [tab]);

    return (
        <BrowserRouter>
            <Modal titre={epreuve.code} onClose={() => { fermer(); }} width="1200px" height="650px" newbgcolor={themeEpreuves.status[epreuve.statut] + '4F'} idSession={sessionId}>
                <Stack>
                    <Stack >
                        <Tabs variant="fullWidth" value={numeroOnglet} onChange={handleChange} textColor="primary"
                            sx={{
                                width: '100%',
                                bgcolor: themeEpreuves.status[epreuve.statut] + '4F',
                                '& .MuiTab-root': { color: colors.grey[800] },
                                '& .MuiTab-root.Mui-selected': { color: colors.grey[900] },
                                '& .MuiTab-root:hover': { backgroundColor: themeEpreuves.status[epreuve.statut] + '20' },
                                '& .MuiTabs-indicator': { backgroundColor: themeEpreuves.status[epreuve.statut] + 'FF' },

                            }}>
                            <Tab label="Details" />
                            <Tab label="Liste étudiants" />
                            {epreuve.statut <= 2 && <Tab label="Générer matériel d'examen" />}
                            {epreuve.statut === 3 && <Tab label="Scanner copies" />}
                            {epreuve.statut >= 3 && nbIncidents !== undefined && nbIncidents > 0 && <Tab label={`Incidents (${nbIncidents})`} />}
                            {epreuve.statut >= 4 && <Tab label="Exporter les notes" />}
                            <Tab label="Présence" />
                        </Tabs>
                    </Stack>
                    <Stack width={"100%"} padding={2} height={"100%"} justifyContent={"center"}>
                        {numeroOnglet === 0 && <DetailsEpreuve epreuve={epreuve} />}
                        {numeroOnglet === 1 && <MenuListeEtudiants statut={epreuve.statut} menuColor={epreuve.statut == 1 ? undefined : themeEpreuves.status[epreuve.statut]} />}
                        {numeroOnglet === 3 && <MenuPresence epreuve={epreuve} />}

                        {numeroOnglet === 2 && epreuve.statut <= 2 && <MenuGenererMatExam menuColor={themeEpreuves.status[epreuve.statut]} idSession={sessionId} codeEpreuve={epreuve.code} />}
                        {numeroOnglet === 2 && epreuve.statut >= 3 && <MenuScanCopies codeUE={epreuve.code} idSession={sessionId} menuColor={themeEpreuves.status[epreuve.statut]} />}
                        {numeroOnglet === 3 && epreuve.statut >= 3 && nbIncidents !== undefined && nbIncidents > 0 && < IncidentsComplets idSession={Number(sessionId)} epreuveCode={epreuve.code} />}


                    </Stack>
                </Stack>
            </Modal >
        </BrowserRouter>

    );
}