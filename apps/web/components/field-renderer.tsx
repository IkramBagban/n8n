"use client"

import { Input } from "@/components/ui/input"
import type { INodeProperties } from "../../../packages/nodes-base/types"

interface FieldRendererProps {
    property: INodeProperties
    value: string | number | boolean
    onChange: (value: string | number | boolean) => void
}

export function FieldRenderer({ property, value, onChange }: FieldRendererProps) {
    const currentValue = value || property.default || ""

    switch (property.type) {
        case 'string':
            return (
                <Input
                    type={property.typeOptions?.password ? "password" : "text"}
                    placeholder={property.placeholder || ""}
                    value={currentValue}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            )
        case 'hidden':
            return null
        default:
            return (
                <Input
                    value={currentValue}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            )
    }
}