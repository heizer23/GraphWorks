import type { Node, Edge } from 'reactflow';
import type { NodeData, Port } from '../types';

interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}

/**
 * Calculate the bounding box of selected nodes in grid units
 */
export function calculateBoundingBox(nodes: Node<NodeData>[]): BoundingBox {
    if (nodes.length === 0) {
        throw new Error('Cannot calculate bounding box of empty node array');
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
        const nodeMinX = node.position.x / 40; // Convert pixels to grid units
        const nodeMinY = node.position.y / 40;
        const nodeMaxX = nodeMinX + node.data.width;
        const nodeMaxY = nodeMinY + node.data.height;

        minX = Math.min(minX, nodeMinX);
        minY = Math.min(minY, nodeMinY);
        maxX = Math.max(maxX, nodeMaxX);
        maxY = Math.max(maxY, nodeMaxY);
    });

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

/**
 * Find edges that cross the bounding box boundary (external edges)
 */
export function findExternalEdges(
    selectedNodeIds: Set<string>,
    allEdges: Edge[]
): Edge[] {
    return allEdges.filter(edge => {
        const sourceInside = selectedNodeIds.has(edge.source);
        const targetInside = selectedNodeIds.has(edge.target);

        // External edge: one end inside, one end outside
        return sourceInside !== targetInside;
    });
}

/**
 * Generate a composite node from selected nodes
 */
export function generateCompositeNode(
    selectedNodes: Node<NodeData>[],
    externalEdges: Edge[],
    allNodes: Node<NodeData>[]
): Node<NodeData> {
    const bbox = calculateBoundingBox(selectedNodes);
    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));

    // Create ports for each external edge
    const inputs: Port[] = [];
    const outputs: Port[] = [];

    externalEdges.forEach((edge, index) => {
        const isIncoming = !selectedNodeIds.has(edge.source);
        const internalNodeId = isIncoming ? edge.target : edge.source;
        const internalNode = selectedNodes.find(n => n.id === internalNodeId);

        if (!internalNode) return;

        // Find the port on the internal node
        const internalPort = isIncoming
            ? internalNode.data.inputs.find(p => p.id === edge.targetHandle)
            : internalNode.data.outputs.find(p => p.id === edge.sourceHandle);

        if (!internalPort) return;

        // Calculate the port's absolute position
        const nodeGridX = internalNode.position.x / 40;
        const nodeGridY = internalNode.position.y / 40;
        const portAbsX = nodeGridX + internalPort.relativePos.x;
        const portAbsY = nodeGridY + internalPort.relativePos.y;

        // Convert to relative position on the composite node
        const relativeX = portAbsX - bbox.minX;
        const relativeY = portAbsY - bbox.minY;

        // Snap to edge of bounding box
        let snappedX = relativeX;
        let snappedY = relativeY;

        if (relativeX <= 0.5) snappedX = 0; // Left edge
        else if (relativeX >= bbox.width - 0.5) snappedX = bbox.width; // Right edge

        if (relativeY <= 0.5) snappedY = 0; // Top edge
        else if (relativeY >= bbox.height - 0.5) snappedY = bbox.height; // Bottom edge

        const port: Port = {
            id: `port-${index}`,
            resource: internalPort.resource,
            relativePos: { x: snappedX, y: snappedY },
        };

        if (isIncoming) {
            inputs.push(port);
        } else {
            outputs.push(port);
        }
    });

    // Generate unique ID
    const compositeId = `composite-${Date.now()}`;

    return {
        id: compositeId,
        type: 'spatial',
        position: {
            x: bbox.minX * 40, // Convert back to pixels
            y: bbox.minY * 40,
        },
        data: {
            width: Math.ceil(bbox.width),
            height: Math.ceil(bbox.height),
            inputs,
            outputs,
            label: 'Composite',
            inventory: {},
            isComposite: true,
            childNodeIds: selectedNodes.map(n => n.id),
        },
    };
}
