type INodeOutput = Record<
    string,
    {
        nodeName: string;
        json: any;
    }
>;


export class NodeOutput {
    json: INodeOutput;
    constructor() {
        this.json = {};
    }

    addOutput({
        nodeId,
        nodeName,
        json,
    }: {
        nodeId: string;
        nodeName: string;
        json: any;
    }) {
        this.json[nodeId] = { nodeName, json };
    }

    getOutputsForResolver(): Record<string, { json: Record<string, unknown> }> {
        const outputs: Record<string, { json: Record<string, unknown> }> = {};
        
        for (const [nodeId, data] of Object.entries(this.json)) {
            outputs[nodeId] = {
                json: data.json as Record<string, unknown>
            };
        }
        
        return outputs;
    }
}