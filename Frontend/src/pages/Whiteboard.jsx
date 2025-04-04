import React, { useState } from "react";
import { Tldraw, TldrawEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

const Whiteboard = () => {
  const [editor, setEditor] = useState(null); // Store editor instance
  const [extractedData, setExtractedData] = useState(null);

  const extractData = () => {
    if (editor) {
      const shapes = editor.getCurrentPageShapes(); // Get all shapes
      const extracted = shapes.map(shape => ({
        id: shape.id,
        type: shape.type,
        text: shape.props?.text || "",  // Extract text if present
        size: shape.props?.size || null
      }));

      setExtractedData(extracted);
      console.log("Extracted Data:", extracted);
    } else {
      console.log("Editor is not ready yet.");
    }
  };

  return (
    <div style={{ height: "700px", width: "500px", position: "relative" }}>
      <TldrawEditor onMount={(editorInstance) => setEditor(editorInstance)}>
        <Tldraw />
      </TldrawEditor>

      <button 
        onClick={extractData} 
        style={{ position: "absolute", top: 10, right: 10 }}
      >
        Extract Data
      </button>

      {extractedData && <pre>{JSON.stringify(extractedData, null, 2)}</pre>}
    </div>
  );
};

export default Whiteboard;
