import React from "react";

import { Modal } from "../../../components/Modal";
import { useModal } from "../../../contexts/ModalContext";
import { type APIEpreuve } from "../../../contracts/epreuves";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import DetailsEpreuve from "./menu-modal/MenuDetailsEpreuve";
import MenuListeEtudiants from "./menu-modal/MenuListeEtudiants";
import MenuGenererMatExam from "./menu-modal/MenuGenererMatExam";

import { useState } from "react";
import { colors, Stack } from "@mui/material";

import { themeEpreuves } from "../../../theme/epreuves";
import { MenuScanCopies } from "./menu-modal/MenuScanCopies";

export interface EpreuveModalProps {
    epreuve: APIEpreuve;
}

export function EpreuveModal({ epreuve }: EpreuveModalProps) {
    const { fermer } = useModal();

    const [numeroOnglet, setNumeroOnglet] = useState<0 | 1 | 2>(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: 0 | 1 | 2) => {
        setNumeroOnglet(newValue);
    };

    return (

        <Modal titre={epreuve.code} onClose={fermer} width="1000px" height="600px" newbgcolor={themeEpreuves.status[epreuve.statut] + '4F'}>
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
                        {epreuve.statut === 1 || epreuve.statut === 2 ? (
                            <Tab label="Générer matériel d'examen" />
                        ) : null}
                        {epreuve.statut === 3 ? (
                            <Tab label="Scanner copies" />
                        ) : null}
                        {epreuve.statut === 4 || epreuve.statut === 5 ? (
                            <Tab label="Copies scannées" />
                        ) : null}
                    </Tabs>
                </Stack>
                <Stack width={"100%"} padding={2} height={"100%"}>
                    {numeroOnglet === 0 && <DetailsEpreuve epreuve={epreuve} />}
                    {numeroOnglet === 1 && <MenuListeEtudiants statut={epreuve.statut} menuColor={epreuve.statut == 1 ? undefined : themeEpreuves.status[epreuve.statut]} />}

                    {numeroOnglet === 2 && epreuve.statut <= 2 && <MenuGenererMatExam menuColor={themeEpreuves.status[epreuve.statut]} />}
                    {numeroOnglet === 2 && epreuve.statut >= 3 && <MenuScanCopies codeUE={epreuve.code} menuColor={themeEpreuves.status[epreuve.statut]} />}

                </Stack>
            </Stack>
        </Modal>

    );
}