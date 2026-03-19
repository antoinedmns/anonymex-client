import { Close } from "@mui/icons-material";
import { Box, Collapse, Grow, IconButton, keyframes, LinearProgress, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import VisibilityIcon from '@mui/icons-material/Visibility';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface FileListProps {
    fichiers: FileList;
    handleSupprFile: (index: number) => void;
    numPage: number[];
    totalPages: number[];
    numFichier: number;
    debutTraitement: boolean;
    erreurs: number[];
}

export function FileList(props: FileListProps) {

    const handleViewFile = (file: File) => {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
        URL.revokeObjectURL(fileURL);
    }

    const calcProgress = (index: number) => {
        const currentPage = props.numPage[index] ?? 0;
        const currentTotalPages = props.totalPages[index] ?? 0;

        if (currentTotalPages > 0) {
            return Math.min(100, (currentPage / currentTotalPages) * 100);
        }

        return 0;
    }

    const spin = keyframes`
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    `;

    return (

        <Stack sx={{ overflow: "scroll" }} p={3} width={"100%"} spacing={1} >
            {props.fichiers && Array.from(props.fichiers).map((file, index) => (

                <Stack key={index} direction="row" alignItems="center" spacing={1} p={1} >

                    {/* Affichage avant traitement */}
                    <Grow in={!props.debutTraitement} unmountOnExit>
                        <Stack direction="row" >
                            <IconButton onClick={() => props.handleSupprFile(index)} sx={{ color: grey[600] }}>
                                <Close />
                            </IconButton>
                            <IconButton onClick={() => handleViewFile(file)} sx={{ color: grey[600] }}>
                                <VisibilityIcon />
                            </IconButton>
                        </Stack>
                    </Grow>



                    {/* Affichage pendant le traitement */}
                    <Grow in={props.debutTraitement && props.numFichier === index} unmountOnExit>
                        <IconButton >
                            <HourglassTopIcon sx={{
                                color: grey[600],
                                animation: `${spin} 3s linear infinite`
                            }} />
                        </IconButton>
                    </Grow>

                    <Grow in={props.debutTraitement && props.numFichier < index} unmountOnExit>
                        <IconButton>
                            <HourglassTopIcon sx={{ color: grey[600] }} />
                        </IconButton>
                    </Grow>


                    <Grow in={!props.erreurs.includes(index) && props.debutTraitement && props.numFichier > index} unmountOnExit>
                        <IconButton>
                            <CheckIcon sx={{ color: grey[600] }} />
                        </IconButton>
                    </Grow>

                    <Grow in={props.erreurs.includes(index)} unmountOnExit>
                        <IconButton>
                            <ErrorOutlineIcon />
                        </IconButton>
                    </Grow>




                    <Stack direction="column" flexGrow={1} >
                        <Typography variant="body1" color={grey[800]} fontWeight={500}>
                            {file.name}
                        </Typography>

                        {!props.debutTraitement && (
                            <Typography variant="body2" color={grey[600]}>
                                {(file.size / 1024).toFixed(2)} KB
                            </Typography>
                        )}

                        {props.erreurs.includes(index) && (
                            <Typography variant="body2" color="error">
                                Erreur lors du traitement de ce fichier.
                            </Typography>
                        )}

                        <Collapse in={props.debutTraitement && !props.erreurs.includes(index)}  >
                            <Box sx={{ display: 'flex', alignItems: 'center' }} mt={0.5}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress variant="determinate" value={calcProgress(index)} />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                    {(() => {
                                        const currentPage = props.numPage[index] ?? 0;
                                        const currentTotalPages = props.totalPages[index];

                                        return (
                                            <Typography
                                                variant="body2"
                                                sx={{ color: 'text.secondary' }}
                                            >{`${currentPage}/${currentTotalPages ?? "?"}`}</Typography>
                                        );
                                    })()}
                                </Box>
                            </Box>
                        </Collapse>
                    </Stack>

                </Stack>

            ))
            }
        </Stack >


    );
}