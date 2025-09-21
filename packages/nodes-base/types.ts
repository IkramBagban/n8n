// https://github.com/n8n-io/n8n/blob/70d64b73d864b5c4655db099392ed4dbfd93050f/packages/workflow/src/interfaces.ts#L4
type NodeGroupType =
  | "input"
  | "output"
  | "organization"
  | "schedule"
  | "transform"
  | "trigger";

export type ThemeIconColor =
  | "gray"
  | "black"
  | "blue"
  | "light-blue"
  | "dark-blue"
  | "orange"
  | "orange-red"
  | "pink-red"
  | "red"
  | "light-green"
  | "green"
  | "dark-green"
  | "azure"
  | "purple"
  | "crimson";

export interface INodeTypeBaseDescription {
  displayName: string;
  name: string;
  icon?: string;
  iconColor?: ThemeIconColor;
  iconUrl?: string;
  badgeIconUrl?: string;
  group: NodeGroupType[];
  description: string;
  documentationUrl?: string;
  subtitle?: string;
  defaultVersion?: number;
  // codex?: CodexData;
  parameterPane?: "wide";

  /**
   * Whether the node must be hidden in the node creator panel,
   * due to deprecation or as a special case (e.g. Start node)
   */
  hidden?: true;

  /**
   * Whether the node will be wrapped for tool-use by AI Agents,
   * optionally replacing provided parts of the description
   */
  // usableAsTool?: true | UsableAsToolDescription;
}
export type NodeDefaults = Partial<{
  /**
   * @deprecated Use {@link INodeTypeBaseDescription.iconColor|iconColor} instead. `iconColor` supports dark mode and uses preset colors from n8n's design system.
   */
  color: string;
  name: string;
}>;

// export interface INodeParameters {
//   [key: string]: NodeParameterValueType;
// }

export type NodePropertyTypes =
  | "boolean"
  | "button"
  | "collection"
  | "color"
  | "dateTime"
  | "fixedCollection"
  | "hidden"
  | "json"
  | "callout"
  | "notice"
  | "multiOptions"
  | "number"
  | "options"
  | "string"
  | "credentialsSelect"
  | "resourceLocator"
  | "curlImport"
  | "resourceMapper"
  | "filter"
  | "assignmentCollection"
  | "credentials"
  | "workflowSelector";

export interface INodePropertyTypeOptions {
  password?: boolean; 
  // [key: string]: any;
}
export interface INodeProperties {
  displayName: string;
  name: string;
  type: NodePropertyTypes;
  typeOptions?: INodePropertyTypeOptions;
  // default: NodeParameterValueType;
  default: any;
  description?: string;
  hint?: string;
  // disabledOptions?: IDisplayOptions;
  // displayOptions?: IDisplayOptions;
  //   options?: Array<INodePropertyOptions | INodeProperties | INodePropertyCollection>;
  options?: any;
  placeholder?: string;
  isNodeSetting?: boolean;
  noDataExpression?: boolean;
  required?: boolean;
  // routing?: INodePropertyRouting;
  credentialTypes?: Array<
    | "extends:oAuth2Api"
    | "extends:oAuth1Api"
    | "has:authenticate"
    | "has:genericAuth"
  >;
  // extractValue?: INodePropertyValueExtractor;
  // modes?: INodePropertyMode[];
  requiresDataPath?: "single" | "multiple";
  doNotInherit?: boolean;
  // set expected type for the value which would be used for validation and type casting
  // validateType?: FieldType;
  // works only if validateType is set
  // allows to skip validation during execution or set custom validation/casting logic inside node
  // inline error messages would still be shown in UI
  ignoreValidationDuringExecution?: boolean;
  // for type: options | multiOptions – skip validation of the value (e.g. when value is not in the list and specified via expression)
  allowArbitraryValues?: boolean;
}

export type NodeParameterValue = string | number | boolean | undefined | null;

export interface ICredentialsDisplayOptions {
  hide?: {
    [key: string]: NodeParameterValue[] | undefined;
  };
  show?: {
    "@version"?: number[];
    [key: string]: NodeParameterValue[] | undefined;
  };

  hideOnCloud?: boolean;
}

export interface INodeCredentialDescription {
  name: string;
  required?: boolean;
  displayName?: string;
  disabledOptions?: ICredentialsDisplayOptions;
  displayOptions?: ICredentialsDisplayOptions;
  // testedBy?: ICredentialTestRequest | string; // Name of a function inside `loadOptions.credentialTest`
}

