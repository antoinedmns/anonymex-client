import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { frFR } from '@mui/x-data-grid/locales';

import { getColumns } from './composantsListe/colonnesListe';
import { Snackbar, Stack } from '@mui/material';

import { useConfirmEdit } from './composantsListe/useConfirmEdit';
import { useConfirmDelete } from './composantsListe/useConfirmDelete';
import { useConfirmTransfer } from './composantsListe/useConfirmTransfer';

import { useGridApiRef } from '@mui/x-data-grid';
import Header from './composantsListe/Header';

import type { APIConvocation } from '../../../../contracts/convocations';
import { getConvocations, deleteConvocations, patchConvocation, postConvocationsTransfert } from '../../../../contracts/convocations';


declare module "@mui/x-data-grid" {
    interface ToolbarPropsOverrides {
        selectedRows: APIConvocation[];
        handleDelete: (listeNumEtu: string[]) => void;
        handleTransfer: (listeNumEtu: string[], salle: string) => void;
        handleConvocations: (listeNumEtu: string[]) => void;
        setSalleFilter: (salle: string) => void;
        salleFilter: string;
        sallesUniques: string[];
    }
}

interface MenuListeEtudiantsProps {
    menuColor?: string;
    statut: number;
    idSession: number;
    codeEpreuve: string;
    salleDefault: string;
}



