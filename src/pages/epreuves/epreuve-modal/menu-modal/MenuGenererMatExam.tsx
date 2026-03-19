import { colors, Stack, Typography } from "@mui/material";
import ItemMaterielExamen from "./composantsGenerer/ItemMaterielExamen";
import { useState } from "react";
import VisualiserMaterielExamen from "./composantsGenerer/VisualiserMaterielExamen";

import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import GroupIcon from '@mui/icons-material/Group';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';

interface MenuGenererMatExamProps {
    menuColor?: string;
    idSession: string;
    codeEpreuve: string;
}

function MenuGenererMatExam(props: MenuGenererMatExamProps) {

    const [afficherMenu, setAfficherMenu] = useState<boolean>(true);
    const [pdfPage, setPdfPage] = useState<boolean>(false);
    const [documentSelectionne, setDocumentSelectionne] = useState<1 | 2 | 3>(1);
    const [documentTelecharge, setDocumentTelecharge] = useState<boolean[]>([false, false, false]);

    const handleClickBordereaux = () => {
        setDocumentSelectionne(1);
        setPdfPage(true);
    }

    const handleClickCoupons = () => {
        setDocumentSelectionne(2);
        setPdfPage(true);
    }

    const handleClickListes = () => {
        setDocumentSelectionne(3);
        setPdfPage(true);
    }


    return <>


        {/* Affichage des documents à télécharger */}
        {pdfPage &&
            <Stack>

                <VisualiserMaterielExamen
                    idSession={props.idSession}
                    codeEpreuve={props.codeEpreuve}
                    documentSelectionne={documentSelectionne}
                    setPDFpage={setPdfPage} color={props.menuColor ?? colors.grey[200]}
                    documentTelecharge={documentTelecharge}
                    setDocumentTelecharge={setDocumentTelecharge} />

            </Stack>
        }

        {/* Menu documents à télécharger */}
        {pdfPage == false ?

            <Stack mt={8} direction="column" alignItems="center" color={colors.grey[700]} >
                <Typography variant="h6" marginBottom={5} fontWeight={500} > Choisissez un document à télécharger </Typography>
                <Stack direction="column" spacing={2} alignItems="center" >
                    <ItemMaterielExamen titre="Bordereaux" sousTitre="Telechargé le 19/02/2025" color={props.menuColor + "1F"} termine={documentTelecharge[0]} handleClick={handleClickBordereaux} icone={<LocalPrintshopIcon sx={{ color: colors.grey[800] }} />} />
                    <ItemMaterielExamen titre="Coupons d'identification" sousTitre="Telechargé le 19/02/2025" color={props.menuColor + "1F"} termine={documentTelecharge[1]} handleClick={handleClickCoupons} icone={<GroupIcon sx={{ color: colors.grey[800] }} />} />
                    <ItemMaterielExamen titre="Listes d'émargement" sousTitre="Telechargé le 19/02/2025" color={props.menuColor + "1F"} termine={documentTelecharge[2]} handleClick={handleClickListes} icone={<ContactEmergencyIcon sx={{ color: colors.grey[800] }} />} />
                </Stack>
            </Stack>
            : null
        }
    </>;
}

export default MenuGenererMatExam;