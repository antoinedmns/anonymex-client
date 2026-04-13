import { Typography, Stack, colors, FormControl, Select, MenuItem } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BoutonStandard from "../../components/BoutonStantard";
import DownloadIcon from '@mui/icons-material/Download';

import { useEffect, useMemo, useState } from "react";
import { URL_API_BASE } from "../../../../../utils/api";
import { useEpreuvesCache } from "../../../../../contexts/EpreuvesCacheContext";


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
    const { getEpreuveByCode, patchEpreuve } = useEpreuvesCache();
    const epreuve = getEpreuveByCode(props.codeEpreuve);
    const listeSalles = useMemo(() => epreuve?.salles ?? [], [epreuve?.salles]);
    const [sallesSelectionnees, setSallesSelectionnees] = useState<string[]>([]);

    //const [documentUrl, setDocumentUrl] = useState<string>("");

    useEffect(() => {
        setSallesSelectionnees((current) => {
            if (listeSalles.length === 0) {
                return current.length === 0 ? current : [];
            }

            const sallesValides = current.filter((salle) => listeSalles.includes(salle));
            if (sallesValides.length === 0) {
                return listeSalles;
            }

            const estIdentique = sallesValides.length === current.length
                && sallesValides.every((salle, index) => salle === current[index]);

            return estIdentique ? current : sallesValides;
        });
    }, [listeSalles]);

    useEffect(() => {
        if (epreuve?.statut === 1) {
            patchEpreuve(props.codeEpreuve, { statut: 2 });
        }
    }, [epreuve?.statut, patchEpreuve, props.codeEpreuve]);

    //const document = await fetch("https://..."); //
    const documentBaseUrl = props.documentSelectionne === 1 ? URL_API_BASE + "/documents/bordereau.pdf"
        : props.documentSelectionne === 2 ? URL_API_BASE + `/documents/session/${props.idSession}/epreuve/${props.codeEpreuve}/coupons.pdf`
            : URL_API_BASE + "/documents/bordereau.pdf";

    const sallesPourUrl = sallesSelectionnees.length > 0 ? sallesSelectionnees : listeSalles;
    const sallesQuery = sallesPourUrl.length > 0 ? `?salles=${encodeURIComponent(sallesPourUrl.join(","))}` : "";
    const documentUrl = `${documentBaseUrl}${sallesQuery}`;


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
                        title="Document"
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
                                multiple
                                displayEmpty
                                disabled={listeSalles.length === 0}
                                value={sallesSelectionnees}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSallesSelectionnees(typeof value === "string" ? value.split(",") : value);
                                }}
                                renderValue={(selected) => {
                                    const salles = selected as string[];

                                    if (salles.length === 0 || salles.length === listeSalles.length) {
                                        return "Toutes les salles";
                                    }

                                    return salles.join(", ");
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
                                {listeSalles.map((salle) => (
                                    <MenuItem
                                        key={salle}
                                        value={salle}
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