import { useState, type ReactElement } from 'react';
import { TextField, Stack, Button, Tooltip, Autocomplete, Divider, IconButton, Box, Snackbar, Alert, Popover, Typography } from '@mui/material';

import LeftArrow from '@mui/icons-material/ArrowBackIosNew';

import { useNavigate } from 'react-router-dom';
import { getRecherche } from '../contracts/recherche';
import { StickyNote2, MeetingRoom, AccessTime, Person, Construction, Search, Description, Info } from '@mui/icons-material';
import { getEpreuve, type APIEpreuve } from '../contracts/epreuves';
import { formatterDateEntiere } from '../utils/dateUtils';
import { BordereauxModal } from '../pages/epreuves/epreuve-modal/BordereauxModal';
import { ScanModal } from '../pages/epreuves/epreuve-modal/ScanModal';

interface SearchBarProps {
    onResultClick?: (epreuve: APIEpreuve) => void;
    handleBack?: () => void;
    nomHandleBack?: string;
    sessionId: number;
    sessionName?: string;
}

type RechercheResultat =
    { type: 0; code: string; } |
    { type: 1; codeSalle: string; } |
    { type: 2; horodatage: string; } |
    { type: 3; codeSalle: string; horodatage: string; } |
    { type: 4; action: number; } |
    { type: 5; numero: number; };

// Todo : ajouter la couleur pour chaque icone
const rechercheResultatIcones: Record<RechercheResultat['type'], ReactElement> = {
    0: <StickyNote2 fontSize="small" />,
    1: <MeetingRoom fontSize="small" />,
    2: <AccessTime fontSize="small" />,
    3: <MeetingRoom fontSize="small" />,
    4: <Construction fontSize="small" />,
    5: <Person fontSize="small" />,
};

function formatResultat(option: RechercheResultat): string {
    switch (option.type) {
        case 0:
            return `Code UE : ${option.code}`;
        case 1:
            return `Salle : ${option.codeSalle}`;
        case 2:
            return `Date : ${formatterDateEntiere(+option.horodatage)}`;
        case 3:
            return `Salle : ${option.codeSalle}, le ${formatterDateEntiere(+option.horodatage)}`;
        case 4:
            if (option.action === 1) {
                return "Télécharger le bordereau";
            }

            if (option.action === 2) {
                return "Déposer des copies";
            }

            if (option.action === 3) {
                return "Changer de session (non implémenté)";
            }
            return `Action : ${option.action}`;
        case 5:
            return `Étudiant : ${option.numero}`;
        default:
            return 'Résultat inconnu';
    }
}

