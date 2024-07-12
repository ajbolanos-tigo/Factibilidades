import React from "react";
import { Card } from "@aws-amplify/ui-react";

const DataForm = ({ data }) => {
    return (<>
        <Card>
            {JSON.stringify(data)}
        </Card>
    </>)
}

export default DataForm