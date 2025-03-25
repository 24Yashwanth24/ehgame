import React, { useState } from "react";
import Sketch from "react-p5";

const Breadboard = () => {
  const [components, setComponents] = useState([
    { id: 1, type: "resistor", x: 100, y: 400, rotated: false },
    { id: 2, type: "led", x: 200, y: 400, rotated: false },
  ]);
  const [wires, setWires] = useState([]);
  const [currentWire, setCurrentWire] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [dragging, setDragging] = useState(null);
  const [mode, setMode] = useState("connect");
  const [selectedComponent, setSelectedComponent] = useState(null);

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(800, 600).parent(canvasParentRef);
    p5.background(220);
  };

  const draw = (p5) => {
    p5.background(220);
    p5.fill(256);
    p5.rect(50, 50, 700, 500, 10);
    drawPowerRails(p5, 80);
    drawPowerRails(p5, 480);
    drawMiddleHolesWithSplit(p5);
    drawWires(p5);

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

    components.forEach((component) => {
      if (selectedComponent === component.id) {
        p5.stroke(255, 215, 0);
        p5.strokeWeight(3);
      } else {
        p5.noStroke();
      }
      if (component.type === "resistor") {
        drawResistor(p5, component.x, component.y, component.rotated);
      } else if (component.type === "led") {
        drawLED(p5, component.x, component.y, component.rotated);
      }
    });
  };

  const drawPowerRails = (p5, yPosition) => {
    p5.strokeWeight(2);
    p5.stroke(255, 0, 0);
    p5.line(70, yPosition, 730, yPosition);
    p5.stroke(0, 0, 0);
    p5.line(70, yPosition + 40, 730, yPosition + 40);
    const groups = 5;
    const holesPerGroup = 4;
    const totalWidth = 660;
    const groupWidth = (holesPerGroup - 1) * 20;
    const gap = (totalWidth - groups * groupWidth) / (groups + 1);

    for (let group = 0; group < groups; group++) {
      const groupStartX = 70 + gap * (group + 1) + group * groupWidth;
      for (let hole = 0; hole < holesPerGroup; hole++) {
        const x = groupStartX + hole * 20;
        p5.fill(0);
        p5.ellipse(x, yPosition + 15, 5, 5);
        p5.ellipse(x, yPosition + 25, 5, 5);
      }
    }
  };

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

  const drawResistor = (p5, x, y, rotated) => {
    p5.fill(255, 120, 0);
    if (rotated) {
      p5.rect(x, y, 20, 60, 5); // Rotate by changing width and height
      p5.stroke(0);
      p5.line(x + 10, y - 10, x + 10, y);
      p5.line(x + 10, y + 60, x + 10, y + 70);
    } else {
      p5.rect(x, y, 60, 20, 5);
      p5.stroke(0);
      p5.line(x - 10, y + 10, x, y + 10);
      p5.line(x + 60, y + 10, x + 70, y + 10);
    }
  };

  const drawLED = (p5, x, y, rotated) => {
    p5.fill(255, 0, 0); // LED color
    if (rotated) {
        // Draw the rounded top of the LED
        p5.beginShape();
        p5.vertex(x, y + 20); // Bottom left
        p5.vertex(x + 20, y + 20); // Bottom right
        p5.vertex(x + 25, y + 10); // Top right
        p5.vertex(x + 25, y); // Top right
        p5.vertex(x + 15, y); // Top left
        p5.vertex(x+10, y + 5); // Bottom left
        p5.vertex(x, y + 10); // Bottom left
        p5.endShape(p5.CLOSE);
    } else {
        // Draw the rounded top of the LED
        p5.beginShape();
        p5.vertex(x, y); 
        p5.vertex(x + 30, y); 
        p5.vertex(x + 30, y - 10); // Bottom right
        p5.vertex(x + 30, y-20); // Bottom left
        p5.vertex(x + 25, y-25); // Bottom left
        p5.vertex(x + 15, y-30); // Top left
        p5.vertex(x+10, y-30); // Top left
        p5.vertex(x+5, y-30); // Top left
        p5.vertex(x, y-25); // Top left
        p5.endShape(p5.CLOSE);
    }

    // Draw terminals, adjusting positions for straight leads
    p5.fill(0); // Lead color
    p5.rect(x+5, y, 3, 15); // Left terminal
// Right terminal
    p5.rect(x + 15, y, 3, 5);
    p5.rect(x+15,y+4,10,3); // Right terminal
    p5.rect(x+25,y+4,3,11); // Right terminal
     // Right terminal
     // Right terminal
};

  const drawWires = (p5) => {
    wires.forEach((wire) => {
      p5.stroke(wire.color);
      p5.strokeWeight(2);
      p5.line(wire.start.x, wire.start.y, wire.end.x, wire.end.y);
    });
  };

  const detectHole = (p5) => {
    const holePositions = [];
    for (let col = 0; col < 34; col++) {
      for (let row = 0; row < 6; row++) {
        holePositions.push({ x: 70 + col * 20, y: 150 + row * 20 });
        holePositions.push({ x: 70 + col * 20, y: 350 + row * 20 });
      }
    }
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

  const mousePressed = (p5) => {
    if (mode === "connect") {
      const hole = detectHole(p5);
      if (hole) {
        setCurrentWire({ start: hole, color: selectedColor });
      }
    } else if (mode === "select") {
      for (let comp of components) {
        if (
          p5.mouseX > comp.x - 20 &&
          p5.mouseX < comp.x + 80 &&
          p5.mouseY > comp.y - 20 &&
          p5.mouseY < comp.y + 40
        ) {
          setSelectedComponent(comp.id);
          setDragging(comp.id);
          return;
        }
      }
      setDragging(null);
      setSelectedComponent(null);
    }
  };

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

  const rotateSelected = () => {
    if (selectedComponent) {
      setComponents((prevComponents) =>
        prevComponents.map((comp) =>
          comp.id === selectedComponent
            ? { ...comp, rotated: !comp.rotated }
            : comp
        )
      );
    }
  };

  const deleteSelected = () => {
    if (selectedComponent) {
      setComponents((prevComponents) =>
        prevComponents.filter((comp) => comp.id !== selectedComponent)
      );
      setSelectedComponent(null);
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
        <button onClick={rotateSelected} disabled={!selectedComponent} style={{ marginLeft: "10px" }}>
          Rotate
        </button>
        <button onClick={deleteSelected} disabled={!selectedComponent} style={{ marginLeft: "10px" }}>
          Delete
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