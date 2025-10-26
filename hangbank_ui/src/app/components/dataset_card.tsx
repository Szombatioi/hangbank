import { OpenInNew, PlayArrow } from "@mui/icons-material";
import { IconButton, Paper, Typography } from "@mui/material";
import { Play } from "next/font/google";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface DatasetCardProps {
    id: string;
    title: string;
    corpusName: string;
    language: string;
    actualBlocks: number;
    totalBlocks: number;
    speakerName: string;
}

export default function DatasetCard({id, title, corpusName, language, actualBlocks, totalBlocks, speakerName}: DatasetCardProps) {
    const { t } = useTranslation("common");
    const router = useRouter();
    return (
        <>
            <Paper elevation={3} sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="h6">{corpusName}</Typography>
                    <Typography variant="body1">{language}</Typography>
                    <Typography variant="body1">{actualBlocks}/{totalBlocks}</Typography>
                    <Typography variant="body1">{t("speaker")}: {speakerName}</Typography>
                </div>
                <div style={{alignSelf: "end", padding: 0, margin: 0}}>
                    <IconButton onClick={() => router.push(`/my_datasets/overview/${id}`)} size="large" color="primary" sx={{padding: 0, margin: 0}}>
                        <OpenInNew />
                    </IconButton>
                </div>
            </Paper>
        </>
    );
}