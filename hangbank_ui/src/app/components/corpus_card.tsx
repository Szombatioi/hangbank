import { PlayArrow } from "@mui/icons-material";
import { Paper, Typography, IconButton } from "@mui/material";

export default function CorpusCard() {
    return (
        <>
            <Paper elevation={3} sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography variant="h6">Corpus name</Typography>
                    <Typography variant="body1">Language: HU</Typography>
                    <Typography variant="body1">Total blocks: 512</Typography>
                </div>
                <div style={{ alignSelf: "end", padding: 0, margin: 0 }}>
                    <IconButton size="large" color="primary" sx={{ padding: 0, margin: 0 }}>
                        <PlayArrow />
                    </IconButton>
                </div>
            </Paper>
        </>
    );
}