import { TwitchEmbed } from 'react-twitch-embed';
import { Button, TextField, Box, CssBaseline, createMuiTheme, ThemeProvider, Paper, Card, CardContent, IconButton, styled } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React, { useState, useRef, useEffect } from 'react';
import { largestRect } from "rect-scaler";

const theme = createMuiTheme({
    palette: {
        type: 'dark'
    },
});

function App() {
    const [channels, setChannels] = useState([]);
    const [index, setIndex] = useState(0);
    const [tileWidth, setTileWidth] = useState(null);
    const [tileHeight, setTileHeight] = useState(null);
    const resizeTimer = useRef();
    const textInput = useRef();
    const gridRef = useRef();

    const onAdd = () => {
        // When "add" button is pressed, add the current text input to the channel list
        setChannels((oldChannels) => [...oldChannels, [textInput.current.value, index]]);
        // Increment the index (this index is used as a key, since the channel name could occurs more than once)
        setIndex((oldIndex) => oldIndex + 1);
    }

    const onRemove = (id) => {
        // Remove the channel corresponding to the id
        setChannels((oldChannels) => oldChannels.filter(channel => channel[1] !== id));
    }

    const adjustGrid = () => {
        // Calculate optimal grid layout
        if (gridRef.current && channels.length > 0) {
            // Get area and number of tiles to be places
            const gridWidth = gridRef.current.clientWidth;
            const gridHeight = gridRef.current.clientHeight;
            const numRects = channels.length;
            
            // Streams should be 16:9
            const rectWidth = 16;
            const rectHeight = 9;
            
            // Use "rect-scaler" library to calculate most optimal tile size
            const { width, height } = largestRect(gridWidth * .975, gridHeight * .975, numRects, rectWidth, rectHeight);
            setTileWidth((((width) / gridWidth) * 100) + "%");
            setTileHeight((((height) / gridHeight) * 100) + "%");
        }
    };

    const handleResize = () => {
        // Only handle resize after the screen has not been resized for 100 ms (otherwise causes lag)
        clearTimeout(resizeTimer.current)
        resizeTimer.current = setTimeout(() => {
            // Recalculate the grid layout
            adjustGrid();
        }, 100)
    };

    useEffect(() => {
        // Adjust grid layout at start and whenever channels are added/removed
        adjustGrid();
        window.addEventListener('resize', handleResize);
        return (() => {
            window.removeEventListener('resize', handleResize);
        });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channels.length]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box display="flex" flexDirection="column" height="100vh">
                <Box ref={gridRef} height="100%" display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-evenly" overflow="clip">
                    {tileWidth && tileHeight && channels.map((channel) =>
                        <Box key={channel[1]} minWidth={tileWidth} height={tileHeight}>
                            <StreamCard id={channel[1]} channelName={channel[0]} handleClick={onRemove} />
                        </Box>
                    )}
                </Box>
                <Navigation textRef={textInput} handleClick={onAdd}></Navigation>
            </Box>
        </ThemeProvider>
    );
}

// Stream component (displays actual stream)
function Stream(props) {
    return (
        <TwitchEmbed
            channel={props.channelName}
            id={props.id}
            theme="dark"
            width="100%"
            height="100%"
            withChat={false}
        />
    )
}

// Stream "card" component (styling around actual stream)
function StreamCard(props) {
    const StyledIconButton = styled(IconButton)({
        padding: '6px',
    });

    return (
        <Card style={{ position: "relative", width: "100%", height: "100%" }}>
            <Box style={{ position: "absolute", right:"0px"}}>
                <StyledIconButton onClick={() => { props.handleClick(props.id); }} >
                    <CloseIcon fontSize="small"></CloseIcon>
                </StyledIconButton>
            </Box>
            <CardContent style={{ height: "100%", padding: "0px" }}>
                <Stream channelName={props.channelName} id={props.channelName + props.id} />
            </CardContent>
        </Card>
    );
}

// Bottom-navigation component (handles user input)
function Navigation(props) {
    return (
        <Paper>
            <Box display="flex" justifyContent="center" alignItems="center">
                <Box m={2}>
                    <TextField inputRef={props.textRef} label="Stream Name" variant="filled" onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            props.handleClick();
                        }
                    }} />
                </Box>
                <Box m={2}>
                    <Button variant="contained" color="primary" onClick={() => { props.handleClick(); }}>
                        Add
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}

export default App;
