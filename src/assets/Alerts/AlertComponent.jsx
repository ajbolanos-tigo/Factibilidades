import React from "react";
import { Alert } from "@aws-amplify/ui-react";

//Style
import "./style.css"

const AlertComponent = ({ alerts, onDismiss }) => {
    return (
        <div className='alert-container'>
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    variation={alert.variation}
                    heading={alert.heading}
                    isDismissible={true}
                    className={`alert ${alert.dismissed ? 'alert-dismissed' : ''}`}
                    onDismiss={() => onDismiss(alert.id)}
                >
                    {alert.text}
                </Alert>
            ))
            }
        </div >
    )
}

export default AlertComponent