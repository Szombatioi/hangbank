import {
  AutoStories,
  OpenInNew,
  PlayArrow,
  SmartToy,
} from "@mui/icons-material";
import { Grid, Icon, IconButton, Paper, Typography } from "@mui/material";
import { Play } from "next/font/google";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { DatasetType } from "../my_datasets/overview/[id]/page";

export enum ProjectType {
  Corpus = 1,
  Convo = 2,
}

interface DatasetCardProps {
  id: string;
  title: string;
  corpusName: string;
  language: string;
  actualBlocks: number;
  totalBlocks: number;
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
    <>
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Grid container>
          <Grid size={11}>
            <Typography variant="h6">{title}</Typography>
          </Grid>
          <Grid size={1}>
            {type === ProjectType.Corpus ? (
              <Icon sx={{ margin: 0 }}>
                <AutoStories />
              </Icon>
            ) : (
              <Icon sx={{ margin: 0 }}>
                <SmartToy />
              </Icon>
            )}
          </Grid>
          <Grid size={12}>
            <Typography variant="h6">{corpusName}</Typography>
          </Grid>

          <Grid size={12}>
            <Typography variant="body1">{language}</Typography>
          </Grid>
          <Grid size={12}>
            <Typography variant="body1">
              {actualBlocks}/{totalBlocks}
            </Typography>
          </Grid>
          <Grid size={11}>
            <Typography variant="body1">
              {t("speaker")}: {speakerName}
            </Typography>
          </Grid>
          <Grid size={1}>
            <IconButton
              onClick={() => router.push(`/my_datasets/overview/${id}`)}
              size="large"
              color="primary"
              sx={{ padding: 0, margin: 0 }}
            >
              <OpenInNew />
            </IconButton>
          </Grid>
        </Grid>
        {/* <div style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: 0,
            }}
          >
            <Typography variant="h6">{title}</Typography>
            {type === ProjectType.Corpus ? (
              <Icon sx={{ margin: 0 }}>
                <AutoStories />
              </Icon>
            ) : (
              <Icon sx={{ margin: 0 }}>
                <SmartToy />
              </Icon>
            )}
          </div>
          <Typography variant="h6">{corpusName}</Typography>
          <Typography variant="body1">{language}</Typography>
          <Typography variant="body1">
            {actualBlocks}/{totalBlocks}
          </Typography>
          <Typography variant="body1">
            {t("speaker")}: {speakerName}
          </Typography>
        </div>
        <div style={{ alignSelf: "end", padding: 0, margin: 0 }}>
          <IconButton
            onClick={() => router.push(`/my_datasets/overview/${id}`)}
            size="large"
            color="primary"
            sx={{ padding: 0, margin: 0 }}
          >
            <OpenInNew />
          </IconButton>
        </div> */}
      </Paper>
    </>
  );
}
