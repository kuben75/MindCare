import React from "react";

export interface IContactMethod {
    id: string,
    title: string,
    value: string,
    description: string,
    href?: string,
    icon: React.ReactNode
}