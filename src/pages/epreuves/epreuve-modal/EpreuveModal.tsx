import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Modal } from "../../../components/Modal";
import { useModal } from "../../../contexts/ModalContext";
import { useEpreuvesCache } from "../../../contexts/EpreuvesCacheContext";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import DetailsEpreuve from "./menu-modal/MenuDetailsEpreuve";
import MenuListeEtudiants from "./menu-modal/MenuListeEtudiants";
import MenuGenererMatExam from "./menu-modal/MenuGenererMatExam";
import { IncidentsComplets } from "./menu-modal/composantsIncidents/IncidentsComplets";

import { colors, Stack } from "@mui/material";

import { themeEpreuves } from "../../../theme/epreuves";
import { MenuScanCopies } from "./menu-modal/MenuScanCopies";
import MenuPresence from "./menu-modal/MenuPresence";


export interface EpreuveModalProps {
    codeEpreuve: string;
    sessionId: string;
    tab?: string | null;
}

export function EpreuveModal({ codeEpreuve, sessionId, tab }: EpreuveModalProps) {
    const { fermer } = useModal();
    const { getEpreuveByCode, incrementEpreuveIncidents } = useEpreuvesCache();
    const epreuveActive = getEpreuveByCode(codeEpreuve);
    const [numeroOnglet, setNumeroOnglet] = useState(0);
    const incidentsCount = epreuveActive?.incidents ?? 0;
    const [salleDefault, setSalleDefault] = useState<string>("x");
    const [salleDefaultNumb, setSalleDefaultNumb] = useState<number>(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setNumeroOnglet(newValue);
    };

    const appliquerDeltaIncidents = useCallback((delta: number) => {
        incrementEpreuveIncidents(codeEpreuve, delta);
    }, [codeEpreuve, incrementEpreuveIncidents]);

    const handleIncidentCreated = useCallback(() => {
        appliquerDeltaIncidents(1);
    }, [appliquerDeltaIncidents]);

    const handleIncidentResolved = useCallback(() => {
        appliquerDeltaIncidents(-1);
    }, [appliquerDeltaIncidents]);

    const tabs = useMemo(() => {
        if (!epreuveActive) return [];

        return [
            {
                label: "Details",
                content: <DetailsEpreuve epreuve={epreuveActive} setNumeroOnglet={setNumeroOnglet} setSalleDefault={setSalleDefault} setSalleDefaultNumb={setSalleDefaultNumb} />
            },
            {
                label: "Liste étudiants",
                content: (
                    <MenuListeEtudiants
                        codeEpreuve={epreuveActive.code}
                        idSession={epreuveActive.session}
                        statut={epreuveActive.statut}
                        menuColor={epreuveActive.statut == 1 ? undefined : themeEpreuves.status[epreuveActive.statut]}
                        salleDefault={salleDefault}
                    />
                )
            },

            ...(epreuveActive.statut <= 2 ? [{
                label: "Générer matériel d'examen",
                content: <MenuGenererMatExam menuColor={themeEpreuves.status[epreuveActive.statut]} idSession={sessionId} codeEpreuve={epreuveActive.code} />
            }] : []),

            ...(epreuveActive.statut === 3 || epreuveActive.statut === 6 ? [{
                label: "Scanner copies",
                content: <MenuScanCopies codeUE={epreuveActive.code} idSession={sessionId} menuColor={themeEpreuves.status[epreuveActive.statut]} onIncidentCreated={handleIncidentCreated} onIncidentResolved={handleIncidentResolved} />
            }] : []),

            ...(epreuveActive.statut >= 3 && incidentsCount > 0 ? [{
                label: `Incidents (${incidentsCount})`,
                content: <IncidentsComplets idSession={Number(sessionId)} epreuveCode={epreuveActive.code} onIncidentCreated={handleIncidentCreated} onIncidentResolved={handleIncidentResolved} />
            }] : []),

            ...(epreuveActive.statut >= 3 ? [{
                label: "Présence",
                content: <MenuPresence epreuve={epreuveActive} salleDefaultNumb={salleDefaultNumb} />
            }] : []),

            ...(epreuveActive.statut >= 3 ? [{
                label: "Export",
                content: <MenuScanCopies codeUE={epreuveActive.code} idSession={sessionId} menuColor={themeEpreuves.status[epreuveActive.statut]} />
            }] : [])
        ];
    }, [epreuveActive, handleIncidentCreated, handleIncidentResolved, incidentsCount, sessionId, salleDefault, salleDefaultNumb]);

    useEffect(() => {
        if (!tab) return;

        const index = tabs.findIndex((item) => item.label.toLowerCase().includes(tab.toLowerCase()));
        if (index >= 0) {
            setNumeroOnglet(index);
        }
    }, [tab, tabs]);

    useEffect(() => {
        if (numeroOnglet > tabs.length - 1) {
            setNumeroOnglet(Math.max(0, tabs.length - 1));
        }
    }, [numeroOnglet, tabs.length]);

    if (!epreuveActive) {
        return null;
    }

    return (
        <Modal titre={epreuveActive.code} onClose={() => { fermer(); }} width="1200px" height="650px" newbgcolor={themeEpreuves.status[epreuveActive.statut] + '4F'}>
            <Stack>
                <Stack >
                    <Tabs
                        variant="fullWidth"
                        value={numeroOnglet}
                        onChange={handleChange}
                        textColor="primary"
                        sx={{
                            width: '100%',
                            bgcolor: themeEpreuves.status[epreuveActive.statut] + '4F',
                            '& .MuiTab-root': { color: colors.grey[800] },
                            '& .MuiTab-root.Mui-selected': { color: colors.grey[900] },
                            '& .MuiTab-root:hover': { backgroundColor: themeEpreuves.status[epreuveActive.statut] + '20' },
                            '& .MuiTabs-indicator': { backgroundColor: themeEpreuves.status[epreuveActive.statut] + 'FF' }
                        }}
                    >
                        {tabs.map((tab, index) => (
                            <Tab key={index} label={tab.label} />
                        ))}
                    </Tabs>
                </Stack>
                <Stack padding={2}>
                    {tabs[numeroOnglet]?.content}
                </Stack>
            </Stack>
        </Modal >

    );
}