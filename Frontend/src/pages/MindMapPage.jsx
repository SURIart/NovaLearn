import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, { 
  Background, 
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/Lesson.css';

import { GET_MIND_MAP_URL } from '../api';

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

const MindMapPage = () => {
  const { courseId, lessonId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
      
  useEffect(() => {
    const fetchMindMapData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.UserId;

        const response = await fetch(GET_MIND_MAP_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            lessonId: lessonId,
            subject: 'Lesson Content'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch mindmap data');
        }

        const data = await response.json();
        
        // Transform nodes
        const transformedNodes = Object.entries(data.Nodes).map(([id, node]) => ({
          id,
          type: node.type,
          position: { x: 0, y: 0 },
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

        // Hierarchical layout calculation
        const centerX = 400;
        const centerY = 300;
        const horizontalSpacing = 500;
        const verticalSpacing = 400;
        
        // Find main concept node
        const mainConceptNode = transformedNodes.find(n => n.type === 'MainConcept');
        if (mainConceptNode) {
          mainConceptNode.position = { x: centerX, y: centerY };
          
          // Position sub-concepts
          const subConcepts = transformedNodes.filter(n => n.type === 'SubConcept');
          subConcepts.forEach((node, index) => {
            const row = Math.floor(index / 2);
            const isLeft = index % 2 === 0;
            node.position = {
              x: centerX + (isLeft ? -horizontalSpacing : horizontalSpacing),
              y: centerY + (row * verticalSpacing)
            };
          });
          
          // Position detail nodes
          const details = transformedNodes.filter(n => n.type === 'Detail');
          details.forEach((node, index) => {
            const parentEdge = transformedEdges.find(e => e.target === node.id);
            if (parentEdge) {
              const parentNode = transformedNodes.find(n => n.id === parentEdge.source);
              if (parentNode) {
                const siblingDetails = details.filter(d => {
                  const edge = transformedEdges.find(e => e.target === d.id);
                  return edge && edge.source === parentEdge.source;
                });
                
                const siblingIndex = siblingDetails.findIndex(d => d.id === node.id);
                const isLeft = siblingIndex % 2 === 0;
                const row = Math.floor(siblingIndex / 2);
                
                node.position = {
                  x: parentNode.position.x + (isLeft ? -horizontalSpacing/2 : horizontalSpacing/2),
                  y: parentNode.position.y + (row * verticalSpacing/2)
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

    fetchMindMapData();
  }, [lessonId]);

  if (loading) {
    return <div className="loading">Loading mindmap...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 160px)' }}>
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
      </ReactFlow>
    </div>
  );
};

export default MindMapPage; 