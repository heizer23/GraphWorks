export interface Port {
    id: string;
    resource: string; // e.g., "iron_ore", "energy"
    relativePos: { x: number; y: number }; // In grid units relative to node origin
}
export interface Port {
    id: string;
    resource: string; // e.g., "iron_ore", "energy"
    relativePos: { x: number; y: number }; // In grid units relative to node origin
}

export interface NodeData {
    width: number; // In grid units
    height: number; // In grid units
    inputs: Port[];
    outputs: Port[];
    label?: string;
    inventory: Record<string, number>; // Resource ID -> Count
}