function SearchBar(props: SearchBarProps) {

    // Afficher snackbar de succès après le scan
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false)
    const [codeScan, setCodeScan] = useState<string>("");

    // Ancre pour le popover de la liste des catégories
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Icone de recherche (pour le tooltip)
    const [highlightedOption, setHighlightedOption] = useState<RechercheResultat | null>(null);

    // Liste des résultats de recherche (change a chaque action de recherche)
    const [resultats, setResultats] = useState<RechercheResultat[] | null>(null);

    // Modal bordereau
    const [bordereauModalOpen, setBordereauModalOpen] = useState(false);

    // Modal Depot de copies
    const [depotCopiesModalOpen, setDepotCopiesModalOpen] = useState(false);

    // Valeur de l'input de recherche
    const [inputValue, setInputValue] = useState("");

    // Gère le clic sur un résultat de recherche (Epreuve: fonctionnel, autres types: à implémenter)
    async function handleClickResultat(option: RechercheResultat) {

        switch (option.type) {
            // Epreuve
            case 0:
                const epreuve = await getEpreuve(props.sessionId, option.code);

                console.log("Détails de l'épreuve :", epreuve);

                if (epreuve.status === 200 && epreuve.data) {
                    const res_epreuve = epreuve.data;
                    props.onResultClick?.(res_epreuve);
                }
                break;

            // Salle
            case 1:
                navigate(`/sessions/${props.sessionId}/recherche/salle/${option.codeSalle}`);
                break;

            // Heure
            case 2:
                navigate(`/sessions/${props.sessionId}/recherche/heure/${option.horodatage}`);
                break;

            // Salle + Heure
            case 3:
                navigate(`/sessions/${props.sessionId}/recherche/salleheure/${option.codeSalle}/${option.horodatage}`);
                break;

            // Action
            case 4:
                if (option.action === 1) {
                    // Télécharger le bordereau
                    setBordereauModalOpen(true);
                }

                if (option.action === 2) {
                    // Déposer des copies
                    setDepotCopiesModalOpen(true);
                }

                if (option.action === 3) {
                    // Changer de session (non implémenté)
                    // navigate(`/sessions/${props.sessionId}/epreuves`);
                }
                break;

            // Étudiant
            case 5:
                navigate(`/sessions/${props.sessionId}/recherche/etudiant/${option.numero}`);
                break;
        }
    }



    async function fetchResults(value: string) {
        const response = await getRecherche(props.sessionId, value);

        if (response.status !== 200 || !response.data) {
            setResultats(null);
            return;
        }

        setResultats(response.data.resultats);

        console.log("Résultats de recherche :", response.data.resultats);
    }


    const navigate = useNavigate();

    function handleBackToAccueil() {
        navigate('/accueil');
    }

    return (
        <>
            <Stack spacing={2} alignItems="center" justifyContent={"center"} direction={"row"} width={'100%'}>


                {/* Bouton pour revenir à la liste des sessions */}
                <Tooltip title="Changer de session">
                    <Button startIcon={<LeftArrow />}
                        onClick={props.handleBack ? props.handleBack : handleBackToAccueil}
                        variant="text"
                        sx={{ alignSelf: 'stretch' }}
                    >{props.nomHandleBack ? props.nomHandleBack : "Retour à l'accueil"}</Button>
                </Tooltip>

                <Autocomplete
                    freeSolo
                    id="search-input"

                    disableClearable
                    inputValue={inputValue}

                    options={resultats ?? []}
                    filterOptions={(options) => options}

                    // A fix: n'affiche pas "Aucun résultat" quand le résultat de la recherche est vide.
                    noOptionsText="Aucun résultat"

                    // Style du conteneur !
                    sx={{ width: 600, maxWidth: '100%' }}

                    getOptionLabel={(option) => typeof option === 'string' ? option : formatResultat(option)}

                    renderOption={(props, option) => {

                        return (
                            // Disposition en ligne avec une icône à gauche et le texte à droite (et possiblement un texte supplémentaire)
                            <Box
                                component="li"
                                {...props}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mx: 1,
                                    my: 0.5,
                                    gap: 3,
                                    px: 2,
                                    py: 1.2,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',

                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.05)',
                                    },
                                }}
                            >
                                {/* Icône */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(0,0,0,0.08)',
                                    }}
                                >
                                    {rechercheResultatIcones[option.type]}
                                </Box>

                                {/* Texte */}
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ fontWeight: 500 }}>
                                        {formatResultat(option)}
                                    </Box>

                                    {/* Sous-texte optionnel */}
                                    {/* {option.type && (
                                    <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                                    {option.type}
                                    </Box>
                                )} */}
                                </Box>
                            </Box>
                        );
                    }}

                    // Gère les résultats de la recherche à chaque changement de l'input
                    onInputChange={(_, newInputValue, reason) => {

                        if (reason === "reset") return; // Empêche la recherche de se déclencher quand on clique sur un résultat (car ça réinitialise l'input)

                        setInputValue(newInputValue);

                        if (newInputValue.trim() === "" || newInputValue.trim().length < 3) {

                            setResultats(null);
                            return;

                        } else {
                            console.log("Nouveau terme de recherche :", newInputValue);
                            fetchResults(newInputValue);

                        }
                    }}

                    // Gère le clic sur un résultat de recherche
                    onChange={(_, value) => {
                        if (value && typeof value !== 'string') {
                            handleClickResultat(value);

                            setInputValue("");
                            setResultats(null);
                        }

                    }}

                    // Récupère l'élément survolé pour le tooltip de l'icône de recherche
                    onHighlightChange={(_, option) => {
                        setHighlightedOption(option);
                    }}

                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Recherche : épreuve, salle, horaire ou étudiant"
                            slotProps={{
                                input: {
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {params.InputProps.endAdornment}

                                            <Tooltip title="Rechercher">
                                                <IconButton sx={{ p: '10px' }} aria-label="search"
                                                    onClick={() => {
                                                        if (highlightedOption) {
                                                            handleClickResultat(highlightedOption);
                                                            setInputValue("");
                                                            setResultats(null);
                                                        }
                                                    }}>
                                                    <Search />
                                                </IconButton>
                                            </Tooltip>

                                            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

                                            <Tooltip title="Afficher l'aide rapide">
                                                <IconButton sx={{ p: '10px' }} aria-label="search" onClick={(e) => setAnchorEl(e.currentTarget)}>
                                                    <Info />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Popover de l'aide rapide */}
                                            <Popover
                                                open={Boolean(anchorEl)}
                                                anchorEl={anchorEl}
                                                onClose={() => setAnchorEl(null)}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'right',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        maxWidth: 320,
                                                        borderRadius: 2,
                                                        backgroundColor: 'background.paper',
                                                        boxShadow: 3
                                                    }}
                                                >
                                                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                        Aide rapide
                                                    </Typography>

                                                    <Stack spacing={1.2}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Description fontSize="small" />
                                                            <Typography variant="body2">
                                                                <b>Épreuve</b> : HAI…
                                                            </Typography>
                                                        </Stack>

                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <MeetingRoom fontSize="small" />
                                                            <Typography variant="body2">
                                                                <b>Salle</b> : TD.36
                                                            </Typography>
                                                        </Stack>

                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <AccessTime fontSize="small" />
                                                            <Typography variant="body2">
                                                                <b>Horaire</b> : hier, 20h…
                                                            </Typography>
                                                        </Stack>

                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Person fontSize="small" />
                                                            <Typography variant="body2">
                                                                <b>Étudiant</b> : 2201234
                                                            </Typography>
                                                        </Stack>

                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Construction fontSize="small" />
                                                            <Typography variant="body2">
                                                                <b>Actions</b> : bordereau, copies, session
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Box>
                                            </Popover>
                                        </>
                                    ),
                                },
                            }}
                        />
                    )}
                />
            </Stack >

            {/* Modal bordereau */}
            <BordereauxModal ouvert={bordereauModalOpen} onFermer={() => setBordereauModalOpen(false)} />

            {/* Modal Depot de copies */}
            <ScanModal ouvert={depotCopiesModalOpen}
                setOuvertModalScan={setDepotCopiesModalOpen}
                idSession={props.sessionId.toString()}
                setSuccess={setOpenSnackbar}
                setCodeScan={setCodeScan} />

            {/* Snackbar de succès après le scan */}

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                    Scan réussi ! Code : {codeScan}
                </Alert>
            </Snackbar>
        </>
    );
} export default SearchBar;