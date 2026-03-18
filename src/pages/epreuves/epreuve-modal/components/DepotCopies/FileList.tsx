import { Close } from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import VisibilityIcon from '@mui/icons-material/Visibility';


interface FileListProps {
    fichiers: FileList;
    handleSupprFile: (index: number) => void;
}

export function FileList(props: FileListProps) {

    const handleViewFile = (file: File) => {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
        URL.revokeObjectURL(fileURL);
    }

    return (

        <Stack sx={{ overflow: "scroll" }} >
            {props.fichiers && Array.from(props.fichiers).map((file, index) => (
                <Stack key={index} direction="row" alignItems="center" spacing={1} p={1} >
                    <IconButton onClick={() => props.handleSupprFile(index)} sx={{ color: grey[600] }}>
                        <Close />
                    </IconButton>
                    <IconButton onClick={() => handleViewFile(file)} sx={{ color: grey[600] }}>
                        <VisibilityIcon />
                    </IconButton>

                    <Stack>
                        <Typography variant="body1" color={grey[800]} fontWeight={500}>
                            {file.name}
                        </Typography>
                        <Typography variant="body2" color={grey[600]}>
                            {(file.size / 1024).toFixed(2)} KB
                        </Typography>
                    </Stack>

                </Stack>
            ))}
        </Stack>


    );
}