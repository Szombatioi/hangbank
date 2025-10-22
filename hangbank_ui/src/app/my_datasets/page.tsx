"use client";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import DatasetCard from "../components/dataset_card";
import { Add, ArrowDropDown } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MyDatasetsPage() {
    const { t } = useTranslation("common");

    const [datasets, setDatasets] = useState<string[]>(["Dataset 1", "Dataset 2", "Dataset 3"]); //TODO: API call
    const router = useRouter();

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
                            <DatasetCard />
                        </Grid>
                    ))
                }
            </Grid>
        </Box>
    );
}