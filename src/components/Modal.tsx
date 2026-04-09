import { Close } from "@mui/icons-material";
import { Box, colors, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

const ANIMATION_DUREE = 200;

/**
 * Modal, avec backdrop, centrage et entête
 */
export function Modal({ children, onClose, titre, width, height, newbgcolor }: { children: React.ReactNode; onClose?: () => void; titre: string, width?: string, height?: string, newbgcolor?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const closeTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const id = requestAnimationFrame(() => setIsVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    const handleClose = () => {
        if (!isVisible) {
            return;
        }
        setIsVisible(false);
        closeTimeoutRef.current = window.setTimeout(() => {
            onClose?.();
        }, ANIMATION_DUREE);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            opacity: isVisible ? 1 : 0,
            transition: `opacity ${ANIMATION_DUREE}ms ease`
        }}>
            <Box borderRadius={2} bgcolor="background.paper" boxShadow={5} sx={{ overflow: "hidden" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" bgcolor={newbgcolor ?? colors.blue[100]} p={1} gap={4}>
                    <Typography variant="h6" ml={2} my={1}>{titre}</Typography>
                    {onClose && <IconButton onClick={() => handleClose()} size="large"><Close /></IconButton>}
                </Stack>
                <Box width={width ?? "100%"} height={height ?? "100%"} >
                    {children}
                </Box>
            </Box>
        </div>
    );
}