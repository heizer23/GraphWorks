import { useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import SpatialNode from './components/SpatialNode';
import CustomEdge from './components/CustomEdge';
import EncapsulateButton from './components/EncapsulateButton';
import useStore from './store/useStore';


const nodeTypes: NodeTypes = {
  spatial: SpatialNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const GRID_SIZE = 40;

const initialNodes = [
  {
    id: 'miner-1',
    type: 'spatial',
    position: { x: 100, y: 100 },
    data: {
      width: 1,
      height: 1,
      label: 'Miner',
      inputs: [],
      outputs: [
        { id: 'out-1', resource: 'iron_ore', relativePos: { x: 1, y: 0 } }, // Right side, top
      ],
      inventory: {},
    },
  },
  {
    id: 'smelter-1',
    type: 'spatial',
    position: { x: 300, y: 100 },
    data: {
      width: 2,
      height: 1,
      label: 'Smelter',
      inputs: [
        { id: 'in-1', resource: 'iron_ore', relativePos: { x: 0, y: 0 } }, // Left side, top
      ],
      outputs: [
        { id: 'out-1', resource: 'iron_ingot', relativePos: { x: 2, y: 0 } }, // Right side, top
      ],
      inventory: {},
    },
  },
];

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, tick } = useStore();

  useEffect(() => {
    setNodes(initialNodes);
  }, [setNodes]);

  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000); // 1 second tick
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="w-screen h-screen bg-blueprint-bg text-blueprint-text">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[GRID_SIZE / 2, GRID_SIZE / 2]} // Snap to half-grid for smoother feel, or full grid
        defaultEdgeOptions={{ type: 'custom', animated: false }}
        edgeTypes={edgeTypes}
        fitView
        multiSelectionKeyCode="Control"
      >
        <Background color="#333" gap={GRID_SIZE} />
        <Controls className="bg-blueprint-border border-blueprint-border fill-blueprint-text text-blueprint-text" />
        <MiniMap
          nodeColor="#555"
          maskColor="rgba(0,0,0, 0.5)"
          className="bg-blueprint-grid border border-blueprint-border"
        />
        <EncapsulateButton />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
