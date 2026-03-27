import { useState } from 'react';
import { TextField, Stack, Paper, Button, Tooltip, Autocomplete } from '@mui/material';

import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import LeftArrow from '@mui/icons-material/ArrowBackIosNew';

import { FormatListBulleted } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { getRecherche } from '../contracts/recherche';

interface SearchBarProps {
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

function SearchBar(props: SearchBarProps) {
    const [resultats, setResultats] = useState<RechercheResultat[]>([]);

    async function fetchResults(value: string) {
        const response = await getRecherche(props.sessionId, value);

        if (response.status !== 200 || !response.data) {
            return console.error("Erreur lors de la recherche :", response.error || "Inconnue");
        }

        setResultats(response.data.resultats);
    }


    const navigate = useNavigate();

    function handleBackToSessions() {
        navigate('/accueil');
    }

    return (
        <Stack spacing={2} alignItems="center" justifyContent={"center"} direction={"row"} width={'100%'}>

            <Tooltip title="Changer de session">
                <Button startIcon={<LeftArrow />}
                    onClick={handleBackToSessions}
                    variant='outlined'
                    sx={{ alignSelf: 'stretch' }}
                >{props.sessionName || 'Nom de session inconnu'}</Button>
            </Tooltip>

            <Autocomplete
                freeSolo
                id="search-input"
                disableClearable
                options= {resultats.map((option) => {
                    switch (option.type) {
                        case 0:
                            return `UE : ${option.code}`;
                        case 1:
                            return `Salle : ${option.codeSalle}`;
                        case 2:
                            return `Heure : ${option.horodatage}`;
                        case 3:
                            return `Salle : ${option.codeSalle} à ${option.horodatage}`;
                        case 4:
                            return `Action : ${option.action}`;
                        case 5:
                            return `Étudiant : ${option.numero}`;
                        default:
                            return "Résultat inconnu";
                    }
                })}
                onInputChange={(_, newInputValue) => {
                    console.log("Nouveau terme de recherche :", newInputValue);
                    fetchResults(newInputValue);
                }}
                renderInput={(params) => (
                    <Paper sx={{ p: '2px 10px', display: 'flex', alignItems: 'center', width: 600, minWidth: '30vw', borderColor: '#c4c4c4' }} variant='outlined'>

                        <TextField
                            {...params}
                            placeholder="Rechercher une épreuve, une salle, une heure, une action ou un étudiant"
                            variant="standard"
                        />

                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

                        <Tooltip title="Voir toutes les épreuves">
                            <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                                <FormatListBulleted />
                            </IconButton>
                        </Tooltip>
                    </Paper>
                )}
            />
        </Stack >

    );
} export default SearchBar;