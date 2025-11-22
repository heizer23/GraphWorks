import { BaseEdge, type EdgeProps, getBezierPath } from 'reactflow';

export default function CustomEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Debug logging
    console.log('CustomEdge render - data:', data, 'active:', data?.active);

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={style}
            />
            {data?.active && (
                <path
                    d={edgePath}
                    className="animated-edge"
                    fill="none"
                    strokeLinecap="round"
                />
            )}
        </>
    );
}
