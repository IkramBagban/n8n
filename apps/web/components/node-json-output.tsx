
const renderKeyValue = (key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
        return (
            <div
                key={key}
                className="mb-3 flex flex-col gap-2 "
            >
                <span className="text-sm  text-gray-700 px-3 py-1 bg-gray-200 rounded-md inline-block w-fit">
                    {key}
                </span>
                <div className="ml-4 flex flex-col gap-2">
                    {Object.keys(value).map((subKey) =>
                        renderKeyValue(subKey, value[subKey])
                    )}
                </div>
            </div>
        );
    } else {
        return (
            <div
                key={key}
                className="flex      gap-2 mb-2 "
            >
                <span className="text-sm  text-gray-700 px-3 py-1 bg-gray-200 rounded-md inline-block w-fit">
                    {key}
                </span>
                <span className="text-sm text-gray-600 break-all">{String(value)}</span>
            </div>
        );
    }
};

export function NodeJsonOutput({ output }: { output: any }) {
    const json = output?.json || null;

    return (
        <div className="flex flex-col h-full p-3 bg-gray-50 rounded-lg overflow-y-auto max-h-[500px] border border-gray-200">
            {json && Object.keys(json).length > 0 ? (
                Object.keys(json).map((key) => (
                    <div key={key} className="mb-3">
                        {renderKeyValue(key, json[key])}
                    </div>
                ))
            ) : (
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-sm text-gray-500">No output available</p>
                </div>
            )}
        </div>
    );
} 