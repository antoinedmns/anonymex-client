import { colors, Menu, MenuItem, Select, Stack, Typography } from "@mui/material";

import MenuIcon from '@mui/icons-material/Menu';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

import IconRondV2 from "../../../../../components/IconesRondV2";

import { Add } from "@mui/icons-material";
import { useState } from "react";

interface EpreuveSallesCompoProps {
    salle: string;
    sallesDispo?: { nom: string, nbEtudiants: number }[];
    nbEtudiants: number;
    nbEtuMMax: number;
    color?: string;
    onTransfert: (sallesDepart: string[], salleArrivee: string) => void;
    onAjouter: (salle: string) => void;
    onDetails: (salle: string) => void;
}

function couleurPourcentage(nbEtudiants: number, nbEtuMMax: number, color?: string): string {

    const couleurs = [color + "50", color + "60", color + "65", color + "75"];

    const pourcent = (nbEtudiants / nbEtuMMax) * 100;

    return couleurs[Math.min(Math.floor(pourcent / 25), 3)];
}


function EpreuveSallesCompo({ salle, nbEtudiants, nbEtuMMax, color, onTransfert, onAjouter, onDetails, sallesDispo }: EpreuveSallesCompoProps) {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClickTransfert = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleSelectTransfert = (value: string) => {
        setAnchorEl(null);
        onTransfert([salle], value);
    }

    const handleClose = () => {
        setAnchorEl(null);

    };

    return (
        <Stack width={"100%"} direction="row" alignItems={"center"} justifyContent="space-between" bgcolor={colors.grey[200] + "60"} padding={1} borderColor={colors.blue[100]} borderRadius={2}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Stack alignItems={"center"} p={1} width={50} height={50} justifyContent={"center"} borderRadius={1} sx={{ bgcolor: couleurPourcentage(nbEtudiants, nbEtuMMax, color) }}>
                    <Typography fontWeight={"bold"}> {nbEtudiants} </Typography>
                </Stack>
                <Stack>
                    <Typography fontWeight={500}> {salle} </Typography>
                    <Typography sx={{ color: colors.grey[600] }}> {nbEtudiants} étudiants </Typography>
                </Stack>
            </Stack>

            <Stack direction="row" spacing={2} p={1}>

                <IconRondV2
                    onClickParam={(e) => handleClickTransfert(e as React.MouseEvent<HTMLElement>)}
                    sx={{ bgcolor: color + "60", '&:hover': { bgcolor: color + "AF" } }}
                    children={<SyncAltIcon />}
                    tooltip="Transfert"
                />
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    {sallesDispo?.map((salleDispo) => (
                        <MenuItem key={salleDispo.nom} onClick={() => handleSelectTransfert(salleDispo.nom)}>
                            {salleDispo.nom}
                        </MenuItem>
                    ))}
                </Menu>
                <IconRondV2 onClickParam={() => onAjouter(salle)} sx={{ bgcolor: color + "60", '&:hover': { bgcolor: color + "AF" } }} children={<Add />} tooltip="Ajouter étudiants" />
                <IconRondV2 onClickParam={() => onDetails(salle)} sx={{ bgcolor: color + "60", '&:hover': { bgcolor: color + "AF" } }} children={<MenuIcon />} tooltip="Détails" />
            </Stack>

        </Stack >
    );
}

export default EpreuveSallesCompo;