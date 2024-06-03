import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

export default function Image({ src, width, height, style }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
    }, [src])

    const handleLoad = () => {
        setIsLoading(false);
    }

    const handleError = () => {
        setIsLoading(false);
    }

    return (
        <div style={{...style, position: "relative"}}>
            {isLoading && <p style={{...style, position: "absolute", display: "flex", alignItems: "center", justifyContent: "center"}}> <CircularProgress/> </p>}
            {/* { isLoading && <Skeleton variant="rectangular" width={style.width} height={style.height}/> } */}
            <img
                hidden={isLoading}
                style={style}
                src={src}
                // loading="lazy"
                onLoad={handleLoad}
                onError={handleError}
                alt="dynamic content"
            />
        </div>
    )
}