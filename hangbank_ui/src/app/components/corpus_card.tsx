"use client";
import { PlayArrow } from "@mui/icons-material";
import { Paper, Typography, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";

interface CorpusCardProps{
    id: string,
    name: string,
    language: string,
    total_blocks: number,
    onSelect: (value: {id: string, name: string, language: string}) => void;
}

export default function CorpusCard({id, name, language, total_blocks, onSelect}: CorpusCardProps) {
    const { t } = useTranslation("common");
    return (
        <>
            <Paper elevation={3} sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography variant="h6">{name}</Typography>
                    <Typography variant="body1">{t("language")}: {language}</Typography>
                    <Typography variant="body1">{t("total_blocks")}: {total_blocks}</Typography>
                </div>
                <div style={{ alignSelf: "end", padding: 0, margin: 0 }}>
                    <IconButton onClick={() => {onSelect({id, name, language})}} size="large" color="primary" sx={{ padding: 0, margin: 0 }}>
                        <PlayArrow />
                    </IconButton>
                </div>
            </Paper>
        </>
    );
}