import { InputAdornment, Stack, Typography, Menu, MenuItem } from "@mui/material";
import React, { useEffect } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { getSuggestionsIncident, corrigerIncident, type APIIncident } from "../../../../../contracts/incidents";
import { URL_API_BASE } from "../../../../../utils/api";
import { blue, grey } from "@mui/material/colors";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconRondV2 from "../../../../../components/IconesRondV2";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import MyTextField from "../textfields/MyTextField";
import CircularProgress from '@mui/material/CircularProgress';
import BoutonStandard from "../../components/BoutonStantard";


interface IncidentDetailProps {
    incident: APIIncident;
    onClick: () => void;
    onClose: (id: number) => void;
    ajouterIncident: (incident: APIIncident) => void;
    retirerIncident: (idIncident: number) => void;
    setOuvertSucces: (open: boolean) => void;
    setOuvertEchec: (open: boolean) => void;
    setMessageSnackbar: (message: string) => void;
}


export default function IncidentDetail(props: IncidentDetailProps) {

    const [numero, setNumero] = React.useState<string | undefined>(props.incident.codeAnonymat);
    const [noteQuart, setNoteQuart] = React.useState<number | undefined>(props.incident.noteQuart);
    const [fichier, setFichier] = React.useState<string>("");
    const [loading, setLoading] = React.useState(true);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const [envoiOK, setEnvoiOK] = React.useState<boolean>(false);

    const [errors, setErrors] = React.useState({
        note: "",
        numero: ""
    });

    useEffect(() => {
        console.log("Valeur note & numero, " + noteQuart + " & " + numero);
    }, [noteQuart, numero]);

    const handleClickSuggestions = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseSuggestions = () => {
        setAnchorEl(null);
    }

    async function getSuggestions(numero: string) {
        if (numero === null || numero === undefined || numero.length <= 3) {
            setSuggestions([]);
            return;
        }
        const suggestions = await getSuggestionsIncident(props.incident.idSession, props.incident.codeEpreuve, numero);
        console.log("Suggestions récupérées :", suggestions);
        if (suggestions.data) {
            setSuggestions(suggestions.data);
        }
    }
    useEffect(() => {

        setSuggestions([]);

        if (!props.incident || !props.incident.idIncident) {
            console.error("Incident invalide :", props.incident);
            return;
        }
        console.log("Récupération du fichier de l'incident N°" + props.incident.idIncident);

        const getFichier = async () => {
            const rep = await fetch(`${URL_API_BASE}/documents/incidents/${props.incident.idIncident}/scan.webp`);
            getSuggestions(props.incident.codeAnonymat ?? "");

            setFichier(rep.url);
            setNoteQuart(props.incident.noteQuart);
            setNumero(props.incident.codeAnonymat);
            console.log("Suggestions récupérées :", suggestions);
            setLoading(false);
        }

        try {
            getFichier();
        } catch (error) {
            console.error("Erreur lors de la récupération du fichier de l'incident :", error);
            setLoading(false);
        }

    }, [props.incident]);


    const handleViewFile = (url: string) => {
        const previewWindow = window.open(url, "_blank", "noopener,noreferrer");
        if (previewWindow) {
            previewWindow.focus();
        }
    };



    async function appelerAPI(numero: string | undefined, note: number | undefined) {
        const res = await corrigerIncident(props.incident.idSession, props.incident.codeEpreuve, props.incident.idIncident, numero!, note!);
        console.log("Résultat de la correction de l'incident :", res);
        if (res.data?.success === true) {
            props.onClose(props.incident.idIncident);
            if (res.data?.incidents) {
                res.data.incidents.forEach(incident => {
                    props.ajouterIncident(incident);
                });
                props.retirerIncident(props.incident.idIncident);
            }
            else {
                props.retirerIncident(props.incident.idIncident);
            }
            props.setOuvertSucces(true);
            props.setMessageSnackbar("Incident corrigé avec succès !");
        }
        else {
            if (res.data?.message) {
                props.setMessageSnackbar(res.data.message);
            }
            else {
                props.setMessageSnackbar("Échec de la correction de l'incident. Veuillez réessayer.");
            }
            if (res.data?.suggestions) {
                setSuggestions(res.data.suggestions);
            }
            props.setOuvertEchec(true);
        }
    }

    function formulaireEstValide(numero: string | undefined, note: number | undefined): boolean {
        setErrors({ note: "", numero: "" });

        const newErrors = {
            note: "",
            numero: ""
        };

        if (note === undefined || note === null) {
            newErrors.note = "La note est requise.";
        } else if (note < 0 || note > 20) {
            newErrors.note = "La note doit être comprise entre 0 et 20.";
        } else if (isNaN(note)) {
            newErrors.note = "La note doit être un nombre.";
        }

        if (numero === null || numero === undefined || numero.trim() === "") {
            newErrors.numero = "Le numéro d'anonymat est requis.";
        } else if (numero.length > 6) {
            newErrors.numero = "Max 6 caractères.";
        }

        const hasError = newErrors.note || newErrors.numero;
        setErrors(newErrors);

        if (!hasError) {
            return true
        }
        return false;

    }

    async function envoiCorrection(numero: string | undefined, noteValue: number | undefined) {
        if (formulaireEstValide(numero, noteValue)) {
            await appelerAPI(numero, noteValue!);
        }
    }




    return (

        <Stack direction={"row"} justifyContent="space-between" alignItems="center" spacing={3}>



            <Stack width={"70%"}>
                <TransformWrapper  >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <Stack direction={"column"} p={1}>
                            <Stack gap={2} direction="row" justifyContent="space-between" alignItems="center" mb={1} borderRadius={1}>
                                <BoutonStandard height={30} color={blue[300]} onClick={props.onClick} icone={<ArrowBackIosIcon />}>
                                    Retour
                                </BoutonStandard>

                                <Stack direction="row" gap={1} justifyContent="center">
                                    <IconRondV2 onClick={() => zoomIn()}>
                                        <ZoomInIcon />
                                    </IconRondV2>
                                    <IconRondV2 onClick={() => zoomOut()}>
                                        <ZoomOutIcon />
                                    </IconRondV2>
                                    <IconRondV2 onClick={() => resetTransform()}>
                                        <RestartAltIcon />
                                    </IconRondV2>
                                    <IconRondV2 onClick={() => handleViewFile(fichier)}>
                                        <RemoveRedEyeIcon />
                                    </IconRondV2>
                                </Stack>
                            </Stack>
                            <Stack border={`2px solid ${grey[200]}`} borderRadius={1}  >
                                <TransformComponent wrapperStyle={{ width: "100%", height: "470px", }} >
                                    {loading ? (
                                        <Stack width="100%" height="470px" justifyContent="center" alignItems="center">
                                            <CircularProgress />
                                        </Stack>
                                    ) : (
                                        <img
                                            src={fichier}
                                            alt={"Scan incident " + props.incident.idIncident} //{"Image de l'incident N°" + props.incident.idIncident} 
                                            style={{ maxWidth: "100%", height: "470px" }}
                                        />
                                    )}

                                </TransformComponent>
                            </Stack>
                        </Stack>
                    )}
                </TransformWrapper>
            </Stack>

            <Stack direction={"column"} width={"30%"} justifyContent={"center"} height={"100%"}>

                <Stack spacing={2} >
                    <MyTextField
                        type="text"
                        label="Numéro Anonymat"
                        value={numero}
                        onChange={(e) => {
                            getSuggestions(e.target.value);
                            const val = e.target.value;
                            setNumero(val);
                            setEnvoiOK(formulaireEstValide(val, noteQuart));
                        }} error={!!errors.numero}
                        helperText={errors.numero}
                    />
                    <Stack direction="row" alignItems="center" >
                        <MyTextField
                            type="number"
                            label="Note"
                            shrink={true}
                            value={noteQuart !== undefined ? (noteQuart / 4).toString() : ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setNoteQuart(Number(val) * 4);
                                if (formulaireEstValide(numero, Number(val) * 4)) {
                                    setEnvoiOK(true);
                                } else {
                                    setEnvoiOK(false);
                                }
                            }}
                            error={!!errors.note}
                            helperText={errors.note}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <KeyboardArrowUpIcon
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => setNoteQuart((prev) => prev !== undefined ? Math.min(prev + 1, 80) : 0)}
                                        />
                                        <KeyboardArrowDownIcon
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => setNoteQuart((prev) => prev !== undefined ? Math.max(prev - 1, 0) : 0)}
                                        />
                                    </InputAdornment>
                                ),
                                min: 0,
                                max: 80
                            }}

                        />

                    </Stack>
                    <BoutonStandard disabled={!envoiOK} color={blue[500]} onClick={() => envoiCorrection(numero, noteQuart)}>
                        Corriger
                    </BoutonStandard>


                    <BoutonStandard disabled={suggestions.length === 0} color={grey[500]} onClickParam={handleClickSuggestions}>
                        Suggestions
                    </BoutonStandard>
                    <Menu
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleCloseSuggestions}
                        sx={{ width: "100%", "& .MuiPaper-root": { width: 150 } }}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center"
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "center"
                        }}

                    >
                        {suggestions.map((suggestion, index) => (
                            <MenuItem
                                key={index}
                                onClick={() => { setNumero(suggestion); }}
                                sx={{ justifyContent: "center", height: 30, backgroundColor: "transparent", fontSize: 20, fontWeight: 400 }}
                            >
                                {suggestion}
                            </MenuItem>
                        ))}
                    </Menu>


                </Stack>
            </Stack>
        </Stack>

    );
}