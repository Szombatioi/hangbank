"use client";
import SelectCorpusDialog from '@/app/components/dialogs/select_corpus_dialog';
import { AutoStories, Search, SmartToy } from '@mui/icons-material';
import { Box, Button, Grid, IconButton, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';


export default function NewProjectPage() {
    const contentIdentifiers = ['types', 'config', 'overview'];
    const [active, setActive] = useState<'types' | 'config' | 'overview'>('types');

    //For dialog
    const [open, setOpen] = useState(false);


    const handleCorpusBasedClick = () => {
        //set

        //toggle new view
    }

    const handleConversationBasedClick = () => {

    }

    const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [chosenCorpus, setChosenCorpus] = useState<string>("Sample Corpus 1"); // TODO: type

    useEffect(() => {
        // Request mic permissions first
        async function getMicrophones() {
            try {
                // Must ask for permission before enumerateDevices returns full info
                await navigator.mediaDevices.getUserMedia({ audio: true });

                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter((d) => d.kind === 'audioinput');
                setMics(audioInputs);
            } catch (err) {
                console.error(err);
                setError('Could not access microphones.');
            }
        }

        getMicrophones();
    }, []);

    return (

        <div className="relative w-full flex justify-center items-center">
            <AnimatePresence mode="wait">
                {active === 'types' && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}        // Start below
                        animate={{ opacity: 1, y: 0 }}          // Swim upward
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="flex flex-col items-center justify-center h-screen w-screen"
                        style={{
                            height: '100vh',
                            width: '100vw',
                        }}
                    >
                        <div style={{ height: "100%", display: "flex", flexDirection: "row", gap: 64, justifyContent: "center", alignItems: "center" }}>
                            <Button onClick={() => { handleCorpusBasedClick(); setActive('config') }} style={{ border: "4px solid lightgrey", borderRadius: 8, width: 200, height: 200, display: 'flex', flexDirection: 'column' }}>
                                <AutoStories fontSize='large' />
                                Corpus based
                            </Button>
                            <Button onClick={() => { handleConversationBasedClick(); setActive('config') }} style={{ border: "4px solid lightgrey", borderRadius: 8, width: 200, height: 200, display: 'flex', flexDirection: 'column' }}>
                                <SmartToy fontSize='large' />
                                Conversation based
                            </Button>
                        </div>
                    </motion.div>
                )}

                {active === 'config' && (
                    <motion.div
                        key="comp2"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5 }}
                        className="absolute"
                    >

                        <Box p={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Paper sx={{ width: "65%", padding: 4 }}>
                                <Grid container spacing={2}>
                                    <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
                                        <Typography sx={{ width: 200, fontWeight: 500 }}>Title:</Typography>
                                    </Grid>
                                    <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
                                        <TextField
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            placeholder="Enter title"
                                        />
                                    </Grid>
                                    <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
                                        <Typography sx={{ width: 200, fontWeight: 500 }}>Speaker:</Typography>
                                    </Grid>
                                    <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
                                        <TextField
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            placeholder="Enter speaker name"
                                            disabled
                                        />
                                    </Grid>
                                    <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
                                        <Typography sx={{ width: 200, fontWeight: 500 }}>Microphone:</Typography>
                                    </Grid>
                                    <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
                                        <Select defaultValue={mics.length > 0 ? mics[0].deviceId : ''} fullWidth>
                                            {mics.map((mic) => (
                                                <MenuItem key={mic.deviceId} value={mic.deviceId}>
                                                    {mic.label || `Microphone ${mic.deviceId}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Grid>

                                    {/* TODO: only if we chose Nr. 1 */}
                                    {/* Corpus */}
                                    <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
                                        <Typography sx={{ width: 200, fontWeight: 500 }}>Corpus: </Typography>
                                    </Grid>
                                    <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
                                        <TextField disabled fullWidth value={chosenCorpus} />
                                        <IconButton onClick={() => { setOpen(true) }} color='primary'>
                                            <Search />
                                        </IconButton>
                                    </Grid>

                                    {/* Context */}
                                    <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
                                        <Typography sx={{ width: 200, fontWeight: 500 }}>Recording context:</Typography>
                                    </Grid>
                                    <Grid size={6} sx={{ display: "flex", alignItems: "center" }}>
                                        <TextField multiline rows={5} fullWidth />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>

                        <SelectCorpusDialog open={open} onClose={() => setOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}