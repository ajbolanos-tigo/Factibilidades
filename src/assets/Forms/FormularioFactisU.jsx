import React from "react";
import { useFormik } from "formik";
import { Button, Card, Flex, Grid, Input, Label, SelectField } from "@aws-amplify/ui-react";
import { formSchema } from "../schemas";

//Style
import "./styles.css"
import { styles } from "./styles";

const FactiUnitaria = ({ onClose, user }) => {
    const validate = values => {
        const errors = {};
        if (!values.lat) errors.lat = 'Required';
        if (!values.lon) errors.lon = 'Required';
        return errors;
    };

    const getSortKey = () => {
        const timestamp = new Date().toISOString();
        return timestamp
    }

    const { handleBlur, handleChange, handleSubmit, touched, values, errors } = useFormik({
        initialValues: {
            lat: '',
            lon: '',
            building: 'no',
            speed: '',
            medio: 'GPON',
            username: user.username,
            sortKey: '',
        },
        validationSchema: formSchema,
        onSubmit: values => {
            values.sortKey = getSortKey()
            onClose()
            alert(JSON.stringify(values, null, 2));
        }
    });

    return (
        <Card variation="elevated">
            <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="small">
                    <div>
                        <Label htmlFor="lat">Latitude</Label>
                        <Input
                            id="lat"
                            name="lat"
                            placeholder="Latitude"
                            type="number"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.lat}
                            hasError={errors.lat && touched.lat}
                        />
                        {touched.lat && errors.lat ? (
                            <div style={styles.errorMgs}>{errors.lat}</div>
                        ) : null}
                    </div>

                    <div>
                        <Label htmlFor="lon">Longitude</Label>
                        <Input
                            id="lon"
                            name="lon"
                            placeholder="Longitude"
                            type="number"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.lon}
                            hasError={errors.lon && touched.lon}
                        />
                        {touched.lon && errors.lon ? (
                            <div style={styles.errorMgs}>{errors.lon}</div>
                        ) : null}
                    </div>

                    <div>
                        <Label htmlFor="speed">Bandwidth (mb)</Label>
                        <Input
                            id="speed"
                            name="speed"
                            placeholder="Bandwidth"
                            type="number"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.speed}
                            hasError={errors.speed && touched.speed}
                        />
                        {touched.speed && errors.speed ? (
                            <div style={styles.errorMgs}>{errors.speed}</div>
                        ) : null}
                    </div>

                    <Grid
                        templateColumns="1fr 1fr"
                        columnGap="0.5rem"
                    >
                        <SelectField
                            label="Building"
                            name="building"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.building}
                        >
                            <option value="no">No</option>
                            <option value="si">Yes</option>
                        </SelectField>
                        <SelectField
                            label="Product type"
                            name="medio"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.medio}
                        >
                            <option value="GPON">GPON</option>
                        </SelectField>
                    </Grid>
                </Flex>
                <Grid templateColumns="1fr 1fr" style={styles.buttonsArea}>
                    <Button variation="primary" colorTheme="error" style={styles.cancelButton} onClick={onClose}>Cancel</Button>
                    <Button variation="primary" type="submit" style={styles.submitButton}>Submit</Button>
                </Grid>
            </form>
        </Card>
    );
};

export default FactiUnitaria;
