import { useRef, useEffect } from 'react';
import { useEdges, useNodes, useReactFlow, useStore } from '@xyflow/react';
import getStroke from 'perfect-freehand';
import { polylineIntersectsRectangle, pathsIntersect } from './utils';

const intersectionThreshold = 5;
const sampleDistance = 150;

const pathOptions = {
  size: Math.max(10, intersectionThreshold),
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t) => t,
  start: { taper: true },
  end: { taper: 0 },
};

const storeSelector = (state) => ({
  width: state.width,
  height: state.height,
});

export function Eraser() {
  const { width, height } = useStore(storeSelector);
  const { screenToFlowPosition, deleteElements, getInternalNode, setNodes, setEdges } = useReactFlow();
  const nodes = useNodes();
  const edges = useEdges();

  const canvas = useRef(null);
  const ctx = useRef(null);

  const nodeIntersectionData = useRef([]);
  const edgeIntersectionData = useRef([]);

  const trailPoints = useRef([]);
  const animationFrame = useRef(0);
  const isDrawing = useRef(false);

  // Track which IDs are marked for deletion (for cleanup on pointerUp)
  const markedNodeIds = useRef(new Set());
  const markedEdgeIds = useRef(new Set());

  useEffect(() => {
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  function handlePointerDown(e) {
    e.target.setPointerCapture(e.pointerId);

    isDrawing.current = true;
    trailPoints.current = [{ point: [e.pageX, e.pageY], timestamp: Date.now() }];

    markedNodeIds.current = new Set();
    markedEdgeIds.current = new Set();

    // Snapshot node bounding boxes
    nodeIntersectionData.current = [];
    for (const node of nodes) {
      const internalNode = getInternalNode(node.id);
      if (!internalNode) continue;
      const { x, y } = internalNode.internals.positionAbsolute;
      const { width: w = 0, height: h = 0 } = internalNode.measured;
      nodeIntersectionData.current.push({ id: node.id, rect: { x, y, width: w, height: h } });
    }

    // Snapshot edge paths (sampled from the SVG DOM)
    edgeIntersectionData.current = [];
    for (const edge of edges) {
      const path = document.querySelector(`.react-flow__edge[data-id="${edge.id}"] path`);
      if (!path) continue;
      const length = path.getTotalLength();
      const steps = length / Math.max(10, length / sampleDistance);
      const points = [];
      for (let i = 0; i <= length + steps; i += steps) {
        const pt = path.getPointAtLength(i);
        points.push([pt.x, pt.y]);
      }
      edgeIntersectionData.current.push({ id: edge.id, points });
    }

    ctx.current = canvas.current?.getContext('2d');
    if (ctx.current) ctx.current.lineWidth = 1;

    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    animate();
  }

  function handlePointerMove(e) {
    if (e.buttons !== 1) return;

    trailPoints.current.push({ point: [e.pageX, e.pageY], timestamp: Date.now() });

    const points = trailPoints.current.map((tp) => tp.point);
    if (!ctx.current || points.length < 2) return;

    const flowPoints = points.map(([x, y]) => {
      const fp = screenToFlowPosition({ x, y });
      return [fp.x, fp.y];
    });

    const nodesToDelete = new Set();
    const edgesToDelete = new Set();

    for (const nodeInfo of nodeIntersectionData.current) {
      if (nodeInfo.rect && polylineIntersectsRectangle(flowPoints, nodeInfo.rect)) {
        nodesToDelete.add(nodeInfo.id);
      }
    }

    for (const edgeInfo of edgeIntersectionData.current) {
      if (edgeInfo.points && pathsIntersect(flowPoints, edgeInfo.points, intersectionThreshold)) {
        edgesToDelete.add(edgeInfo.id);
      }
    }

    // Apply opacity feedback for newly marked elements
    if (nodesToDelete.size > 0) {
      const newIds = [...nodesToDelete].filter((id) => !markedNodeIds.current.has(id));
      if (newIds.length > 0) {
        newIds.forEach((id) => markedNodeIds.current.add(id));
        setNodes((nds) =>
          nds.map((n) =>
            markedNodeIds.current.has(n.id)
              ? { ...n, style: { ...n.style, opacity: 0.3 } }
              : n
          )
        );
      }
    }

    if (edgesToDelete.size > 0) {
      const newIds = [...edgesToDelete].filter((id) => !markedEdgeIds.current.has(id));
      if (newIds.length > 0) {
        newIds.forEach((id) => markedEdgeIds.current.add(id));
        setEdges((eds) =>
          eds.map((e) =>
            markedEdgeIds.current.has(e.id)
              ? { ...e, style: { ...e.style, opacity: 0.3 } }
              : e
          )
        );
      }
    }
  }

  function handlePointerUp(e) {
    e.target.releasePointerCapture(e.pointerId);

    // Delete all marked elements
    deleteElements({
      nodes: [...markedNodeIds.current].map((id) => ({ id })),
      edges: [...markedEdgeIds.current].map((id) => ({ id })),
    });

    markedNodeIds.current = new Set();
    markedEdgeIds.current = new Set();
    trailPoints.current = [];
    isDrawing.current = false;

    if (!animationFrame.current) animate();
  }

  function drawTrail() {
    if (!ctx.current || !canvas.current) return;
    ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    if (trailPoints.current.length < 2) return;

    const strokePoints = trailPoints.current.map(({ point }) => [point[0], point[1], 0.5]);
    const stroke = getStroke(strokePoints, pathOptions);
    if (stroke.length < 2) return;

    ctx.current.fillStyle = '#ef4444';
    ctx.current.globalAlpha = 0.6;
    ctx.current.beginPath();
    stroke.forEach(([x, y], i) => {
      if (i === 0) ctx.current.moveTo(x, y);
      else ctx.current.lineTo(x, y);
    });
    ctx.current.closePath();
    ctx.current.fill();
    ctx.current.globalAlpha = 1.0;
  }

  function removeOldPoints() {
    const cutoff = Date.now() - 100;
    trailPoints.current = trailPoints.current.filter((tp) => tp.timestamp > cutoff);
  }

  function animate() {
    removeOldPoints();
    drawTrail();
    if (isDrawing.current || trailPoints.current.length > 0) {
      animationFrame.current = requestAnimationFrame(animate);
    }
  }

  return (
    <canvas
      ref={canvas}
      width={width}
      height={height}
      className="nopan nodrag eraser-tool-overlay"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}
