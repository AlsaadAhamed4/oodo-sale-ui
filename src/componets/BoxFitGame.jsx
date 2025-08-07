import React, { useEffect, useState, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const GRID_SIZE = 10;
const CELL_SIZE = 38;

const SHAPES = [
  {
    id: "L",
    color: "#FFD700",
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: "I",
    color: "#7AF786",
    shape: [[1], [1], [1], [1]],
  },
  {
    id: "S",
    color: "#BD93F9",
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    id: "O",
    color: "#8BE9FD",
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
];

const PLAYER_COLORS = [
  "#8be9fd",
  "#ffb86c",
  "#6a8afd",
  "#e0676a",
  "#bd93f9",
  "#ffc862",
  "#7af786",
  "#fbd46d",
];

const COLORS = {
  BG: "#17191c",
  PANEL: "#23262B",
  GRID_LINE: "#222529",
  GRID_BORDER: "#F1C40F",
  TITLE: "#f7f7fa",
  LABEL: "#bbbbcc",
  GRID_CELL_BG1: "#1b1e25",
  GRID_CELL_BG2: "#20232a",
};

function rotateShape(shape, times) {
  let result = shape;
  for (let t = 0; t < times; t++) {
    const h = result.length,
      w = result[0].length;
    let newShape = Array.from({ length: w }, () => Array(h).fill(0));
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) newShape[x][h - 1 - y] = result[y][x];
    result = newShape;
  }
  return result;
}

function canPlace(grid, shape, x, y) {
  for (let dy = 0; dy < shape.length; dy++) {
    for (let dx = 0; dx < shape[0].length; dx++) {
      if (shape[dy][dx]) {
        const gx = x + dx,
          gy = y + dy;
        if (
          gx < 0 ||
          gx >= GRID_SIZE ||
          gy < 0 ||
          gy >= GRID_SIZE ||
          grid[gy][gx] !== null
        )
          return false;
      }
    }
  }
  return true;
}

function countCells(shape) {
  let count = 0;
  shape.forEach((row) => row.forEach((cell) => (cell ? count++ : 0)));
  return count;
}

function hoveredShapeCell(shape, cellY, cellX, hover) {
  if (!shape || hover.y == null || hover.x == null) return false;
  for (let dy = 0; dy < shape.length; dy++) {
    for (let dx = 0; dx < shape[0].length; dx++) {
      if (
        shape[dy][dx] &&
        cellY === hover.y + dy &&
        cellX === hover.x + dx
      )
        return true;
    }
  }
  return false;
}

function ShapePreview({ shape, color }) {
  if (!shape) return null;
  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${shape[0].length}, 19px)`,
        gridGap: 2,
      }}
    >
      {shape.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: cell ? color || "#ddd" : "transparent",
              border: cell ? "1.5px solid #222" : "none",
            }}
          />
        ))
      )}
    </div>
  );
}

export default function BoxFitGame() {
  const [ydoc] = useState(() => new Y.Doc());
  const [provider] = useState(
    () => new WebsocketProvider("ws://localhost:1234", "boxfit-room", ydoc)
  );

  const ygrid = ydoc.getArray("grid");
  const yscore = ydoc.getMap("score");
  const yplacements = ydoc.getArray("placements");

  const [playerId] = useState(() => "Player-" + Math.floor(Math.random() * 1000));

  const [grid, setGrid] = useState(() => {
    if (ygrid.length === 0) {
      for (let i = 0; i < GRID_SIZE; i++) {
        ygrid.push([...Array(GRID_SIZE).fill(null)]);
      }
    }
    return ygrid.toArray().map((row) =>
      Array.isArray(row) ? row.slice() : Array(GRID_SIZE).fill(null)
    );
  });

  const [scores, setScores] = useState({});
  const [selected, setSelected] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [hover, setHover] = useState({ x: null, y: null });

  const gridRef = useRef(null);
  const cellRefs = useRef({});

  useEffect(() => {
    const observer = () => {
      setGrid(
        ygrid.toArray().map((row) =>
          Array.isArray(row) ? row.slice() : Array(GRID_SIZE).fill(null)
        )
      );
    };
    ygrid.observe(observer);
    observer();
    return () => ygrid.unobserve(observer);
  }, [ygrid]);

  useEffect(() => {
    const observer = () => {
      setScores(Object.assign({}, yscore.toJSON()));
    };
    yscore.observe(observer);
    observer();
    return () => yscore.unobserve(observer);
  }, [yscore]);

  const currentShape = selected ? SHAPES.find((s) => s.id === selected) : null;
  const rotatedShape = currentShape ? rotateShape(currentShape.shape, rotation) : null;
  const showPreview =
    selected !== null &&
    hover.x !== null &&
    hover.y !== null &&
    rotatedShape !== null &&
    canPlace(grid, rotatedShape, hover.x, hover.y);

  function handlePlace(y, x) {
    if (!currentShape || !rotatedShape) return;
    if (!canPlace(grid, rotatedShape, x, y)) return;

    ydoc.transact(() => {
      const newGrid = ygrid.toArray().map((row) =>
        Array.isArray(row) ? row.slice() : Array(GRID_SIZE).fill(null)
      );
      for (let dy = 0; dy < rotatedShape.length; dy++) {
        for (let dx = 0; dx < rotatedShape[0].length; dx++) {
          if (rotatedShape[dy][dx]) {
            newGrid[y + dy][x + dx] = { id: selected, by: playerId };
          }
        }
      }
      for (let rowIndex = 0; rowIndex < GRID_SIZE; rowIndex++) {
        ygrid.delete(rowIndex, 1);
        ygrid.insert(rowIndex, [newGrid[rowIndex]]);
      }
      const currentPoints = yscore.get(playerId) || 0;
      yscore.set(playerId, currentPoints + countCells(rotatedShape) * 10);
      yplacements.push([
        {
          piece: selected,
          x,
          y,
          rotation,
          player: playerId,
          time: Date.now(),
        },
      ]);
    });

    setSelected(null);
    setRotation(0);
    setHover({ x: null, y: null });
  }

  function scrollToPlayer(player) {
    if (!gridRef.current) return;
    const cells = [];
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        if (grid[y][x]?.by === player) {
          const el = cellRefs.current[`${y}-${x}`];
          if (el) cells.push(el);
        }
      }
    }
    if (cells.length === 0) return;
    const middleEl = cells[Math.floor(cells.length / 2)];
    middleEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    cells.forEach((el) => el.classList.add("highlight-cell"));
    setTimeout(() => {
      cells.forEach((el) => el.classList.remove("highlight-cell"));
    }, 1500);
  }

  const playerList = Object.keys(scores).length > 0 ? Object.keys(scores) : [playerId];
  const nextItem = selected ? currentShape : SHAPES[Math.floor(Math.random() * SHAPES.length)];

  return (
    <>
      <style>
        {`
          .highlight-cell {
            animation: cellBlink 1.3s cubic-bezier(.7,0,.2,1);
            outline: 3.5px solid #ffd700 !important;
            z-index: 1;
          }
          @keyframes cellBlink {
            0% { outline: 3.5px solid #ffd70066; }
            60% { outline: 3.5px solid #ffd700; }
            95% { outline: 3.5px solid #ffd700; }
            100% { outline: none; }
          }
        `}
      </style>

      <div
        style={{
          minHeight: "100vh",
          background: COLORS.BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 48,
          boxSizing: "border-box",
          userSelect: "none",
          color: COLORS.TITLE,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h1 style={{ fontWeight: "bold", fontSize: 36, marginBottom: 24 }}>
          Your Score:{" "}
          <span style={{ color: COLORS.GRID_BORDER, fontWeight: "900" }}>
            {scores[playerId] || 0}
          </span>
        </h1>

        <div
          style={{
            background: COLORS.PANEL,
            borderRadius: 18,
            boxShadow: "0 8px 40px #000c",
            display: "flex",
            alignItems: "flex-start",
            gap: 36,
            padding: 28,
          }}
        >
          <div>
            <div
              style={{
                border: `2px solid ${COLORS.GRID_BORDER}`,
                borderRadius: 14,
                background: COLORS.BG,
                boxShadow: `0 0 0 7px #252525, 0 8px 20px #000c`,
                padding: 18,
                display: "inline-block",
                overflow: "auto",
                maxHeight: CELL_SIZE * GRID_SIZE + 36,
                maxWidth: CELL_SIZE * GRID_SIZE + 36,
              }}
            >
              <div
                ref={gridRef}
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  background: "#181a1d",
                  borderRadius: 10,
                  boxShadow: "0 4px 16px #1114",
                  overflow: "hidden",
                }}
              >
                {grid.map((row, y) =>
                  row.map((cell, x) => {
                    const claimed = cell && cell.id;
                    const color = claimed
                      ? SHAPES.find((i) => i.id === cell.id)?.color
                      : null;
                    const isPreviewCell =
                      showPreview && hoveredShapeCell(rotatedShape, y, x, hover);
                    const isVerticalSeparator = x === 4;
                    let borderStyles = {
                      borderTop:
                        y === 0 ? `3.5px solid ${COLORS.GRID_BORDER}` : `1.5px solid ${COLORS.GRID_LINE}`,
                      borderBottom:
                        y === GRID_SIZE - 1 ? `3.5px solid ${COLORS.GRID_BORDER}` : `1.5px solid ${COLORS.GRID_LINE}`,
                      borderLeft:
                        x === 0 ? `3.5px solid ${COLORS.GRID_BORDER}` : `1.5px solid ${COLORS.GRID_LINE}`,
                      borderRight:
                        isVerticalSeparator
                          ? `5.5px solid ${COLORS.GRID_BORDER}`
                          : x === GRID_SIZE - 1
                          ? `3.5px solid ${COLORS.GRID_BORDER}`
                          : `1.5px solid ${COLORS.GRID_LINE}`,
                    };
                    return (
                      <div
                        key={`${y}-${x}`}
                        ref={(el) => {
                          const key = `${y}-${x}`;
                          if (el) cellRefs.current[key] = el;
                          else delete cellRefs.current[key];
                        }}
                        onMouseEnter={() => selected !== null && setHover({ y, x })}
                        onMouseLeave={() => selected !== null && setHover({ x: null, y: null })}
                        onClick={() => handlePlace(y, x)}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          backgroundColor: isPreviewCell
                            ? nextItem.color
                            : claimed
                            ? color
                            : (x + y) % 2 === 0
                            ? COLORS.GRID_CELL_BG1
                            : COLORS.GRID_CELL_BG2,
                          transition: "background 0.09s, box-shadow 0.15s",
                          opacity: isPreviewCell ? 0.7 : 1,
                          borderRadius: 6,
                          cursor: selected !== null ? "pointer" : "default",
                          boxShadow: claimed
                            ? `0 0 9px 1.9px ${color}bb`
                            : "none",
                          boxSizing: "border-box",
                          userSelect: "none",
                          ...borderStyles,
                        }}
                        title={claimed && cell.by ? `${cell.id} (by ${cell.by})` : undefined}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 36,
              minWidth: 280,
            }}
          >
            <div
              style={{
                background: "#191922",
                borderRadius: 10,
                boxShadow: "0 0 0 2.5px #53524f44",
                border: "2px solid #363636",
                padding: "22px 26px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: COLORS.TITLE,
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                Next Item
              </div>
              <ShapePreview shape={nextItem.shape} color={nextItem.color} />
            </div>

            <div
              style={{
                background: "#191922",
                borderRadius: 10,
                boxShadow: "0 0 0 2.5px #53524f33",
                border: "2px solid #303841",
                padding: "18px 18px 20px 18px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 13,
                minWidth: 280,
              }}
            >
              <div
                style={{
                  color: COLORS.TITLE,
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 6,
                  letterSpacing: 0.6,
                }}
              >
                Pieces
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                {SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    disabled={selected !== null}
                    onClick={() => {
                      setSelected(shape.id);
                      setRotation(0);
                    }}
                    style={{
                      cursor: selected === null ? "pointer" : "not-allowed",
                      background: COLORS.PANEL,
                      color: shape.color,
                      width: 44,
                      height: 44,
                      border: `2.5px solid ${shape.color}`,
                      borderRadius: 10,
                      fontWeight: 900,
                      fontSize: 20,
                      outline: selected === shape.id ? `3.5px solid #FFDD80` : "none",
                      boxShadow: selected === shape.id ? `0 0 8px 3px #FEEFBA66` : "none",
                      transition: "all 0.14s",
                      userSelect: "none",
                    }}
                    title={shape.id}
                  >
                    {shape.id}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setRotation((r) => (r + 1) % 4)}
                disabled={!selected}
                style={{
                  marginTop: 14,
                  background: "#323641",
                  color: "#ffde59",
                  border: "2px solid #FFD700",
                  borderRadius: 12,
                  padding: "10px 20px",
                  cursor: selected ? "pointer" : "not-allowed",
                  fontWeight: 800,
                  fontSize: 16,
                  userSelect: "none",
                  boxShadow: selected ? "0 0 15px #FFDD80cc" : "none",
                  transition: "background-color 0.3s ease",
                }}
              >
                Rotate
              </button>
              {selected && (
                <div style={{ marginTop: 10 }}>
                  <ShapePreview shape={rotatedShape} color={currentShape?.color} />
                </div>
              )}
            </div>

            <div
              style={{
                background: "#181b22",
                borderRadius: 10,
                boxShadow: "0 0 0 2.5px #244a7233",
                border: "2px solid #22323d",
                padding: "16px 20px",
                minWidth: 280,
              }}
            >
              <div
                style={{
                  color: COLORS.TITLE,
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 0.5,
                  marginBottom: 10,
                }}
              >
                Players
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {playerList.map((name) => {
                  const avatarColor =
                    PLAYER_COLORS[
                      (name.charCodeAt(0) + name.length * 13) % PLAYER_COLORS.length
                    ];
                  return (
                    <li
                      key={name}
                      onClick={() => scrollToPlayer(name)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 10,
                        fontWeight: name === playerId ? 700 : 500,
                        fontSize: 16,
                        opacity: name === playerId ? 1 : 0.75,
                        cursor: "pointer",
                        userSelect: "none",
                        padding: "3px 8px",
                        borderRadius: 6,
                        transition: "background-color 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#292b30")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                      title="Click to highlight player's blocks"
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 18,
                          height: 18,
                          backgroundColor: avatarColor,
                          borderRadius: "50%",
                          border:
                            name === playerId
                              ? "3px solid #FFD700"
                              : "2px solid #434343",
                          flexShrink: 0,
                        }}
                      />
                      {name}
                      <span
                        style={{
                          marginLeft: "auto",
                          fontWeight: 700,
                          color: "#ffd700",
                          fontSize: 15,
                          letterSpacing: 0.3,
                        }}
                      >
                        {scores[name] || 0}
                      </span>
                      {name === playerId && (
                        <span
                          style={{
                            backgroundColor: "#ffd700",
                            color: "#292822",
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 11,
                            padding: "2px 10px",
                            marginLeft: 10,
                            letterSpacing: 0.8,
                          }}
                        >
                          You
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
