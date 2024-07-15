import React from "react";
import { Button, Card, Flex, ScrollView, Icon, Text } from "@aws-amplify/ui-react";

import "./style.css"

const IconSave = () => {
    return (
        <Icon
            ariaLabel=""
            pathData="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12ZM6 6H15V10H6V6Z"
        />
    );
};

const DataForm = ({ data, onClose }) => {
    const copyToClipboard = () => {
        const textToCopy = data.aprobado ? `
                            --FACTIBILIAD REMOTO GPON-- ${data.mensaje}
                            Busqueda producto:
                            Latitud: ${data.latitude} Longitud: ${data.longitude}
                            Bandwidth: ${data.bandwidth}
                            MUFA PROPUESTA
                            Mufa: ${data.mufa} ${data.nombre}
                            Distancia al cliente: ${data.distanciaMetraje}
                            olt: ${data.olt}
                            frame: ${data.frame}
                            slot: ${data.slot}
                            port: ${data.port}
                            remantente: ${data.remantente}
                            Coordenadas [${data.mufa_lat}, ${data.mufa_long}]
                            ${data.building === "yes" ? "Comentarios:\nMufa interna" : ""}
                                    ` : `
                            --FACTIBILIAD REMOTO GPON-- NO APROBADO
                            Busqueda producto:
                            Latitud: ${data.latitude} Longitud: ${data.longitude}
                            Bandwidth: ${data.bandwidth}
                        `;

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Texto copiado al portapapeles');
        }).catch(err => {
            console.error('Error al copiar el texto: ', err);
        });
    };

    return (<>
        <Card className="card">
            <Flex>
                <ScrollView height="300px" width="550px" maxWidth="100%">
                    <Text fontSize="1.2em" style={styles.marginBottom}>--FACTIBILIAD REMOTO GPON-- {data.mensaje}</Text>
                    <Text fontSize="1.13em" style={styles.left_align_text}>Busqueda producto: </Text>
                    <Text style={styles.left_align_text}>Latitud: {data.latitude} Longitud: {data.longitude}</Text>
                    <Text style={{ ...styles.left_align_text, ...styles.marginBottom }}>Bandwidth: {data.bandwidth}</Text>
                    {data.aprobado && (
                        <>
                            <Text fontSize="1.13em" style={styles.left_align_text}>MUFA PROPUESTA</Text>
                            <Text style={styles.left_align_text}>Mufa: {data.mufa}   {data.nombre}</Text>
                            <Text style={styles.left_align_text}>Distancia al cliente: {data.distanciaMetraje}</Text>
                            <Text style={styles.left_align_text}>olt: {data.olt}</Text>
                            <Text style={styles.left_align_text}>frame: {data.frame}</Text>
                            <Text style={styles.left_align_text}>slot: {data.slot}</Text>
                            <Text style={styles.left_align_text}>port: {data.port}</Text>
                            <Text style={styles.left_align_text}>remantente: {data.remantente}</Text>
                            <Text style={styles.left_align_text}>Coordenadas [{data.mufa_lat}, {data.mufa_long}]</Text>
                            {data.building === "yes" && (
                                <>
                                    <Text style={styles.left_align_text} fontSize="1.17em">Comentarios: </Text>
                                    <Text style={styles.left_align_text}>Mufa interna</Text>
                                </>
                            )}
                        </>
                    )}
                    {/* {JSON.stringify(data)} */}
                </ScrollView>
                <Flex direction="column" justifyContent="center" alignItems="center" alignContent="flex-start" wrap="nowrap" gap="1rem">
                    <Button variation="primary" onClick={copyToClipboard}>Copiar</Button>
                    <Button gap="0.2rem">
                        <IconSave /> Save
                    </Button>
                    <Button variation="primary" colorTheme="error" onClick={onClose}>Cerrar</Button>
                </Flex>
            </Flex>
        </Card>
    </>)
}

const styles = {
    left_align_text: {
        textAlign: "left",
    },
    marginBottom: {
        marginBottom: '8px'
    }
}

export default DataForm