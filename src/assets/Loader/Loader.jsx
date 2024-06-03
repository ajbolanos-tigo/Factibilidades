import { Loader } from "@aws-amplify/ui-react";
import React from "react";
import './style.css'

const LoaderFactis = () => {
    return (
        <div className="loading-overlay">
            <div className="loader-container">
                <Loader size="large" variation="linear" />
            </div>
        </div>
    )
}

export default LoaderFactis