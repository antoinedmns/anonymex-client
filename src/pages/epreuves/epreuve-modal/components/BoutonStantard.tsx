import { Button, colors } from "@mui/material";
import type { JSX } from "@emotion/react/jsx-runtime";

interface BoutonStandardProps {
    color?: string;
    onClick: () => void;
    icone?: JSX.Element;
    texte: string;
    height?: number;
    width?: number | string;
    loading?: boolean;
}


export default function BoutonStandard(props: BoutonStandardProps) {

    return (

        <Button loading={props.loading} onClick={props.onClick} variant="contained" sx={{ height: props.height, width: props.width, bgcolor: props.color + "60", color: colors.grey[900], py: 1, boxShadow: 'none', '&:hover': { boxShadow: 'none', bgcolor: props.color + "80" }, '&:focus': { boxShadow: 'none' } }} startIcon={props.icone}>
            {props.texte}

        </Button>
    );

}
