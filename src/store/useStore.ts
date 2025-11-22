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
    addEdge,
} from 'reactflow';
import type { NodeData } from '../types';

type RFState = {
    nodes: Node<NodeData>[];
    edges: Edge[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: OnConnect;
    setNodes: (nodes: Node<NodeData>[]) => void;
    setEdges: (edges: Edge[]) => void;
    tick: () => void;
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
            data: { active: false },
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

        // Create a new edges array to track active state
        const newEdges = edges.map((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);

            if (!sourceNode || !targetNode) return edge;

            // Find the output port on the source node
            const outputPort = sourceNode.data.outputs.find((p) => p.id === edge.sourceHandle);
            // Find the input port on the target node
            const inputPort = targetNode.data.inputs.find((p) => p.id === edge.targetHandle);

            if (outputPort && inputPort) {
                // Initialize inventory if missing
                if (!sourceNode.data.inventory) sourceNode.data.inventory = {};
                if (!targetNode.data.inventory) targetNode.data.inventory = {};

                // Transfer logic
                let transferred = false;

                // 1. Produce (if Miner - has no inputs)
                if (sourceNode.data.inputs.length === 0) {
                    sourceNode.data.inventory[outputPort.resource] = (sourceNode.data.inventory[outputPort.resource] || 0) + 1;
                    transferred = true; // Miner always "working"
                }

                // 2. Move from Source to Target
                if ((sourceNode.data.inventory[outputPort.resource] || 0) > 0) {
                    sourceNode.data.inventory[outputPort.resource]--;
                    targetNode.data.inventory[outputPort.resource] = (targetNode.data.inventory[outputPort.resource] || 0) + 1;
                    transferred = true;
                }

                // Update edge with active state
                console.log(`Edge ${edge.id} active:`, transferred);
                return {
                    ...edge,
                    data: { ...edge.data, active: transferred }
                };
            }

            return edge;
        });

        set({ nodes: newNodes, edges: newEdges });
    },
}));

export default useStore;
