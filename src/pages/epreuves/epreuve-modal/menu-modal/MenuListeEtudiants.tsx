import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState, type JSX } from 'react';
import { frFR } from '@mui/x-data-grid/locales';

import { getColumns } from './composantsListe/colonnesListe';
import { Snackbar, Stack } from '@mui/material';

import { useConfirmEdit } from './composantsListe/useConfirmEdit';
import { useConfirmDelete } from './composantsListe/useConfirmDelete';
import { useConfirmTransfer } from './composantsListe/useConfirmTransfer';

import { useGridApiRef } from '@mui/x-data-grid';
import Header from './composantsListe/Header';

interface StudentRow {
    numEtu: number;
    nom: string;
    prenom: string;
    salle: string;
    codeAnonymat: string;
    Note: number;
}

interface HeaderProps {
    selectedRows: StudentRow[];
    handleDelete: (listeNumEtu: number[]) => void;
    handleTransfer: (listeNumEtu: number[], salle: string) => void;
    handleConvocations: (listeNumEtu: number[]) => void;
}

interface MenuListeEtudiantsProps {
    menuColor?: string;
    statut: number;
}



function MenuListeEtudiants(props: MenuListeEtudiantsProps): JSX.Element {

    const [noteModifiable, setNoteModifiable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const [salleFilter, setSalleFilter] = useState<string>("x");
    const [hovered, setHovered] = useState<string | null>(null);

    const [selectedRows, setSelectedRows] = useState<StudentRow[]>([]);


    const columns = getColumns(noteModifiable, hovered);

    const { confirm, confirmModalEdit } = useConfirmEdit();
    const { confirmDelete, confirmModalDelete } = useConfirmDelete();
    const { confirmTransfer, confirmModalTransfer } = useConfirmTransfer();



    const [rows, setRows] = useState<StudentRow[]>([
        { numEtu: 12552, nom: "Dupont", prenom: "Jean", salle: "K111", codeAnonymat: "E12345", Note: 12 },
        { numEtu: 23456, nom: "Martin", prenom: "Marie", salle: "K111", codeAnonymat: "E67890", Note: 15 },
        { numEtu: 34567, nom: "Durand", prenom: "Paul", salle: "D404", codeAnonymat: "E54321", Note: 9 },
        { numEtu: 45678, nom: "Lefevre", prenom: "Sophie", salle: "D404", codeAnonymat: "E09876", Note: 14 },
        { numEtu: 56789, nom: "Moreau", prenom: "Luc", salle: "E505", codeAnonymat: "E11223", Note: 11 },
        { numEtu: 67890, nom: "Simon", prenom: "Emma", salle: "E505", codeAnonymat: "E44556", Note: 13 },
        { numEtu: 78901, nom: "Bernard", prenom: "Lucas", salle: "K111", codeAnonymat: "E77889", Note: 10 },
        { numEtu: 89012, nom: "Thomas", prenom: "Chloé", salle: "K111", codeAnonymat: "E99001", Note: 16 },
        { numEtu: 90123, nom: "Robert", prenom: "Hugo", salle: "D404", codeAnonymat: "E22334", Note: 8 },
        { numEtu: 11234, nom: "Richard", prenom: "Léa", salle: "D404", codeAnonymat: "E55667", Note: 17 },
        { numEtu: 12345, nom: "Petit", prenom: "Nathan", salle: "K111", codeAnonymat: "E88990", Note: 7 },
        { numEtu: 13456, nom: "Dubois", prenom: "Manon", salle: "K111", codeAnonymat: "E10112", Note: 18 },
        { numEtu: 14567, nom: "Morel", prenom: "Mathis", salle: "E505", codeAnonymat: "E13141", Note: 19 },
        { numEtu: 15678, nom: "Girard", prenom: "Camille", salle: "E505", codeAnonymat: "E51617", Note: 6 },
        { numEtu: 16789, nom: "Fournier", prenom: "Jules", salle: "D404", codeAnonymat: "E18191", Note: 20 },
        { numEtu: 17890, nom: "Lemoine", prenom: "Sarah", salle: "D404", codeAnonymat: "E20212", Note: 5 },
        { numEtu: 18901, nom: "Blanc", prenom: "Adrien", salle: "K111", codeAnonymat: "E22323", Note: 4 },
        { numEtu: 19012, nom: "Guerin", prenom: "Inès", salle: "K111", codeAnonymat: "E24252", Note: 3 },
        { numEtu: 20123, nom: "Muller", prenom: "Ethan", salle: "E505", codeAnonymat: "E26272", Note: 2 },
        { numEtu: 21234, nom: "Henry", prenom: "Clara", salle: "E505", codeAnonymat: "E28292", Note: 1 },
        { numEtu: 22345, nom: "Roussel", prenom: "Louis", salle: "D404", codeAnonymat: "E30302", Note: 0 },
        { numEtu: 23756, nom: "Nicolas", prenom: "Lina", salle: "D404", codeAnonymat: "E32322", Note: 12 },
        { numEtu: 24567, nom: "Mathieu", prenom: "Gabriel", salle: "K111", codeAnonymat: "E34342", Note: 14 },
        { numEtu: 25678, nom: "Clement", prenom: "Juliette", salle: "K111", codeAnonymat: "E36362", Note: 16 },
        { numEtu: 26789, nom: "Gauthier", prenom: "Maxime", salle: "E505", codeAnonymat: "E38382", Note: 18 },
        { numEtu: 27890, nom: "Garcia", prenom: "Zoé", salle: "E505", codeAnonymat: "E40402", Note: 20 },

    ]
    );

    const handleSaveRows = async (newRow: StudentRow, oldRows: StudentRow, params: any): Promise<StudentRow> => {
        const result = await confirm(oldRows, newRow);

        if (result) {

            setRows((rows) => rows.map((row) => (row.numEtu === result.numEtu ? result : row)));
        }

        return result;
    }

    useEffect(() => {
        setNoteModifiable(props.statut >= 4);
    }, []);

    const memeDico = (a: StudentRow, b: StudentRow): boolean => {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) {
            return false;
        }

        return keysA.every((key) => a[key as keyof StudentRow] === b[key as keyof StudentRow]);
    }

    const sallesUniques = Array.from(new Set(rows.map(row => row.salle)));


    const apiRef = useGridApiRef();

    const handleDelete = async (listeNumEtu: number[]) => {

        const result = await confirmDelete(listeNumEtu);
        console.log("Résultat de la confirmation de suppression :", result);
        if (result) {
            setRows((prevRows) => prevRows.filter((row) => !result.includes(row.numEtu)));
        }
    }

    const handleTransfer = async (listeNumEtu: number[], salle: string) => {
        const result = await confirmTransfer(listeNumEtu, salle);
        console.log("Transfert des étudiants avec les numéros :", result);

        if (result) {
            setRows((prevRows) => prevRows.map((row) =>
                result.includes(row.numEtu)
                    ? { ...row, salle: salle }
                    : row
            ));
        }

        console.log("Résultat de la confirmation de transfert :", result);

    }

    const handleConvocations = (listeNumEtu: number[]) => {
        console.log("Génération des convocations pour les étudiants avec les numéros :", listeNumEtu);
        // Logique de génération des convocations ici
    }


    return (
        <>
            {confirmModalDelete}
            {confirmModalEdit}
            {confirmModalTransfer}


            <Box sx={{ height: 500 }}>

                <DataGrid
                    showToolbar
                    slots={{ toolbar: Header } as any}
                    slotProps={{ toolbar: { selectedRows, handleDelete, handleTransfer, handleConvocations, setSalleFilter, salleFilter, sallesUniques } as HeaderProps } as any}
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
                    getRowId={(row) => row.numEtu}
                    loading={loading}
                    density='compact'
                    rows={salleFilter === "x" ? rows : rows.filter(row => row.salle === salleFilter)}
                    columns={columns}
                    hideFooter
                    checkboxSelection

                    processRowUpdate={(newRow, oldRow, params) =>
                        !memeDico(oldRow, newRow)
                            ? handleSaveRows(newRow, oldRow, params)
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
                        setSelectedRows(selectedRowsData as StudentRow[]);
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