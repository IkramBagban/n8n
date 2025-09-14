import { predefinedNodesTypes } from "./utils/constants";

console.log("Hello via Bun!");

const nodes = Object.values(predefinedNodesTypes).map((n) => n.type);
// console.log(
//   "Loaded nodes:",
//   nodes.map((n) => ({
//     name: n.description.name,
//     displayName: n.description.displayName,
//     description: n.description.description,
//     group: n.description.group,
//     icon: n.description.icon,
//   }))
// );
