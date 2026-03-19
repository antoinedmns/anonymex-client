import { Typography, Stack, colors, FormControl, Select, MenuItem } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BoutonStandard from "../../components/BoutonStantard";
import DownloadIcon from '@mui/icons-material/Download';

import { useState } from "react";
import { URL_API_BASE } from "../../../../../utils/api";


interface PDFPageProps {
    idSession: string;
    codeEpreuve: string;
    documentSelectionne: 1 | 2 | 3;
    setPDFpage: (value: boolean) => void;
    color: string;
    documentTelecharge: boolean[];
    setDocumentTelecharge: (value: boolean[]) => void;
}

const Documents: Record<number, string> = {
    1: "Bordereaux",
    2: "Coupons d'identification",
    3: "Listes d'émargement"
};

export default function VisualiserMaterielExamen(props: PDFPageProps) {

    //const [documentUrl, setDocumentUrl] = useState<string>("");

    //const document = await fetch("https://..."); // 
    const documentUrl = props.documentSelectionne === 1 ? URL_API_BASE + "/documents/bordereau.pdf"
        : props.documentSelectionne === 2 ? URL_API_BASE + `/documents/session/${props.idSession}/epreuve/${props.codeEpreuve}/coupons.pdf`
        : URL_API_BASE + "/documents/bordereau.pdf";

    const listeSalles = ["Aucune", "Salle 1", "Salle 2", "Salle 3"];

    const [salleSelectionnee, setSalleSelectionnee] = useState<number>(0);


    const handleDowload = () => {
        window.open(documentUrl, "_blank");
        const newDocumentTelecharge = [...props.documentTelecharge];
        newDocumentTelecharge[props.documentSelectionne] = true;
        props.setDocumentTelecharge(newDocumentTelecharge);
    }


    return (
        <>



            <Stack direction="row" justifyContent="space-between" spacing={2} >
                <Stack width={"70%"} bgcolor={colors.grey[200]} height={"100%"}>
                    <iframe
                        id="inlineFrameExample"
                        title="Exemple de cadre intégré"
                        width="100%"
                        height="470"
                        src={documentUrl}>
                    </iframe>
                </Stack>
                <Stack width={"30%"} justifyContent={"space-between"}>
                    <Stack color={colors.grey[800]}>
                        <Typography variant="h5" fontWeight={500} mb={4}> {Documents[props.documentSelectionne]} </Typography>

                        <Typography variant="h6" color={colors.grey[700]} mb={1}> Trier par salle </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={salleSelectionnee}
                                onChange={(e) => {
                                    setSalleSelectionnee(e.target.value as number);
                                    console.log(e.target.value);
                                }}
                                variant="standard"
                                disableUnderline
                                sx={{
                                    backgroundColor: colors.grey[200],
                                    borderRadius: "8px",
                                    px: 1.5,
                                    py: 0.5,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: colors.grey[300],
                                    },
                                    "& .MuiSelect-select": {
                                        display: "flex",
                                        alignItems: "center",
                                    },
                                }}
                            >
                                {listeSalles.map((salle, index) => (
                                    <MenuItem
                                        key={index}
                                        value={index}
                                        sx={{
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        {salle}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Stack spacing={1}>
                        <BoutonStandard color={props.color} onClick={() => { handleDowload(); }} icone={<DownloadIcon />} texte="Télécharger" />
                        <BoutonStandard color={colors.grey[500]} onClick={() => { props.setPDFpage(false);; }} icone={<ChevronLeftIcon />} texte="Retour au menu" />
                    </Stack>
                </Stack>
            </Stack >
        </>

    );
}