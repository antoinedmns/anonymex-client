import { Card, CardActionArea, Stack, Typography } from "@mui/material";
import { grey } from '@mui/material/colors';
import type { JSX } from "react";


interface EpreuvesFiltresProps {
    onClick: () => void;
    titre: string;
    sousTitre?: string;
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
                                width: '5rem', fontSize: '1.2rem',
                                bgcolor: '#00000010',
                                padding: 2
                            }}
                        >
                            {props.icone}

                        </Stack>

                        <Stack padding={2} direction="row" alignItems="center" spacing={2}>
                            <Stack direction="column">
                                <Typography color="grey.800" fontWeight={500} variant="h6"> {props.titre} </Typography>
                            </Stack>
                        </Stack>
                    </Stack>


                </Stack>



            </CardActionArea>
        </Card>
    );
}

export default BoutonImportant;