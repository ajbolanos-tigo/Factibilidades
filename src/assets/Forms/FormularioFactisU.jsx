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
            username: user.username,
            createdAt: '',
            latitude: '',
            longitude: '',
            building: 'no',
            bandwidth: '',
            productType: 'GPON',
        },
        validationSchema: formSchema,
        onSubmit: values => {
            values.createdAt = getSortKey()
            onClose()
            console.log(JSON.stringify(values, null, 2));
        }
    });

    return (
        <Card variation="elevated">
            <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="small">
                    <div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                            id="latitude"
                            name="latitude"
                            placeholder="Latitude"
                            type="number"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.latitude}
                            hasError={errors.latitude && touched.latitude}
                        />
                        {touched.latitude && errors.latitude ? (
                            <div style={styles.errorMgs}>{errors.latitude}</div>
                        ) : null}
                    </div>

                    <div>
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                            id="longitude"
                            name="longitude"
                            placeholder="Longitude"
                            type="number"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.longitude}
                            hasError={errors.longitude && touched.longitude}
                        />
                        {touched.longitude && errors.longitude ? (
                            <div style={styles.errorMgs}>{errors.longitude}</div>
                        ) : null}
                    </div>

                    <div>
                        <Label htmlFor="bandwidth">Bandwidth (mb)</Label>
                        <Input
                            id="bandwidth"
                            name="bandwidth"
                            placeholder="Bandwidth"
                            type="number"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.bandwidth}
                            hasError={errors.bandwidth && touched.bandwidth}
                        />
                        {touched.bandwidth && errors.bandwidth ? (
                            <div style={styles.errorMgs}>{errors.bandwidth}</div>
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
                            name="productType"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.productType}
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
