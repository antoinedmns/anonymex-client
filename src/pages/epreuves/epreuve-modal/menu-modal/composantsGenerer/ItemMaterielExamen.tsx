import { colors, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Check } from "@mui/icons-material";

import type { JSX } from "@emotion/react/jsx-runtime";

interface SelectionProps {
    titre: string;
    sousTitre: string;
    termine: boolean;
    color: string;
    handleClick: () => void;
    icone: JSX.Element;
}

export default function ItemMaterielExamen(props: SelectionProps) {

    return (

        <Stack width={500} direction="row" alignItems={"center"} justifyContent="space-between" border={props.termine ? 0 : 1} borderColor={alpha(props.color, 0.2)} bgcolor={props.termine ? alpha(props.color, 0.05) : alpha(props.color, 0.10)} padding={1} borderRadius={2}
            sx={{ '&:hover': { bgcolor: alpha(props.color, 0.15), cursor: 'pointer' }, transition: 'background-color 0.2s' }} onClick={props.handleClick}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Stack alignItems={"center"} p={1} width={50} height={50} justifyContent={"center"} borderRadius={1} bgcolor={props.termine ? alpha(props.color, 0.1) : alpha(props.color, 0.3)}>
                    {props.icone}
                </Stack>
                <Stack>
                    <Typography fontWeight={500}> {props.titre} </Typography>
                    <Typography sx={{ color: colors.grey[600] }}> {props.sousTitre} </Typography>
                </Stack>
            </Stack>
            <Stack mr={2}>
                {props.termine && <Check sx={{ color: colors.grey[700] }} />}
            </Stack>
        </Stack>
    );
}