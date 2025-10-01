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
}