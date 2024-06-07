import { object, string, number, date } from "yup";

export const formSchema = object().shape({
    latitude: number().required("Required"),
    longitude: number().required("Required"),
    bandwidth: number().positive().required("Required"),
})