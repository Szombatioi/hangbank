import {
  AutoStories,
  OpenInNew,
  SmartToy,
} from "@mui/icons-material";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export enum ProjectType {
  Corpus = 1,
  Convo = 2,
}

interface DatasetCardProps {
  id: string;
  title: string;
  corpusName?: string;
  language: string;
  actualBlocks?: number;
  totalBlocks?: number;
  speakerName: string;
  type: ProjectType;
}

export default function DatasetCard({
  id,
  title,
  type,
  corpusName,
  language,
  actualBlocks,
  totalBlocks,
  speakerName,
}: DatasetCardProps) {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        width: "23vw",
        height: "21vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* === TOP ROW === */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">{title}</Typography>

        {type === ProjectType.Corpus ? <AutoStories /> : <SmartToy />}
      </Box>

      {/* === MIDDLE EXPANDING SECTION === */}
      <Box
        sx={{
          flexGrow: 1,     // <-- THIS makes the middle expand
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",  // Center contents vertically inside the free space
          gap: 0.5,
        }}
      >
        {corpusName && (
          <Typography variant="h6">Corpus: {corpusName}</Typography>
        )}

        {actualBlocks != null && totalBlocks != null && (
          <Typography variant="body1">
            {actualBlocks}/{totalBlocks}
          </Typography>
        )}

        
      </Box>

      {/* === BOTTOM ROW === */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
        <Typography variant="body1">{language}</Typography>
        <Typography variant="body1">
          {t("speaker")}: {speakerName}
        </Typography>
        </div>

        <IconButton
          onClick={() => router.push(`/my_datasets/overview/${id}/${type === ProjectType.Corpus ? "corpus" : "convo"}`)}
          size="large"
          color="primary"
          sx={{ padding: 0, margin: 0, alignSelf: "end" }}
        >
          <OpenInNew />
        </IconButton>
      </Box>
    </Paper>
  );
}
