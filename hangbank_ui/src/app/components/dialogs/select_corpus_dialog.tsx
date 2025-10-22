"use client";
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CorpusCard from "../corpus_card";
import { Close } from "@mui/icons-material";

interface SelectCorpusDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function SelectCorpusDialog({ open, onClose }: SelectCorpusDialogProps) {
    const { t } = useTranslation("common");
    const [corpora, setCorpora] = useState<string[]>(["Sample Corpus 1", "Sample Corpus 2", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",]); // TODO: type and API call
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={
            {
                sx: {
                    height: "75vh",       // 75% of viewport height
                    maxHeight: "90vh",    // optional: prevent overflow
                },
            }
        }>
            <IconButton 
            onClick={onClose}
            sx={(theme) => ({
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
            })}>
                <Close />
            </IconButton>
            <DialogTitle><Typography variant="h4" align="center">{t("select_a_corpus")}</Typography></DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {corpora.map((corpus, index) => (
                        <Grid key={index} size={3}>
                            <CorpusCard />
                        </Grid>
                    ))
                    }
                </Grid>
            </DialogContent>
        </Dialog >
    );
}