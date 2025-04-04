import React, { useMemo } from "react";
import ReactFlow, { Controls, Background, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

// Define nodeTypes outside the component
const nodeTypes = {
  MainConcept: ({ data }) => (
    <div className="node main-concept">
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <div className="node-content">{data.label}</div>
    </div>
  ),
  SubConcept: ({ data }) => (
    <div className="node sub-concept">
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <div className="node-content">{data.label}</div>
    </div>
  ),
  Detail: ({ data }) => (
    <div className="node detail">
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <div className="node-content">{data.label}</div>
    </div>
  )
};

const initialNodes = [
  {
    id: '1',
    type: 'MainConcept',
    data: { label: 'Web Development' },
    position: { x: 400, y: 300 }
  },
  {
    id: '2',
    type: 'SubConcept',
    data: { label: 'lol' },
    position: { x: 200, y: 150 }
  },
  {
    id: '3',
    type: 'SubConcept',
    data: { label: 'Backend' },
    position: { x: 600, y: 150 }
  },
  {
    id: '4',
    type: 'SubConcept',
    data: { label: 'Database' },
    position: { x: 200, y: 450 }
  },
  {
    id: '5',
    type: 'SubConcept',
    data: { label: 'DevOps' },
    position: { x: 600, y: 450 }
  },
  {
    id: '6',
    type: 'Detail',
    data: { label: 'React & Next.js' },
    position: { x: 50, y: 50 }
  },
  {
    id: '7',
    type: 'Detail',
    data: { label: 'HTML & CSS' },
    position: { x: 200, y: 50 }
  },
  {
    id: '8',
    type: 'Detail',
    data: { label: 'Node.js & Express' },
    position: { x: 600, y: 50 }
  },
  {
    id: '9',
    type: 'Detail',
    data: { label: 'MongoDB & SQL' },
    position: { x: 50, y: 350 } // Adjusted y position
  },
  {
    id: '10',
    type: 'Detail',
    data: { label: 'Docker & K8s' },
    position: { x: 600, y: 650 } // Adjusted y position
  },
  {
    id: '11',
    type: 'Detail',
    data: { label: 'JavaScript & TypeScript' },
    position: { x: 350, y: 50 }
  },
  {
    id: '12',
    type: 'Detail',
    data: { label: 'Git & CI/CD' },
    position: { x: 750, y: 650 } // Adjusted y position
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
  { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
  { id: 'e1-5', source: '1', target: '5', type: 'smoothstep' },
  { id: 'e2-6', source: '2', target: '6', type: 'smoothstep' },
  { id: 'e2-7', source: '2', target: '7', type: 'smoothstep' },
  { id: 'e2-11', source: '2', target: '11', type: 'smoothstep' },
  { id: 'e3-8', source: '3', target: '8', type: 'smoothstep' },
  { id: 'e4-9', source: '4', target: '9', type: 'smoothstep' },
  { id: 'e5-10', source: '5', target: '10', type: 'smoothstep' },
  { id: 'e5-12', source: '5', target: '12', type: 'smoothstep' }
];

const MindMap = () => {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState(initialEdges);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 160px)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default MindMap;