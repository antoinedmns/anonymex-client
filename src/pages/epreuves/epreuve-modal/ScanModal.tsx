import { Stack } from "@mui/material";
import Modal from "@mui/material/Modal";
import { DepotLayout } from "./components/DepotCopies/DepotLayout";

/**
 * DOIT ETRE SUPPRIME et fusionné avec MenuScanCopies.tsx dans un composant à part entière
 * Ce modal affichera le composant "à part" et MenuScanCopies idem 
 */

interface ScanModalProps {
    ouvert: boolean;
    setOuvertModalScan: (ouvert: boolean) => void;
    setSuccess: (success: boolean) => void;
    setCodeScan: (code: string) => void;
}

export function ScanModal(props: ScanModalProps) {


    const handleClose = () => {
        //handleReset();
        props.setOuvertModalScan(false);
    }


    return (
        <Modal open={props.ouvert} onClose={handleClose}>
            <Stack
                sx={{ height: "100%", width: "100%" }}
                alignItems="center"
                justifyContent="center"
                direction={"column"}
            >

                <DepotLayout isModal={true} handleClose={handleClose} />

            </Stack >



        </Modal >
    );
}