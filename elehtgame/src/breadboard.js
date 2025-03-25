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
      p5.line(currentWire.start.x, currentWire.start.y, p5.mouseX, p5.mouseY);
    }
    components.forEach((component) => {
      if (component.type === "resistor") {
        drawResistor(p5, component.x, component.y);
      } else if (component.type === "led") {
        drawLED(p5, component.x, component.y);
      }
    });
  };

  const drawPowerRails = (p5, yPosition) => {
    p5.strokeWeight(2);
    p5.stroke(255, 0, 0);
    p5.line(70, yPosition, 730, yPosition);
    p5.stroke(0, 0, 0);
    p5.line(70, yPosition + 40, 730, yPosition + 40);
    p5.fill(0);
    for (let group = 0; group < 6; group++) {
      for (let hole = 0; hole < 4; hole++) {
        const x = 70 + group * 120 + hole * 20;
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

  const detectHole = (p5) => {
    const holePositions = [];
    for (let col = 0; col < 34; col++) {
      for (let row = 0; row < 6; row++) {
        holePositions.push({ x: 70 + col * 20, y: 150 + row * 20 });
        holePositions.push({ x: 70 + col * 20, y: 350 + row * 20 });
      }
    }
    [80, 480].forEach((yPos) => {
      for (let group = 0; group < 6; group++) {
        for (let hole = 0; hole < 4; hole++) {
          holePositions.push({ x: 70 + group * 120 + hole * 20, y: yPos + 15 });
          holePositions.push({ x: 70 + group * 120 + hole * 20, y: yPos + 25 });
        }
      }
    });
    return holePositions.find(hole => Math.sqrt(Math.pow(p5.mouseX - hole.x, 2) + Math.pow(p5.mouseY - hole.y, 2)) < 10);
  };

  const mousePressed = (p5) => {
    const hole = detectHole(p5);
    if (hole) setCurrentWire({ start: hole, color: selectedColor });
  };

  const mouseReleased = (p5) => {
    if (currentWire) {
      const hole = detectHole(p5);
      if (hole) {
        setWires((prevWires) => [...prevWires, { start: currentWire.start, end: hole, color: currentWire.color }]);
      }
      setCurrentWire(null);
    }
  };

  return (
    <div>
      <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} />
      <Sketch setup={setup} draw={draw} mousePressed={mousePressed} mouseReleased={mouseReleased} />
    </div>
  );
};

export default Breadboard;