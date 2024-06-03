import { object, string, number, date } from "yup";

export const formSchema = object().shape({
    lat: number().required("Required"),
    lon: number().required("Required"),
    speed: number().positive().required("Required"),
})