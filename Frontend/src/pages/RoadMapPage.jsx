import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/Lesson.css';
import { GET_ROADMAP_URL } from '../api';

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
      <div className="node-content">{data.text}</div>
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
      <div className="node-content">{data.text}</div>
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
      <div className="node-content">{data.text}</div>
    </div>
  ),
};

const RoadMapPage = () => {
  const { courseId, lessonId, pathId } = useParams();
  const location = useLocation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
       
  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        console.log("path id in roadmap page "+pathId);
        if (!pathId) {
          throw new Error('Path ID not found');
        } 
 
        // Make API call to get roadmap data
        const response = await fetch(`${GET_ROADMAP_URL}/${pathId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch roadmap data');
        }

        const data = await response.json();
        console.log('Roadmap API Response:', data);
 
        // Transform nodes
        const transformedNodes = Object.entries(data.Nodes).map(([id, node]) => ({
          id,
          type: node.type,
          position: { x: 0, y: 0 }, // Initial position, will be calculated
          data: { text: node.text }
        }));

        // Transform connections to edges
        const transformedEdges = data.Connections.map((conn, index) => ({
          id: `edge-${index}`,
          source: conn.from,
          target: conn.to,
          type: 'smoothstep',
          animated: true
        }));

        // Calculate positions in a hierarchical layout
        const centerX = 400;
        const centerY = 300;
        const mainConceptNodes = transformedNodes.filter(n => n.type === 'MainConcept');
        
        if (mainConceptNodes.length > 0) {
          // Position main concepts in a circle
          const mainConceptRadius = 250;
          const mainConceptAngle = (2 * Math.PI) / mainConceptNodes.length;
          
          mainConceptNodes.forEach((node, index) => {
            const angle = index * mainConceptAngle;
            node.position = {
              x: centerX + mainConceptRadius * Math.cos(angle),
              y: centerY + mainConceptRadius * Math.sin(angle)
            };
          });
          
          // Position sub-concepts around their parent main concepts
          const subConcepts = transformedNodes.filter(n => n.type === 'SubConcept');
          const subConceptRadius = 150;
          
          subConcepts.forEach((node) => {
            const parentEdge = transformedEdges.find(e => e.target === node.id);
            if (parentEdge) {
              const parentNode = transformedNodes.find(n => n.id === parentEdge.source);
              if (parentNode) {
                // Find all sub-concepts connected to this parent
                const siblingSubConcepts = subConcepts.filter(s => {
                  const edge = transformedEdges.find(e => e.target === s.id);
                  return edge && edge.source === parentEdge.source;
                });
                
                const siblingIndex = siblingSubConcepts.findIndex(s => s.id === node.id);
                const angle = (siblingIndex * (2 * Math.PI)) / siblingSubConcepts.length;
                
                node.position = {
                  x: parentNode.position.x + subConceptRadius * Math.cos(angle),
                  y: parentNode.position.y + subConceptRadius * Math.sin(angle)
                };
              }
            }
          });

          // Position details around their parent sub-concepts
          const details = transformedNodes.filter(n => n.type === 'Detail');
          const detailRadius = 100;
          
          details.forEach((node) => {
            const parentEdge = transformedEdges.find(e => e.target === node.id);
            if (parentEdge) {
              const parentNode = transformedNodes.find(n => n.id === parentEdge.source);
              if (parentNode) {
                // Find all details connected to this parent
                const siblingDetails = details.filter(d => {
                  const edge = transformedEdges.find(e => e.target === d.id);
                  return edge && edge.source === parentEdge.source;
                });
                
                const siblingIndex = siblingDetails.findIndex(d => d.id === node.id);
                const angle = (siblingIndex * (2 * Math.PI)) / siblingDetails.length;
                
                node.position = {
                  x: parentNode.position.x + detailRadius * Math.cos(angle),
                  y: parentNode.position.y + detailRadius * Math.sin(angle)
                };
              }
            }
          });
        }

        setNodes(transformedNodes);
        setEdges(transformedEdges);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, [location.state?.pathId]);

  if (loading) {
    return <div className="loading">Loading roadmap...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 160px)' }}>
        <h1>Roadmap</h1>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default RoadMapPage;

