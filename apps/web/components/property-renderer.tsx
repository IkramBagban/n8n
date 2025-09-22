"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info } from "lucide-react"

interface PropertyOption {
    name: string;
    value: string | number | boolean;
}

interface Property {
    name: string;
    displayName: string;
    type: string;
    required?: boolean;
    default?: string | number | boolean;
    placeholder?: string;
    description?: string;
    rows?: number;
    options?: PropertyOption[];
}

interface PropertyRendererProps {
    property: Property
    value: string | number | boolean
    onChange: (value: string | number | boolean) => void
}

export function PropertyRenderer({ property, value, onChange }: PropertyRendererProps) {
    if (!property) return null

    const currentValue = value || property.default || ''

    switch (property.type) {
        case 'notice':
            return (
                <div
                    className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Info className="w-3 h-3 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <div
                                className="text-sm text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: property.displayName?.replace(
                                        /<a data-action="([^"]*)">/g,
                                        '<a class="text-orange-600 hover:text-orange-700 underline cursor-pointer font-medium" data-action="$1">'
                                    ) || ''
                                }}
                            />
                        </div>
                    </div>
                </div>
            )

        case 'callout':
            return (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
                    {property.displayName}
                </div>
            )

        case 'string':
            return (
                <Input
                    placeholder={property.placeholder || ''}
                    value={currentValue.toString()}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-2"
                />
            )

        case 'number':
            return (
                <Input
                    type="number"
                    value={currentValue.toString()}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="mt-2"
                />
            )

        case "options":
            return (
                <Select
                    value={currentValue.toString()}
                    onValueChange={(value) => onChange(value)}
                >
                    <SelectTrigger className="mt-2">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {property.options?.map((option) => (
                            <SelectItem key={option.value.toString()} value={option.value.toString()}>
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )

        case 'boolean':
            return (
                <Select
                    value={currentValue.toString()}
                    onValueChange={(value) => onChange(value === 'true')}
                >
                    <SelectTrigger className="mt-2">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                </Select>
            )

        case 'textarea':
            return (
                <Textarea
                    placeholder={property.placeholder || ''}
                    value={currentValue.toString()}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-2"
                    rows={property.rows || 3}
                />
            )

        // default:
        //     return (
        //         <Input
        //             placeholder={property.placeholder || ''}
        //             value={currentValue.toString()}
        //             onChange={(e) => onChange(e.target.value)}
        //             className="mt-2"
        //         />
        //     )
    }
}