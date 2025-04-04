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

import { GET_CURRICULUM_URL } from '../api';
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
  const location = useLocation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
      
  useEffect(() => {
    const fetchMindMapData = async () => {
      try {
        // Get user data
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.UserId;

        // Fetch course data to get lesson name
        const courseResponse = await fetch(GET_CURRICULUM_URL);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course details');
        }
        const courseData = await courseResponse.json();
        const course = courseData.Items.find(item => item.PathId === courseId);
        
        if (course) {
          const lesson = course.Lessons.find(l => l.LessonId === lessonId);
          const lessonName = lesson?.LessonName || 'Unknown Lesson';

          // Make API call to get mindmap data
          const response = await fetch(GET_MIND_MAP_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              lessonId: lessonId,
              subject: lessonName
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch mindmap data');
          }

          const data = await response.json();
          console.log('Mindmap API Response:', data);

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
          const mainConceptNode = transformedNodes.find(n => n.type === 'MainConcept');
          
          if (mainConceptNode) {
            mainConceptNode.position = { x: centerX, y: centerY };
            
            // Position sub-concepts in a circle around the main concept
            const subConcepts = transformedNodes.filter(n => n.type === 'SubConcept');
            const subConceptRadius = 200;
            const subConceptAngle = (2 * Math.PI) / subConcepts.length;
            
            subConcepts.forEach((node, index) => {
              const angle = index * subConceptAngle;
              node.position = {
                x: centerX + subConceptRadius * Math.cos(angle),
                y: centerY + subConceptRadius * Math.sin(angle)
              };
            });

            // Position details around their parent sub-concepts
            const details = transformedNodes.filter(n => n.type === 'Detail');
            const detailRadius = 150;
            
            details.forEach((node, index) => {
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
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMindMapData();
  }, [lessonId, courseId]);

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
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default MindMapPage; 