"use client";
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CorpusCard from "../corpus_card";
import { Close } from "@mui/icons-material";
import api from "@/app/axios";
import CorpusHeaderDto from "@/app/dto/corpus_header";

interface SelectCorpusDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (value: {id: string, name: string, language: string}) => void;
}

export default function SelectCorpusDialog({ open, onClose, onSelect }: SelectCorpusDialogProps) {
    const { t } = useTranslation("common");
    const [corpora, setCorpora] = useState<CorpusHeaderDto[]>([]); // TODO: type and API call

    useEffect(() => {
        async function fetchCorpora(){
            const corpora_res = await api.get<CorpusHeaderDto[]>("/corpus");
            console.log(corpora_res.data);
            setCorpora(corpora_res.data);
        }

        fetchCorpora();
    }, [])

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
            <DialogTitle><Typography variant="h4" component="div" align="center">{t("select_a_corpus")}</Typography></DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {corpora.map((corpus, index) => (
                        <Grid key={index} size={3}>
                            <CorpusCard onSelect={(val) => {onSelect(val); onClose()}} id={corpus.id} name={corpus.name} language={corpus.language} total_blocks={corpus.total_blocks} />
                        </Grid>
                    ))
                    }
                </Grid>
            </DialogContent>
        </Dialog >
    );
}