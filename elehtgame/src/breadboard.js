import React, { useState } from "react";
import Sketch from "react-p5";

const Breadboard = () => {
  const [components, setComponents] = useState([
    { id: 1, type: "resistor", x: 100, y: 400 },
    { id: 2, type: "led", x: 200, y: 400 },
  ]);
  const [wires, setWires] = useState([]);
  const [currentWire, setCurrentWire] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [dragging, setDragging] = useState(null);
  const [mode, setMode] = useState("connect"); // "connect" or "select"

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(800, 600).parent(canvasParentRef);
    p5.background(220);
  };

  const draw = (p5) => {
    p5.background(220);

    // Draw the breadboard body.
    p5.fill(256);
    p5.rect(50, 50, 700, 500, 10);

    // Draw power rails (upper & lower).
    drawPowerRails(p5, 80);
    drawPowerRails(p5, 480);

    // Draw middle area with split.
    drawMiddleHolesWithSplit(p5);

    // Draw finalized wires.
    drawWires(p5);

    // If a wire is being drawn in connect mode, show a live preview.
    if (currentWire) {
      p5.stroke(currentWire.color);
      p5.strokeWeight(2);
      p5.line(
        currentWire.start.x,
        currentWire.start.y,
        p5.mouseX,
        p5.mouseY
      );
    }

    // Draw components.
    components.forEach((component) => {
      if (component.type === "resistor") {
        drawResistor(p5, component.x, component.y);
      } else if (component.type === "led") {
        drawLED(p5, component.x, component.y);
      }
    });
  };

  // Draw the power rails using 5 groups per row (each group has 4 holes)
  // with two rows (positive & negative) per rail.
  const drawPowerRails = (p5, yPosition) => {
    p5.strokeWeight(2);
    // Draw the positive rail (red) and negative rail (black).
    p5.stroke(255, 0, 0);
    p5.line(70, yPosition, 730, yPosition);
    p5.stroke(0, 0, 0);
    p5.line(70, yPosition + 40, 730, yPosition + 40);

    // Calculate layout:
    // Total width: 660 (from x=70 to 730); 5 groups; 4 holes per group.
    // Holes in each group span: (4 - 1) * 20 = 60px.
    // Gaps: (660 - (5 * 60)) / 6 = 60px.
    const groups = 5;
    const holesPerGroup = 4;
    const totalWidth = 660; // from x = 70 to 730
    const groupWidth = (holesPerGroup - 1) * 20; // 60px per group
    const gap = (totalWidth - groups * groupWidth) / (groups + 1); // 60px gap

    for (let group = 0; group < groups; group++) {
      const groupStartX = 70 + gap * (group + 1) + group * groupWidth;
      for (let hole = 0; hole < holesPerGroup; hole++) {
        const x = groupStartX + hole * 20;
        p5.fill(0);
        // Positive rail row of holes.
        p5.ellipse(x, yPosition + 15, 5, 5);
        // Negative rail row of holes.
        p5.ellipse(x, yPosition + 25, 5, 5);
      }
    }
  };

  // Draw the middle breadboard area with two groups of holes and a central split.
  const drawMiddleHolesWithSplit = (p5) => {
    p5.fill(0);
    for (let col = 0; col < 34; col++) {
      for (let row = 0; row < 6; row++) {
        p5.ellipse(70 + col * 20, 150 + row * 20, 5, 5);
        p5.ellipse(70 + col * 20, 350 + row * 20, 5, 5);
      }
    }
    p5.fill(200);
    p5.rect(70, 280, 660, 40);
  };

  const drawResistor = (p5, x, y) => {
    p5.fill(255, 120, 0);
    p5.rect(x, y, 60, 20, 5);
    p5.stroke(0);
    p5.line(x - 10, y + 10, x, y + 10);
    p5.line(x + 60, y + 10, x + 70, y + 10);
  };

  const drawLED = (p5, x, y) => {
    p5.fill(255, 0, 0);
    p5.ellipse(x, y, 20, 20);
    p5.stroke(0);
    p5.line(x + 5, y + 10, x + 5, y + 15);
    p5.line(x + 5, y + 15, x + 15, y + 15);
    p5.line(x + 15, y + 15, x + 15, y + 30);
    p5.line(x - 5, y + 10, x - 5, y + 30);
  };

  const drawWires = (p5) => {
    wires.forEach((wire) => {
      p5.stroke(wire.color);
      p5.strokeWeight(2);
      p5.line(wire.start.x, wire.start.y, wire.end.x, wire.end.y);
    });
  };

  // Returns the first valid hole if the mouse is within 10px.
  const detectHole = (p5) => {
    const holePositions = [];

    // Middle breadboard holes.
    for (let col = 0; col < 34; col++) {
      for (let row = 0; row < 6; row++) {
        holePositions.push({ x: 70 + col * 20, y: 150 + row * 20 });
        holePositions.push({ x: 70 + col * 20, y: 350 + row * 20 });
      }
    }

    // Power rails holes (for y-bases 80 and 480).
    [80, 480].forEach((base) => {
      const groups = 5;
      const holesPerGroup = 4;
      const totalWidth = 660;
      const groupWidth = (holesPerGroup - 1) * 20;
      const gap = (totalWidth - groups * groupWidth) / (groups + 1);
      for (let group = 0; group < groups; group++) {
        const groupStartX = 70 + gap * (group + 1) + group * groupWidth;
        for (let hole = 0; hole < holesPerGroup; hole++) {
          const x = groupStartX + hole * 20;
          holePositions.push({ x, y: base + 15 });
          holePositions.push({ x, y: base + 25 });
        }
      }
    });

    return holePositions.find(
      (hole) => Math.hypot(p5.mouseX - hole.x, p5.mouseY - hole.y) < 10
    );
  };

  // Handle mousePressed differently based on mode.
  const mousePressed = (p5) => {
    if (mode === "connect") {
      const hole = detectHole(p5);
      if (hole) {
        setCurrentWire({ start: hole, color: selectedColor });
      }
    } else if (mode === "select") {
      // Check if a component was clicked.
      for (let comp of components) {
        if (
          p5.mouseX > comp.x - 20 &&
          p5.mouseX < comp.x + 80 &&
          p5.mouseY > comp.y - 20 &&
          p5.mouseY < comp.y + 40
        ) {
          setDragging(comp.id);
          break;
        }
      }
    }
  };

  // Allow dragging of components only in select mode.
  const mouseDragged = (p5) => {
    if (mode === "select" && dragging !== null) {
      setComponents((prevComponents) =>
        prevComponents.map((comp) =>
          comp.id === dragging
            ? { ...comp, x: p5.mouseX, y: p5.mouseY }
            : comp
        )
      );
    }
  };

  // On mouseReleased, finish the current action based on mode.
  const mouseReleased = (p5) => {
    if (mode === "connect") {
      if (currentWire) {
        const hole = detectHole(p5);
        if (hole) {
          setWires((prevWires) => [
            ...prevWires,
            { start: currentWire.start, end: hole, color: currentWire.color },
          ]);
        }
        setCurrentWire(null);
      }
    } else if (mode === "select") {
      setDragging(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        />
        <button onClick={() => setMode("select")} style={{ marginLeft: "10px" }}>
          Select Mode
        </button>
        <button onClick={() => setMode("connect")} style={{ marginLeft: "10px" }}>
          Connect Mode
        </button>
        <span style={{ marginLeft: "10px" }}>
          Current Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </span>
      </div>
      <Sketch
        setup={setup}
        draw={draw}
        mousePressed={mousePressed}
        mouseDragged={mouseDragged}
        mouseReleased={mouseReleased}
      />
    </div>
  );
};

export default Breadboard;
