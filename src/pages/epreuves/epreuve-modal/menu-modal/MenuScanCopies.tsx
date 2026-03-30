
import { DepotLayout } from "../components/DepotCopies/DepotLayout";
import { Stack } from "@mui/material";

interface MenuScanCopiesProps {
    menuColor: string;
    codeUE: string;
    idSession: string;
    onIncidentCreated?: () => void;
    onIncidentResolved?: () => void;
}

export function MenuScanCopies(props: MenuScanCopiesProps) {


    return (
        <Stack
            sx={{ height: "100%", width: "100%" }}
            alignItems="center"
            justifyContent="center"
            direction={"column"}
        >
            <DepotLayout isModal={false} codeUE={props.codeUE} idSession={props.idSession} onIncidentCreated={props.onIncidentCreated} onIncidentResolved={props.onIncidentResolved} />
        </Stack>
    );
}