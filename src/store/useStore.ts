import { create } from 'zustand';
import {
    type Node,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type Connection,
    type OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';
import type { NodeData } from '../types';
import { generateCompositeNode, findExternalEdges } from '../utils/encapsulation';

type RFState = {
    nodes: Node<NodeData>[];
    edges: Edge[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: OnConnect;
    setNodes: (nodes: Node<NodeData>[]) => void;
    setEdges: (edges: Edge[]) => void;
    tick: () => void;
    encapsulateNodes: (nodeIds: string[]) => void;
};

const useStore = create<RFState>((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        const newEdge = {
            ...connection,
            id: `${connection.source}-${connection.target}`,
            type: 'custom',
        };
        set({
            edges: [...get().edges, newEdge as Edge],
        });
    },
    setNodes: (nodes: Node<NodeData>[]) => {
        set({ nodes });
    },
    setEdges: (edges: Edge[]) => {
        set({ edges });
    },
    tick: () => {
        const { nodes, edges } = get();
        // Deep copy nodes to trigger re-render on inventory change
        const newNodes = nodes.map((node) => ({
            ...node,
            data: {
                ...node.data,
                inventory: { ...node.data.inventory },
            },
        }));
        const nodeMap = new Map(newNodes.map((n) => [n.id, n]));

        edges.forEach((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);

            if (!sourceNode || !targetNode) return;

            // Find the output port on the source node
            const outputPort = sourceNode.data.outputs.find((p) => p.id === edge.sourceHandle);
            // Find the input port on the target node
            const inputPort = targetNode.data.inputs.find((p) => p.id === edge.targetHandle);

            if (outputPort && inputPort) {
                // Initialize inventory if missing
                if (!sourceNode.data.inventory) sourceNode.data.inventory = {};
                if (!targetNode.data.inventory) targetNode.data.inventory = {};

                // 1. Produce (if Miner - has no inputs)
                if (sourceNode.data.inputs.length === 0) {
                    sourceNode.data.inventory[outputPort.resource] = (sourceNode.data.inventory[outputPort.resource] || 0) + 1;
                }

                // 2. Move from Source to Target
                if ((sourceNode.data.inventory[outputPort.resource] || 0) > 0) {
                    sourceNode.data.inventory[outputPort.resource]--;
                    targetNode.data.inventory[outputPort.resource] = (targetNode.data.inventory[outputPort.resource] || 0) + 1;
                }
            }
        });

        set({ nodes: newNodes });
    },
    encapsulateNodes: (nodeIds: string[]) => {
        const { nodes, edges } = get();

        if (nodeIds.length < 2) {
            console.warn('Need at least 2 nodes to encapsulate');
            return;
        }

        // Get selected nodes
        const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));
        const selectedNodeIds = new Set(nodeIds);

        // Find external edges
        const externalEdges = findExternalEdges(selectedNodeIds, edges);

        // Generate composite node
        const compositeNode = generateCompositeNode(selectedNodes, externalEdges, nodes);

        // Create port ID mapping for reconnecting edges
        const portMapping = new Map<string, { nodeId: string; portId: string }>();
        externalEdges.forEach((edge, index) => {
            const isIncoming = !selectedNodeIds.has(edge.source);
            const key = isIncoming ? `${edge.target}-${edge.targetHandle}` : `${edge.source}-${edge.sourceHandle}`;
            portMapping.set(key, {
                nodeId: compositeNode.id,
                portId: `port-${index}`,
            });
        });

        // Update edges: remove internal edges, reconnect external edges
        const newEdges = edges
            .filter(edge => {
                const sourceInside = selectedNodeIds.has(edge.source);
                const targetInside = selectedNodeIds.has(edge.target);
                // Keep only external edges
                return sourceInside !== targetInside;
            })
            .map(edge => {
                const sourceInside = selectedNodeIds.has(edge.source);
                const targetInside = selectedNodeIds.has(edge.target);

                if (sourceInside) {
                    // Outgoing edge: replace source with composite node
                    const key = `${edge.source}-${edge.sourceHandle}`;
                    const mapping = portMapping.get(key);
                    return {
                        ...edge,
                        source: compositeNode.id,
                        sourceHandle: mapping?.portId || edge.sourceHandle,
                    };
                } else {
                    // Incoming edge: replace target with composite node
                    const key = `${edge.target}-${edge.targetHandle}`;
                    const mapping = portMapping.get(key);
                    return {
                        ...edge,
                        target: compositeNode.id,
                        targetHandle: mapping?.portId || edge.targetHandle,
                    };
                }
            });

        // Remove selected nodes and add composite node
        const newNodes = nodes.filter(n => !selectedNodeIds.has(n.id)).concat(compositeNode);

        set({ nodes: newNodes, edges: newEdges });
    },
}));

export default useStore;
