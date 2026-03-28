import React from "react";
import { Stack, Typography } from "@mui/material";
import { SessionModalBouton } from "../composantsFormulaireSession";
import { ArrowBackIosNewOutlined, ArrowForwardIosOutlined } from "@mui/icons-material";

type Props = {
    bordereau: null;
    setBordereau: (f: null) => void;
    onPrev: () => void;
    onNext: () => Promise<void>;
};

export default function SessionEtapeBordereau({onPrev, onNext}: Props) {
    
    const [isLoading, setIsLoading] = React.useState(false);

    const handleNext = async () => {
        setIsLoading(true);
        await onNext();
        setIsLoading(false);
    };
    
    return (
        <Stack spacing={2} flexDirection={'column'} gap={2}>
            <Stack component="form" onSubmit={handleNext} justifyContent={'space-between'} flexDirection={'column'} gap={2} margin={4}>
                <Typography variant="h6" textAlign={'center'}>Configuration du Bordereau</Typography>

                <Stack flexDirection="row" alignItems="center" gap={2} margin={2} justifyContent={'space-between'}>
                    <SessionModalBouton label="Etape précédente" onClick={onPrev} startIcon={<ArrowBackIosNewOutlined />} outlined={true} />
                    <SessionModalBouton label="Etape suivante" endIcon={<ArrowForwardIosOutlined />} loading={isLoading} onClick={handleNext}/>
                </Stack>
            </Stack>
        </Stack>
    );
}