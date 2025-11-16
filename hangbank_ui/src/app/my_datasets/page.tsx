"use client";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import DatasetCard, { ProjectType } from "../components/dataset_card";
import { Add, ArrowDropDown } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import api from "../axios";
import { Severity, useSnackbar } from "../contexts/SnackbarProvider";

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
    const {data: session} = useSession();
    const {showMessage} = useSnackbar();

    const [datasets, setDatasets] = useState<DatasetDisplayType[]>([]); //TODO: API call
    const router = useRouter();

    useEffect(() => {
        async function fetchMyDatasets(){
            try{
                if(!session) throw new Error("User is not logged in!");
                const res = await api.get<DatasetDisplayType[]>(`/dataset/user/${session.user.id}`);
                console.log(res.data);
                setDatasets(res.data);
            } catch(err){
                showMessage(t("could_not_load_datasets"), Severity.error);
            }
        }

        fetchMyDatasets();
        // console.log("Datasets: "+datasets);
    }, []);

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