/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type NewForm1kkInputValues = {};
export declare type NewForm1kkValidationValues = {};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type NewForm1kkOverridesProps = {
    NewForm1kkGrid?: PrimitiveOverrideProps<GridProps>;
} & EscapeHatchProps;
export declare type NewForm1kkProps = React.PropsWithChildren<{
    overrides?: NewForm1kkOverridesProps | undefined | null;
} & {
    onSubmit: (fields: NewForm1kkInputValues) => void;
    onChange?: (fields: NewForm1kkInputValues) => NewForm1kkInputValues;
    onValidate?: NewForm1kkValidationValues;
} & React.CSSProperties>;
export default function NewForm1kk(props: NewForm1kkProps): React.ReactElement;
