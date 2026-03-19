import { Card, CardActionArea, Stack, Typography, Chip } from "@mui/material";
import type { APIEpreuve } from "../../contracts/epreuves";
import { themeEpreuves } from "../../theme/epreuves";
import { grey } from "@mui/material/colors";

import IconeRond from "../../components/IconeRond";
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PrintIcon from '@mui/icons-material/Print';
import PrintDisabledIcon from '@mui/icons-material/PrintDisabled';
import DoneIcon from '@mui/icons-material/Done';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import type { JSX } from "react";


type EpreuveStatut = 1 | 2 | 3 | 4 | 5;

const epreuveStatutTextes: Record<EpreuveStatut, string> = {
    1: 'Matériel non imprimé',
    2: 'Materiel imprimé',
    3: 'En attente de dépot',
    4: 'Dépot complet',
    5: 'Notes exportées',
}


const epreuveStatutIcons: Record<EpreuveStatut, JSX.Element> = {
    1: <PrintDisabledIcon />,
    2: <PrintIcon />,
    3: <HourglassTopIcon />,
    4: <DocumentScannerIcon />,
    5: <DoneIcon />,
}


export function EpreuveCard(props: { epreuve: APIEpreuve, onClick: () => void }): JSX.Element {
    const date = new Date(props.epreuve.date);
    const epreuve = props.epreuve;
    return (
        <Card variant="outlined" sx={{ backgroundColor: grey[50], borderRadius: 2 }} >
            <CardActionArea sx={{ '&:hover': { backgroundColor: grey[100] } }} onClick={props.onClick}>
                <Stack direction="row" alignItems="center">
                    <Stack padding={2} direction="row" alignItems="center" spacing={2} >
                        <IconeRond icon={epreuveStatutIcons[epreuve.statut]} bgcolor={themeEpreuves.status[epreuve.statut] + '4F'} />
                        <Stack direction="column" >
                            <Stack direction="row" alignItems="center" spacing={1} fontWeight={400}>
                                <Typography variant="h6">{epreuve.code}</Typography>
                                <Typography variant="h6" fontWeight={500}>-</Typography>
                                <Typography variant="h6" textOverflow={"ellipsis"} > {epreuve.nom} </Typography>
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <Typography variant="body2">{epreuve.salles.join(', ')}</Typography>
                            </Stack>
                        </Stack>
                    </Stack>

                    <Stack flexGrow={1} />
                    <Stack direction="column" spacing={1} padding={2} alignItems="flex-end" >
                        <Chip label={`${epreuveStatutTextes[epreuve.statut]}`} size="small" sx={{ bgcolor: themeEpreuves.status[epreuve.statut] + '8F' }} />
                    </Stack>

                    <Stack alignItems={'center'} justifyContent='center' alignSelf={'stretch'}
                        sx={{
                            width: '5rem', fontSize: '1.2rem',
                            bgcolor: themeEpreuves.status[epreuve.statut] + '8F', // note: on rajoute 8F en ALPHA, c'est un byte hexédécimal supplémentaire pour l'opacité

                        }}
                    >
                        {date.getHours().toString().padStart(2, '0')}:
                        {date.getMinutes().toString().padStart(2, '0')}
                    </Stack>
                </Stack>


            </CardActionArea>
        </Card>
    );
}