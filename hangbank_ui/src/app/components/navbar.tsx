import { AccountCircle, Dataset, Title } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  SvgIcon,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { signOut, SignOutParams } from "next-auth/react";
import { pages } from "next/dist/build/templates/app-page";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { setAuthToken } from "../axios";

interface PageType {
  name: string;
  onClick?: () => void;
}

interface NavbarProps {
}

export default function Navbar({  }: NavbarProps) {
  {
    const router = useRouter();
    const [pages, setPages] = useState<PageType[]>([]);
    const {t} = useTranslation("common");

    useEffect(() => {
      setPages([{ name: t("home"), onClick: () => router.push("/") }]);
    }, [t]);
    return (
      <AppBar
        sx={{
          backgroundColor: "#F9F8F6", // white background
          color: "#000000", // dark text
          marginBottom: 2,
        }}
        position="sticky"
      >
        <Container sx={{ color: "FFF" }} maxWidth="xl">
          <Toolbar disableGutters>
          <Image
            src="/hangbank_logo.svg"
            alt="Hangbank Logo"
            width={40}
            height={40}
            onClick={() => router.push("/")}
          />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              HANGBANK
            </Typography>

            {/* Pages */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page, i) => (
                <Button
                  key={i}
                  onClick={() => page.onClick && page.onClick!()}
                  sx={{ my: 2, color: "inherit", display: "block" }}
                >
                  {page.name}
                </Button>
              ))}
            </Box>
            
            <Tooltip title={t("my_datasets")}>
            <IconButton onClick={()=>{router.push("/my_datasets")}}>
              <Dataset />
            </IconButton>
            </Tooltip>
            <Tooltip title={t("account")}>
            <IconButton onClick={()=>{router.push("/account")}}>
              <AccountCircle />
            </IconButton>
            </Tooltip>
            <Button
                  onClick={() => {
                    setAuthToken(null);
                    router.push("/auth/login");
                  }} 
                  sx={{ my: 2, color: "inherit", display: "block" }}
                >
                  {t("signout")}
                </Button>
            <Box sx={{ flexGrow: 0 }}></Box>
          </Toolbar>
        </Container>
      </AppBar>
    );
  }
}
