# GAME_CONTEXT.md

## 1. Project Vision & The "Vibe"
**Title:** GraphWorks (Working Title)

**Genre:** Spatially-aware Hierarchical Factory Simulator.

**Elevator Pitch:** "Factorio meets Node-RED, but the layout matters."

**Core Gameplay:**
*   **Design:** Build a factory floor on a 2D grid.
*   **Encapsulate:** Wrap that floor into a "Chip Factory" node.
*   **Constraint:** The new node isn't just a dot; it is a 2D Box with specific input/output ports preserved from your internal design. If you put the input on the left in the blueprint, the black box has the input on the left.
*   **Scale:** Use that box to build a Car Factory.

**Visual Style:** Technical / Blueprint / CAD. Dark mode. Orthogonal edges (straight lines with 90-degree turns).

## 2. Long-Term Vision (Architectural Constraints)
These features are not in v1, but the code structure must NOT prevent them:
*   **Logistics & Travel Time:** Edges are not instant. Eventually, they will be "Roads" or "Conveyor Belts" where distance = latency.
*   **Economics:** Every node has a monetary cost. Inputs cost money, outputs generate money.
*   **Grid Physics:** "Everything must fit." Nodes cannot overlap.

## 3. Tech Stack
*   **Frontend:** React + Vite + TypeScript.
*   **Canvas Engine:** React Flow (Crucial: We will strictly use SnapToGrid and custom nodes).
*   **State:** Zustand (Decoupled from UI).
*   **Styling:** Tailwind CSS.

## 4. The Data Model (Spatial Updates)
**A. The Spatial Node**
Unlike standard graph nodes, our nodes have physical properties:

```typescript
interface NodeData {
  // Dimensions in "Grid Units" (e.g., 1x1, 2x3)
  width: number;
  height: number;
  
  // Port Locations are RELATIVE to the node origin
  // e.g., { x: 0, y: 1 } is a port on the left wall, 1 unit down.
  inputs: Array<{ id: string, resource: string, relativePos: {x: number, y: number} }>;
  outputs: Array<{ id: string, resource: string, relativePos: {x: number, y: number} }>;
}
```

**B. The "Wrapper" Logic**
When the player wraps a group of machines into a Blueprint:
*   **Bounding Box:** Calculate the min/max X/Y of the selected machines.
*   **Port Preservation:** Any edge crossing the Bounding Box boundary becomes an external Port on the new "Black Box."
*   **Optimization:** The inner logic is compiled to a simple math formula (stats) for the simulation.

## 5. Implementation Roadmap (Agile)
**Phase 1: The "Physical" Grid**
*   **Goal:** A canvas that feels like a CAD tool, not a whiteboard.
*   **Requirements:**
    *   React Flow with `snapToGrid={true}`.
    *   Custom Node Component: A rigid HTML/CSS box that renders specific "Port" divs at exact pixel coordinates based on the data model.
*   **Prompt:** "Set up React Flow. Create a custom 'MachineNode' that takes width, height, and ports as props. Render it as a rigid border box. Render the handles (ports) at specific offsets so they look like physical docks."

**Phase 2: The Flow Simulation**
*   **Goal:** Items moving between nodes.
*   **Requirements:**
    *   Zustand store for the simulation tick.
    *   Visual feedback on the edges (animated dashed lines to show flow).
*   **Prompt:** "Create a simulation loop in Zustand. When connected, pass a 'resource packet' from the Output Port of Node A to the Input Port of Node B."

**Phase 3: The Encapsulation (The Boss Fight)**
*   **Goal:** Turning the graph into a node.
*   **Requirements:**
    *   Logic to "Scanner" the selected area and generate the NodeData definition described in Section 4.
*   **Prompt:** "Create a logic function that takes a set of nodes, finds their bounding box, and generates a new parent Node definition with ports matching the external connections."


## 6. Guidelines for the AI (Directives)
Complexity Check: Before writing code for a new feature, evaluate the complexity of its interplay with existing systems.

Trigger: If a feature requires modifying more than 3 distinct systems (e.g., UI, Simulation, and Save Data) simultaneously.

Action: Stop. Warn the user. Suggest a simpler alternative or a way to break it into smaller chunks.

Performance & Scalability Strategy:

Goal: We should easily support 100-200 active nodes on a single canvas without frame drops.

Directive: Do not bind the simulation tick directly to React State updates.

Bad: Updating node.data.progress in a React State variable every frame (triggers 100s of re-renders).

Good: Use Transient Updates (e.g., refs or direct DOM manipulation) for high-frequency visual changes like progress bars or moving items.

Encapsulation Philosophy: We encourage players to encapsulate via gameplay incentives (cleaner UI), not hard limits. Only suggest encapsulation if the graph becomes visually unreadable.

Preserve the Architecture:

If a user request (e.g., "Make the wires curve naturally") conflicts with a core constraint (e.g., "Orthogonal edges only for grid logic"), you must warn the user that this breaks the "CAD Vibe" or "Grid Physics" before implementing.

## 7. Glossary (Strict Terminology)
Use these terms in variable names and comments to distinguish state.

AtomicNode: A base-level unit that cannot be opened (e.g., Smelter, Miner). It has hardcoded logic.

CompositeNode: A user-created node that contains a graph. It has two states:

State A: Active Blueprint (The Simulated Node): The specific node the player is currently "inside" or "editing."

Logic: Full simulation. We track positions, collisions, and individual resource packets moving on wires.

Visual: The full grid canvas.

State B: Black Box (The Abstracted Node): A Composite Node that is placed inside an Active Blueprint.

Logic: Statistical only. No internal wires are calculated. Input = Output * Efficiency.

Visual: A single rectangular node with ports.

The Compiler: The function that translates an Active Blueprint into the stats for a Black Box.

Port: The specific (x,y) location on a node's border where a resource enters or leaves.