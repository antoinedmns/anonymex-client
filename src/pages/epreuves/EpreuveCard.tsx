import { Card, CardActionArea, Stack, Typography, Chip } from "@mui/material";
import { EpreuveStatutNom, type APIEpreuve, type EpreuveStatut } from "../../contracts/epreuves";
import { themeEpreuves } from "../../theme/epreuves";
import { grey } from "@mui/material/colors";
import { alpha } from "@mui/material/styles";
import IconeRond from "../../components/IconeRond";
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PrintIcon from '@mui/icons-material/Print';
import PrintDisabledIcon from '@mui/icons-material/PrintDisabled';
import DoneIcon from '@mui/icons-material/Done';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import { type JSX } from "react";
import { Create } from "@mui/icons-material";

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});

const epreuveStatutIcons: Record<EpreuveStatut, JSX.Element> = {
    1: <PrintDisabledIcon />,
    2: <PrintIcon />,
    3: <HourglassTopIcon />,
    4: <DocumentScannerIcon />,
    5: <DoneIcon />,
    6: <Create />,
}

type EpreuveCardProps = {
    epreuve: APIEpreuve;
    onClick: (epreuve: APIEpreuve) => void;
};

const statutInconnu = {
    label: 'Statut inconnu',
    icon: <HourglassTopIcon />,
    color: themeEpreuves.status[0],
};

export const EpreuveCard = function EpreuveCard(props: EpreuveCardProps): JSX.Element {
    const epreuve = props.epreuve;
    const statusData = epreuve.statut >= 1 && epreuve.statut <= 6 ? {
        label: EpreuveStatutNom[epreuve.statut],
        icon: epreuveStatutIcons[epreuve.statut],
        color: themeEpreuves.status[epreuve.statut],
    } : statutInconnu;

    const formattedTime = timeFormatter.format(new Date(epreuve.date * 1000));

    return (
        <Card variant="outlined" sx={{ backgroundColor: grey[50], borderRadius: 2 }} >
            <CardActionArea sx={{ '&:hover': { backgroundColor: grey[100] } }} onClick={() => props.onClick(epreuve)}>
                <Stack direction="row" alignItems="center">

                    <Stack padding={2} direction="row" alignItems="center" spacing={2} minWidth={0}>
                        <IconeRond icon={statusData.icon} bgcolor={alpha(statusData.color, 0.31)} />
                        <Stack direction="column" minWidth={0} spacing={0.2}>
                            <Stack direction="row" alignItems="center" spacing={1} fontWeight={400}>
                                <Typography variant="h6">{epreuve.code}</Typography>
                                <Typography variant="h6" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>- {epreuve.nom}</Typography>
                            </Stack>
                            <Typography fontSize={15} color="text.secondary">{epreuve.salles.join(', ')}</Typography>
                        </Stack>
                    </Stack>

                    <Stack flexGrow={1} />
                    <Stack direction="column" spacing={1} padding={2} alignItems="flex-end" >
                        <Chip label={statusData.label} size="small" sx={{ bgcolor: alpha(statusData.color, 0.56) }} />
                    </Stack>

                    <Stack alignItems={'center'} justifyContent='center' alignSelf={'stretch'}
                        sx={{
                            width: '5rem', minWidth: '5rem', flexShrink: 0, fontSize: '1.2rem',
                            bgcolor: alpha(statusData.color, 0.56),
                        }}
                    >
                        {formattedTime}
                    </Stack>
                </Stack>


            </CardActionArea>
        </Card>
    );
};