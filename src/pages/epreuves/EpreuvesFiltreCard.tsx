import type { JSX } from "@emotion/react/jsx-runtime";
import { Card, CardActionArea, Stack, Typography } from "@mui/material";

interface EpreuvesFiltresProps {
    titre: string;
    sousTexte?: string;
    nombre?: number;
    icone?: JSX.Element;
    selectionne: boolean;
    couleur: string;
    onClick: () => void;
}

export default function EpreuvesFiltreCard({ titre, sousTexte, nombre, icone, selectionne: selected, couleur, onClick }: EpreuvesFiltresProps): JSX.Element {
    return (
        <Card variant={"outlined"} sx={{ borderColor: selected ? couleur : 'grey.300', bgcolor: selected ? couleur + '1A' : 'background.paper' }}>
            <CardActionArea onClick={onClick}>
                <Stack direction="row" alignItems="center" spacing={0.7}>

                    <Stack alignItems={'center'} justifyContent='center' alignSelf={'stretch'}
                        sx={{
                            minWidth: '5rem',
                            fontSize: '1.1rem',
                            bgcolor: couleur + '8F',
                        }}
                    >
                        {icone && icone}
                        {nombre !== undefined && <Typography variant="h5" fontWeight={500} color="grey.850">{nombre}</Typography>}
                    </Stack>

                    <Stack padding={sousTexte ? 1.5 : 2.5} spacing={0}>
                        <Typography variant="h6">{titre}</Typography>
                        {sousTexte && <Typography variant="body2" color="text.secondary">{sousTexte}</Typography>}
                    </Stack>
                </Stack>
            </CardActionArea>
        </Card>
    );
}