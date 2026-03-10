import { Stack, Modal, colors } from "@mui/material";
import { grey } from "@mui/material/colors";
import BoutonStandard from "./components/BoutonStantard";
import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface BordereauxModalProps {
    ouvert: boolean;
    onFermer: () => void;
}

export function BordereauxModal(props: BordereauxModalProps) {


    // Besoin du PDF BORDEREAUX A METTRE 
    const documentUrl = "https://us1.pdfgeneratorapi.com/api/v3/templates/686726/output?key=ab0801834ab51edb6e8fee01dd4adc28f0dcd8a03ea2f2f17eeeb475b5c51ec8&workspace=demo.example@actualreports.com&signature=3123e0212c6e3d44b64738a77b0daf0781a1271439cab6301755cb4773a6446f&data=https://pdfgeneratorapi-web-assets.s3.amazonaws.com/data/bill_of_lading_data.json&format=pdf&output=I"

    const handleDowload = () => {
        window.open(documentUrl, "_blank");

    }

    return (

        <Modal open={props.ouvert} onClose={props.onFermer}>
            <Stack
                sx={{ height: "100vh", width: "100vw" }}
                alignItems="center"
                justifyContent="center"
            >
                <Stack
                    sx={{ height: 900, width: 700, bgcolor: grey[200], p: 2, borderRadius: 4 }}
                >
                    <Stack direction="column" justifyContent="space-between" spacing={2} height="100%">

                        <Stack bgcolor={colors.grey[200]} width="100%" height="100%" >
                            <iframe
                                title="Exemple de cadre intégré"
                                width="100%"
                                height="100%"
                                src={documentUrl}
                            />
                        </Stack>


                        <Stack width="100%" justifyContent="space-between">
                            <Stack spacing={1} direction="row" justifyContent="space-between">
                                <BoutonStandard
                                    color={grey[400]}
                                    onClick={() => handleDowload()}
                                    icone={<DownloadIcon />}
                                    texte="Imprimer"
                                    width={"100%"}

                                />

                                <BoutonStandard
                                    color={grey[500]}
                                    onClick={() => props.onFermer()}
                                    icone={<ChevronLeftIcon />}
                                    texte="Retour"
                                    width={"100%"}
                                />
                            </Stack>
                        </Stack>

                    </Stack>
                </Stack>
            </Stack>
        </Modal>
    )
};

