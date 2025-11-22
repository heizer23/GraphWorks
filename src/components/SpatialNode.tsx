import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { NodeData } from '../types';
import clsx from 'clsx';

const GRID_SIZE = 40; // px

const SpatialNode = ({ data, selected }: NodeProps<NodeData>) => {
    const { width, height, inputs, outputs, label, inventory } = data;

    const style = {
        width: width * GRID_SIZE,
        height: height * GRID_SIZE,
    };

    return (
        <div
            style={style}
            className={clsx(
                'bg-blueprint-bg border-2 transition-colors relative box-border',
                selected ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-blueprint-border'
            )}
        >
            {/* Grid Pattern Background (Optional, for texture) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '10px 10px'
                }}
            />

            {/* Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-mono text-blueprint-text opacity-80 uppercase tracking-wider">
                    {label}
                </span>
            </div>

            {/* Inputs */}
            {inputs.map((port) => {
                const isLeft = port.relativePos.x === 0;
                const isRight = port.relativePos.x === width;
                const isTop = port.relativePos.y === 0;
                const isBottom = port.relativePos.y === height;

                let position = Position.Left;
                let style: React.CSSProperties = {};

                if (isLeft) {
                    position = Position.Left;
                    style = { left: -4, top: port.relativePos.y * GRID_SIZE + (GRID_SIZE / 2) };
                } else if (isRight) {
                    position = Position.Right;
                    style = { right: -4, top: port.relativePos.y * GRID_SIZE + (GRID_SIZE / 2) };
                } else if (isTop) {
                    position = Position.Top;
                    style = { top: -4, left: port.relativePos.x * GRID_SIZE + (GRID_SIZE / 2) };
                } else if (isBottom) {
                    position = Position.Bottom;
                    style = { bottom: -4, left: port.relativePos.x * GRID_SIZE + (GRID_SIZE / 2) };
                }

                return (
                    <Handle
                        key={port.id}
                        type="target"
                        position={position}
                        id={port.id}
                        style={{
                            ...style,
                            width: 8,
                            height: 8,
                            background: '#ef4444', // Red for input
                            borderRadius: 0,
                            border: '1px solid #991b1b'
                        }}
                        className="!absolute"
                    />
                );
            })}

            {/* Outputs */}
            {outputs.map((port) => {
                const isLeft = port.relativePos.x === 0;
                const isRight = port.relativePos.x === width;
                const isTop = port.relativePos.y === 0;
                const isBottom = port.relativePos.y === height;

                let position = Position.Right;
                let style: React.CSSProperties = {};

                if (isLeft) {
                    position = Position.Left;
                    style = { left: -4, top: port.relativePos.y * GRID_SIZE + (GRID_SIZE / 2) };
                } else if (isRight) {
                    position = Position.Right;
                    style = { right: -4, top: port.relativePos.y * GRID_SIZE + (GRID_SIZE / 2) };
                } else if (isTop) {
                    position = Position.Top;
                    style = { top: -4, left: port.relativePos.x * GRID_SIZE + (GRID_SIZE / 2) };
                } else if (isBottom) {
                    position = Position.Bottom;
                    style = { bottom: -4, left: port.relativePos.x * GRID_SIZE + (GRID_SIZE / 2) };
                }

                return (
                    <Handle
                        key={port.id}
                        type="source"
                        position={position}
                        id={port.id}
                        style={{
                            ...style,
                            width: 8,
                            height: 8,
                            background: '#22c55e', // Green for output
                            borderRadius: 0,
                            border: '1px solid #166534'
                        }}
                        className="!absolute"
                    />
                );
            })}

            {/* Inventory Display */}
            <div className="absolute bottom-1 left-1 right-1 flex flex-col gap-0.5 pointer-events-none">
                {inventory && Object.entries(inventory).map(([resource, count]) => (
                    count > 0 && (
                        <div key={resource} className="flex justify-between text-[10px] bg-black/50 px-1 rounded">
                            <span className="opacity-70">{resource}</span>
                            <span className="font-bold text-white">{count}</span>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default memo(SpatialNode);
