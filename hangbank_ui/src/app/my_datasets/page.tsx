"use client";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import DatasetCard, { ProjectType } from "../components/dataset_card";
import { Add, ArrowDropDown } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getUserByToken } from "../axios";
import { Severity, useSnackbar } from "../contexts/SnackbarProvider";
import { useAuth } from "../contexts/AuthContext";

interface DatasetDisplayType{
    id: string;
    title: string;
    corpusName: string;
    language: string;
    actualBlocks: number;
    maxBlocks: number;
    speakerName: string; 
    type: ProjectType;
}

export default function MyDatasetsPage() {
    const { t } = useTranslation("common");
    const {showMessage} = useSnackbar();
    const {user, loading} = useAuth();

    const [datasets, setDatasets] = useState<DatasetDisplayType[]>([]); //TODO: API call
    const router = useRouter();

    useEffect(() => {
        if(loading || !user) return;
        async function fetchMyDatasets(){
            try{
                const res = await api.get<DatasetDisplayType[]>(`/dataset/user/${user!.id}`);
                console.log("Datasets: ", res.data);
                setDatasets(res.data);
            } catch(err){
                console.error(err);
                showMessage(t("could_not_load_datasets"), Severity.error);
            }
        }

        fetchMyDatasets();
        // console.log("Datasets: "+datasets);
    }, [loading, user]);

    return (
        <Box p={4}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Typography variant="h4" gutterBottom>
                    {t("my_datasets")}
                </Typography>
                <Button onClick={() => {router.push("/project/new")}} size="large" variant="contained" color="primary" sx={{ mb: 3 }} endIcon={<Add />}>
                    {t("new")}
                </Button>
            </div>
            <Grid container spacing={2}>
                {
                    datasets.map((i, index) => (
                        <Grid size={3} key={index}>
                            <DatasetCard id={i.id} type={i.type} title={i.title} corpusName={i.corpusName} language={i.language} actualBlocks={i.actualBlocks} totalBlocks={i.maxBlocks} speakerName={i.speakerName} />
                        </Grid>
                    ))
                }
            </Grid>
        </Box>
    );
}