export interface INodeTypeDescription extends INodeTypeBaseDescription {
  version: number | number[];
  defaults: NodeDefaults;
  eventTriggerDescription?: string;
  activationMessage?: string;
  //   inputs:
  //     | Array<NodeConnectionType | INodeInputConfiguration>
  //     | ExpressionString;
  requiredInputs?: string | number[] | number; // Ony available with executionOrder => "v1"
  inputNames?: string[];
  //   outputs:
  //     | Array<NodeConnectionType | INodeOutputConfiguration>
  //     | ExpressionString;
  outputNames?: string[];
  properties: INodeProperties[];
  credentials?: INodeCredentialDescription[];
  maxNodes?: number; // How many nodes of that type can be created in a workflow
  polling?: true | undefined;
  supportsCORS?: true | undefined;
  //   requestDefaults?: DeclarativeRestApiSettings.HttpRequestOptions;
  //   requestOperations?: IN8nRequestOperations;
  //   hooks?: {
  //     [key: string]: INodeHookDescription[] | undefined;
  //     activate?: INodeHookDescription[];
  //     deactivate?: INodeHookDescription[];
  //   };
  //   webhooks?: IWebhookDescription[];
  // translation?: { [key: string]: object };
  // mockManualExecution?: true;
  //   triggerPanel?: TriggerPanelDefinition | boolean;
  // extendsCredential?: string;
  //   hints?: NodeHint[];
  // __loadOptionsMethods?: string[]; // only for validation during build
}
export interface INodeType {
  description: INodeTypeDescription;
  // supplyData?(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData>;
  // execute?(this: IExecuteFunctions): Promise<NodeOutput>;
  // /**
  //  * A function called when a node receives a chat message. Allows it to react
  //  * to the message before it gets executed.
  //  */
  // onMessage?(context: IExecuteFunctions, data: INodeExecutionData): Promise<NodeOutput>;
  // poll?(this: IPollFunctions): Promise<INodeExecutionData[][] | null>;
  //   trigger?(this: ITriggerFunctions): Promise<ITriggerResponse | undefined>;
  // webhook?(this: IWebhookFunctions): Promise<IWebhookResponseData>;
  // methods?: {
  // 	loadOptions?: {
  // 		[key: string]: (this: ILoadOptionsFunctions) => Promise<INodePropertyOptions[]>;
  // 	};
  // 	listSearch?: {
  // 		[key: string]: (
  // 			this: ILoadOptionsFunctions,
  // 			filter?: string,
  // 			paginationToken?: string,
  // 		) => Promise<INodeListSearchResult>;
  // 	};
  // 	credentialTest?: {
  // 		// Contains a group of functions that test credentials.
  // 		[functionName: string]: ICredentialTestFunction;
  // 	};
  // 	resourceMapping?: {
  // 		[functionName: string]: (this: ILoadOptionsFunctions) => Promise<ResourceMapperFields>;
  // 	};
  // 	localResourceMapping?: {
  // 		[functionName: string]: (this: ILocalLoadOptionsFunctions) => Promise<ResourceMapperFields>;
  // 	};
  // 	actionHandler?: {
  // 		[functionName: string]: (
  // 			this: ILoadOptionsFunctions,
  // 			payload: IDataObject | string | undefined,
  // 		) => Promise<NodeParameterValueType>;
  // 	};
  // };
  // webhookMethods?: {
  // 	[name in WebhookType]?: {
  // 		[method in WebhookSetupMethodNames]: (this: IHookFunctions) => Promise<boolean>;
  // 	};
  // };
  // /**
  //  * Defines custom operations for nodes that do not implement an `execute` method, such as declarative nodes.
  //  * This function will be invoked instead of `execute` for a specific resource and operation.
  //  * Should be either `execute` or `customOperations` defined for a node, but not both.
  //  *
  //  * @property customOperations - Maps specific resource and operation to a custom function
  //  */
  // customOperations?: {
  // 	[resource: string]: {
  // 		[operation: string]: (this: IExecuteFunctions) => Promise<NodeOutput>;
  // 	};
  // };
}

export type Themed<T> = T | { light: T; dark: T };
export type IconRef = `fa:${string}` | `node:${string}.${string}`;
export type IconFile = `file:${string}.png` | `file:${string}.svg`;
export type Icon = IconRef | Themed<IconFile>;
export interface ICredentialType {
  name: string;
  displayName: string;
  icon?: Icon;
  iconColor?: ThemeIconColor;
  iconUrl?: Themed<string>;
  extends?: string[];
  properties: INodeProperties[];
  documentationUrl?: string;
  __overwrittenProperties?: string[];
  authenticate?: IAuthenticate;
  preAuthentication?: (
    this: IHttpRequestHelper,
    credentials: ICredentialDataDecryptedObject
  ) => Promise<IDataObject>;
  test?: ICredentialTestRequest;
  genericAuth?: boolean;
  httpRequestNode?: ICredentialHttpRequestNode;
  supportedNodes?: string[];
}
