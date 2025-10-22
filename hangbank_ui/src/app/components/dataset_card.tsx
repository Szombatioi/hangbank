import { PlayArrow } from "@mui/icons-material";
import { IconButton, Paper, Typography } from "@mui/material";
import { Play } from "next/font/google";

interface DatasetCardProps {

}

export default function DatasetCard(props: DatasetCardProps) {
    return (
        <>
            <Paper elevation={3} sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography variant="h6">Title</Typography>
                    <Typography variant="h6">Corpus name</Typography>
                    <Typography variant="body1">HU</Typography>
                    <Typography variant="body1">3/15</Typography>
                    <Typography variant="body1">Speaker: Oliver Szombati (You)</Typography>
                </div>
                <div style={{alignSelf: "end", padding: 0, margin: 0}}>
                    <IconButton size="large" color="primary" sx={{padding: 0, margin: 0}}>
                        <PlayArrow />
                    </IconButton>
                </div>
            </Paper>
        </>
    );
}