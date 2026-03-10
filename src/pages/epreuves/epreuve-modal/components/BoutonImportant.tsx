import { Card, CardActionArea, Stack, Typography } from "@mui/material";
import { grey } from '@mui/material/colors';
import type { JSX } from "react";


interface EpreuvesFiltresProps {
    onClick: () => void;
    titre: string;
    sousTitre: string;
    icone: JSX.Element;
    color: string;
}

function BoutonImportant(props: EpreuvesFiltresProps): JSX.Element {
    return (
        <Card variant="outlined" sx={{ backgroundColor: grey[50], borderRadius: 2 }}>
            <CardActionArea onClick={props.onClick} sx={{
                bgcolor: grey[50],
                '&:hover': { backgroundColor: grey[100] },
                'transition': 'background-color 0.3s',
            }}>

                <Stack direction="row" alignItems="center" justifyContent={"space-between"}>
                    <Stack direction={"row"}>
                        <Stack alignItems={'center'} justifyContent='center' alignSelf={'stretch'}
                            sx={{
                                width: '15rem', fontSize: '1.2rem',
                                bgcolor: props.color + '8F', // note: on rajoute 8F en ALPHA, c'est un byte hexédécimal supplémentaire pour l'opacité
                                padding: 2
                            }}
                        >
                            {props.icone}

                        </Stack>

                        <Stack padding={2} direction="row" alignItems="center" spacing={2}>
                            <Stack direction="column">
                                <Typography color="grey.800" fontWeight={500} variant="h5"> {props.titre} </Typography>
                                <Typography variant="body1" color={grey[500]}>
                                    Les bordereaux sont des documents qui récapitulent les informations essentielles sur les épreuves, tels que les codes, les dates et les lieux.
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>


                </Stack>



            </CardActionArea>
        </Card>
    );
}

export default BoutonImportant;