function MenuListeEtudiants(props: MenuListeEtudiantsProps) {

    const [noteModifiable, setNoteModifiable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const [salleFilter, setSalleFilter] = useState<string>(props.salleDefault);
    const [hovered] = useState<string | null>(null);

    const [selectedRows, setSelectedRows] = useState<APIConvocation[]>([]);

    const columns = getColumns(noteModifiable, hovered);

    const { confirm, confirmModalEdit } = useConfirmEdit();
    const { confirmDelete, confirmModalDelete } = useConfirmDelete();
    const { confirmTransfer, confirmModalTransfer } = useConfirmTransfer();



    const [rows, setRows] = useState<APIConvocation[]>([]);

    useEffect(() => {
        const fetchConvocations = async () => {
            setLoading(true);
            const res = await getConvocations(props.idSession, props.codeEpreuve);
            if (res.data?.convocations) {
                setRows(res.data?.convocations);
                console.log("Convocations récupérées :", res.data.convocations);
            }
            setLoading(false);
        };

        fetchConvocations();
    }, [props.idSession, props.codeEpreuve]);




    useEffect(() => {
        setNoteModifiable(props.statut >= 4);
    }, []);

    const memeDico = (a: APIConvocation, b: APIConvocation): boolean => {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) {
            return false;
        }

        return keysA.every((key) => a[key as keyof APIConvocation] === b[key as keyof APIConvocation]);
    }


    const sallesUniques = Array.from(new Set(rows.map(row => row.codeSalle)));

    const apiRef = useGridApiRef();

    const handleSaveRows = async (newRow: APIConvocation, oldRows: APIConvocation): Promise<APIConvocation> => {
        const result = await confirm(oldRows, newRow);
        if (result) {
            const res = await patchConvocation(props.idSession, props.codeEpreuve, result.codeAnonymat, { rang: newRow.rang, note_quart: newRow.noteQuart, code_salle: newRow.codeSalle });
            if (res.status === 200) {
                setRows((rows) => rows.map((row) => (row.numeroEtudiant === result.numeroEtudiant ? result : row)));
            } else {
                console.error("Erreur lors de la mise à jour de la convocation :", res);
            }
        }
        return result;
    }

    const handleDelete = async (listeCodeAno: string[]) => {

        const result = await confirmDelete(listeCodeAno);
        console.log("Résultat de la confirmation de suppression :", result);
        console.log("Suppression des étudiants avec les numéros d'anonymat :", listeCodeAno);
        if (result) {
            const res = await deleteConvocations(props.idSession, props.codeEpreuve, listeCodeAno);
            console.log("Réponse de l'API après suppression :", res);
            if (res.data?.success) {
                console.log("Convocations supprimées avec succès");
                setRows((prevRows) => prevRows.filter((row) => !result.includes(row.codeAnonymat)));
            } else {
                console.error("Erreur lors de la suppression des convocations" + res);
            }
        }
    }

    const handleTransfer = async (listeCodeAno: string[], salle: string) => {
        const result = await confirmTransfer(listeCodeAno.length, salle);
        console.log("Transfert des étudiants avec les numéros :", result);

        if (result) {

            console.log(`Transfert des étudiants avec le code anonymat ${listeCodeAno} vers la salle ${salle}`);
            const res = await postConvocationsTransfert(props.idSession, props.codeEpreuve, { codesAnonymats: listeCodeAno, salleTransfert: salle });
            console.log("Réponse de l'API après transfert :", res);
            if (res.status === 200) {
                setRows((prevRows) => prevRows.map((row) =>
                    listeCodeAno.includes(row.codeAnonymat!)
                        ? { ...row, codeSalle: salle }
                        : row
                ));
            }

        }

        console.log("Résultat de la confirmation de transfert :", result);

    }

    const handleConvocations = (listeCodeAno: string[]) => {
        console.log("Génération des convocations pour les étudiants avec les numéros :", listeCodeAno);
        // Logique de génération des convocations ici
    }


    return (
        <>
            {confirmModalDelete}
            {confirmModalEdit}
            {confirmModalTransfer}


            <Box sx={{ height: 570 }}>

                <DataGrid

                    showToolbar
                    slots={{ toolbar: Header }}
                    slotProps={{
                        toolbar:
                        {
                            selectedRows,
                            handleDelete,
                            handleTransfer,
                            handleConvocations,
                            setSalleFilter,
                            salleFilter,
                            sallesUniques
                        }
                    }}
                    apiRef={apiRef}
                    sx={{
                        '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root': {
                            color: props.menuColor + 'AC',
                        },
                        '& .MuiDataGrid-cellCheckbox .MuiCheckbox-root': {
                            color: props.menuColor + 'AC',
                        }
                        ,
                        '& .MuiDataGrid-row': {
                            backgroundColor: props.menuColor + '05',
                        },
                        '& .MuiDataGrid-row.Mui-selected': {
                            backgroundColor: props.menuColor + '20',
                        },
                        '& .MuiDataGrid-row.Mui-selected:hover': {
                            backgroundColor: props.menuColor + '30',
                        },

                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: props.menuColor + '10',
                        },
                    }}
                    getRowId={(row) => row.numeroEtudiant ?? 0}
                    loading={loading}
                    density='compact'
                    rows={salleFilter === "x" ? rows : rows.filter(row => row.codeSalle === salleFilter)}
                    columns={columns.filter(col => col.field !== 'idSession' && col.field !== 'codeEpreuve')}
                    
                    checkboxSelection

                    processRowUpdate={(newRow, oldRow) =>
                        !memeDico(oldRow, newRow)
                            ? handleSaveRows(newRow, oldRow)
                            : oldRow
                    }
                    localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
                    disableColumnSelector
                    onCellDoubleClick={(params) => {
                        if (!params.colDef.editable) {
                            // setTooltipOpen(true);
                        }
                    }}

                    onRowSelectionModelChange={() => {
                        const selectedRowsMap = apiRef!.current!.getSelectedRows();;
                        const selectedRowsData = Array.from(selectedRowsMap.values());
                        setSelectedRows(selectedRowsData as APIConvocation[]);
                        console.log("Toutes les lignes sélectionnées :", selectedRowsData);
                    }}


                />

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2, mb: 2 }}>


                    <Snackbar
                        open={tooltipOpen}
                        autoHideDuration={2000}
                        message="Cette cellule n'est pas modifiable"
                        onClose={() => setTooltipOpen(false)}
                    />

                </Stack>


            </Box>


        </>
    );
}

export default MenuListeEtudiants;