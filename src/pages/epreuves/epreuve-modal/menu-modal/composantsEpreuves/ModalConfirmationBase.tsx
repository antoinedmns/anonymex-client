import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface ModalConfirmationBaseProps {
    ouvert: boolean;
    onClose: () => void;
    onConfirmer: () => void;
    titre: string;
    ancienLabel: string;
    ancienValeur: string;
    nouveauLabel: string;
    nouveauValeur: string;
    texteConfirmation?: string;
    texteAnnulation?: string;
}

function ModalConfirmationBase({
    ouvert,
    onClose,
    onConfirmer,
    titre,
    ancienLabel,
    ancienValeur,
    nouveauLabel,
    nouveauValeur,
    texteConfirmation = "Confirmer",
    texteAnnulation = "Annuler",
}: ModalConfirmationBaseProps) {
    return (
        <Dialog open={ouvert} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>{titre}</DialogTitle>

            <DialogContent>
                <Stack spacing={2}>
                    <Stack sx={{ borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "grey.50", p: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                            {ancienLabel}
                        </Typography>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <CloseIcon sx={{ color: "error.main" }} fontSize="small" />
                            <Typography variant="h6" fontWeight={700}>
                                {ancienValeur}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack sx={{ borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "grey.50", p: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                            {nouveauLabel}
                        </Typography>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <CheckIcon sx={{ color: "success.main" }} fontSize="small" />
                            <Typography variant="h6" fontWeight={700}>
                                {nouveauValeur}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
                <Button onClick={onClose} color="inherit">
                    {texteAnnulation}
                </Button>
                <Button variant="contained" onClick={onConfirmer}>
                    {texteConfirmation}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ModalConfirmationBase;