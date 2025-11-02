import React from "react";
import { Path, Circle } from "@shopify/react-native-skia";
import { makePathFromPoints } from "./utils";

export default function PaperGuides({ paperStyle, pageTemplate = "blank", page }) {
  const nodes = [];
  
  // Use pageTemplate if provided, otherwise fall back to paperStyle
  const template = pageTemplate || paperStyle;
  
  const lineColor = "#e5e7eb";
  const gridColor = "#e0e0e0";
  const dotColor = "#d0d0d0";
  
  // BLANK - No guides
  if (template === "blank") {
    return null;
  }
  
  // THIN LINE - Horizontal lines with small spacing
  if (template === "thin_line") {
    const gap = 24;
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`line-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
  }
  
  // BOLD LINE - Horizontal lines with thicker stroke
  else if (template === "bold_line") {
    const gap = 32;
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`line-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={1.5}
          style="stroke"
        />
      );
    }
  }
  
  // MINI CHECK - Small grid
  else if (template === "mini_check") {
    const gap = 16;
    // Horizontal lines
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`gy-${y}`}
          path={makePathFromPoints([
            { x: page.x + 8, y },
            { x: page.x + page.w - 8, y },
          ])}
          color={gridColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
    // Vertical lines
    for (let x = page.x + gap; x < page.x + page.w; x += gap) {
      nodes.push(
        <Path
          key={`gx-${x}`}
          path={makePathFromPoints([
            { x, y: page.y + 8 },
            { x, y: page.y + page.h - 8 },
          ])}
          color={gridColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
  }
  
  // MID CHECK - Medium grid
  else if (template === "mid_check") {
    const gap = 24;
    // Horizontal lines
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`gy-${y}`}
          path={makePathFromPoints([
            { x: page.x + 8, y },
            { x: page.x + page.w - 8, y },
          ])}
          color={gridColor}
          strokeWidth={0.8}
          style="stroke"
        />
      );
    }
    // Vertical lines
    for (let x = page.x + gap; x < page.x + page.w; x += gap) {
      nodes.push(
        <Path
          key={`gx-${x}`}
          path={makePathFromPoints([
            { x, y: page.y + 8 },
            { x, y: page.y + page.h - 8 },
          ])}
          color={gridColor}
          strokeWidth={0.8}
          style="stroke"
        />
      );
    }
  }
  
  // DOT GRID - Dots at intersections
  else if (template === "dot_grid") {
    const gap = 20;
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      for (let x = page.x + gap; x < page.x + page.w; x += gap) {
        nodes.push(
          <Circle
            key={`dot-${x}-${y}`}
            cx={x}
            cy={y}
            r={1.5}
            color={dotColor}
          />
        );
      }
    }
  }
  
  // SQUARE GRID - Large grid
  else if (template === "square_grid") {
    const gap = 32;
    // Horizontal lines
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`gy-${y}`}
          path={makePathFromPoints([
            { x: page.x + 8, y },
            { x: page.x + page.w - 8, y },
          ])}
          color={gridColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
    // Vertical lines
    for (let x = page.x + gap; x < page.x + page.w; x += gap) {
      nodes.push(
        <Path
          key={`gx-${x}`}
          path={makePathFromPoints([
            { x, y: page.y + 8 },
            { x, y: page.y + page.h - 8 },
          ])}
          color={gridColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
  }
  
  // CORNELL - Cornell note-taking system
  else if (template === "cornell") {
    const cueWidth = page.w * 0.3;
    const noteWidth = page.w * 0.7;
    const summaryHeight = page.h * 0.2;
    
    // Vertical divider (cue column)
    nodes.push(
      <Path
        key="cornell-vertical"
        path={makePathFromPoints([
          { x: page.x + cueWidth, y: page.y + 12 },
          { x: page.x + cueWidth, y: page.y + page.h - summaryHeight },
        ])}
        color={lineColor}
        strokeWidth={1.5}
        style="stroke"
      />
    );
    
    // Horizontal divider (summary section)
    nodes.push(
      <Path
        key="cornell-horizontal"
        path={makePathFromPoints([
          { x: page.x + 12, y: page.y + page.h - summaryHeight },
          { x: page.x + page.w - 12, y: page.y + page.h - summaryHeight },
        ])}
        color={lineColor}
        strokeWidth={1.5}
        style="stroke"
      />
    );
    
    // Lines in note-taking area
    const gap = 28;
    for (let y = page.y + gap; y < page.y + page.h - summaryHeight; y += gap) {
      nodes.push(
        <Path
          key={`cornell-line-${y}`}
          path={makePathFromPoints([
            { x: page.x + cueWidth + 8, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
  }
  
  // WEEKLY - Weekly planner
  else if (template === "weekly") {
    const dayHeight = page.h / 7;
    for (let i = 1; i < 7; i++) {
      const y = page.y + dayHeight * i;
      nodes.push(
        <Path
          key={`day-${i}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
  }
  
  // MONTHLY - Monthly calendar grid
  else if (template === "monthly") {
    const rows = 6;
    const cols = 7;
    const cellHeight = (page.h - 60) / rows;
    const cellWidth = (page.w - 24) / cols;
    
    // Header row
    nodes.push(
      <Path
        key="header-line"
        path={makePathFromPoints([
          { x: page.x + 12, y: page.y + 40 },
          { x: page.x + page.w - 12, y: page.y + 40 },
        ])}
        color={lineColor}
        strokeWidth={1.5}
        style="stroke"
      />
    );
    
    // Horizontal lines
    for (let i = 1; i <= rows; i++) {
      const y = page.y + 40 + cellHeight * i;
      nodes.push(
        <Path
          key={`row-${i}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.8}
          style="stroke"
        />
      );
    }
    
    // Vertical lines
    for (let i = 1; i < cols; i++) {
      const x = page.x + 12 + cellWidth * i;
      nodes.push(
        <Path
          key={`col-${i}`}
          path={makePathFromPoints([
            { x, y: page.y + 40 },
            { x, y: page.y + page.h - 12 },
          ])}
          color={lineColor}
          strokeWidth={0.8}
          style="stroke"
        />
      );
    }
  }
  
  // DAILY - Daily planner with time slots
  else if (template === "daily") {
    const gap = 40; // Each hour
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`hour-${y}`}
          path={makePathFromPoints([
            { x: page.x + 60, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
    
    // Time column divider
    nodes.push(
      <Path
        key="time-divider"
        path={makePathFromPoints([
          { x: page.x + 60, y: page.y + 12 },
          { x: page.x + 60, y: page.y + page.h - 12 },
        ])}
        color={lineColor}
        strokeWidth={1.5}
        style="stroke"
      />
    );
  }
  
  // HEX GRID - Hexagonal grid pattern (optimized)
  else if (template === "hex_grid") {
    const hexSize = 24; // Increased size to reduce count
    const hexHeight = hexSize * Math.sqrt(3);
    const hexWidth = hexSize * 2;
    
    for (let row = 0; row * hexHeight < page.h; row++) {
      for (let col = 0; col * hexWidth * 0.75 < page.w; col++) {
        const x = page.x + 20 + col * hexWidth * 0.75;
        const y = page.y + 20 + row * hexHeight + (col % 2 === 1 ? hexHeight / 2 : 0);
        
        // Draw hexagon outline
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          points.push({
            x: x + hexSize * Math.cos(angle),
            y: y + hexSize * Math.sin(angle),
          });
        }
        points.push(points[0]); // Close the hexagon
        
        nodes.push(
          <Path
            key={`hex-${row}-${col}`}
            path={makePathFromPoints(points)}
            color={gridColor}
            strokeWidth={0.5}
            style="stroke"
          />
        );
      }
    }
  }
  
  // NOTES - Simple lined notes with margin
  else if (template === "notes") {
    const gap = 28;
    const marginLeft = 80;
    
    // Margin line
    nodes.push(
      <Path
        key="margin-line"
        path={makePathFromPoints([
          { x: page.x + marginLeft, y: page.y + 12 },
          { x: page.x + marginLeft, y: page.y + page.h - 12 },
        ])}
        color="#ff6b6b"
        strokeWidth={1.5}
        style="stroke"
      />
    );
    
    // Horizontal lines
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`note-line-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.8}
          style="stroke"
        />
      );
    }
  }
  
  // FLASHCARD - Two sections (front/back)
  else if (template === "flashcard") {
    const midY = page.y + page.h / 2;
    
    // Middle divider
    nodes.push(
      <Path
        key="flashcard-divider"
        path={makePathFromPoints([
          { x: page.x + 12, y: midY },
          { x: page.x + page.w - 12, y: midY },
        ])}
        color={lineColor}
        strokeWidth={2}
        style="stroke"
      />
    );
    
    // Dashed line for folding
    const dashGap = 10;
    for (let x = page.x + 12; x < page.x + page.w - 12; x += dashGap * 2) {
      nodes.push(
        <Path
          key={`dash-${x}`}
          path={makePathFromPoints([
            { x, y: midY },
            { x: Math.min(x + dashGap, page.x + page.w - 12), y: midY },
          ])}
          color="#aaa"
          strokeWidth={1}
          style="stroke"
        />
      );
    }
  }
  
  // MINDMAP - Central circle with radiating lines
  else if (template === "mindmap") {
    const centerX = page.x + page.w / 2;
    const centerY = page.y + page.h / 2;
    const centerRadius = 40;
    
    // Central circle
    nodes.push(
      <Circle
        key="mindmap-center"
        cx={centerX}
        cy={centerY}
        r={centerRadius}
        color={gridColor}
        style="stroke"
        strokeWidth={2}
      />
    );
    
    // Radiating lines (8 directions)
    const numLines = 8;
    for (let i = 0; i < numLines; i++) {
      const angle = (Math.PI * 2 * i) / numLines;
      const startX = centerX + centerRadius * Math.cos(angle);
      const startY = centerY + centerRadius * Math.sin(angle);
      const endX = centerX + (page.w / 3) * Math.cos(angle);
      const endY = centerY + (page.h / 3) * Math.sin(angle);
      
      nodes.push(
        <Path
          key={`mindmap-line-${i}`}
          path={makePathFromPoints([
            { x: startX, y: startY },
            { x: endX, y: endY },
          ])}
          color={gridColor}
          strokeWidth={1.5}
          style="stroke"
        />
      );
    }
  }
  
  // OUTLINE - Hierarchical outline structure
  else if (template === "outline") {
    const gap = 32;
    const indent1 = 40;
    const indent2 = 80;
    const indent3 = 120;
    
    let y = page.y + gap;
    let level = 0;
    
    while (y < page.y + page.h) {
      const indent = level === 0 ? indent1 : level === 1 ? indent2 : indent3;
      
      // Bullet point
      nodes.push(
        <Circle
          key={`bullet-${y}`}
          cx={page.x + indent - 10}
          cy={y}
          r={3}
          color={dotColor}
        />
      );
      
      // Line
      nodes.push(
        <Path
          key={`outline-${y}`}
          path={makePathFromPoints([
            { x: page.x + indent, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
      
      y += gap;
      level = (level + 1) % 3;
    }
  }
  
  // VOCAB - Vocabulary list (word | definition)
  else if (template === "vocab") {
    const gap = 36;
    const dividerX = page.x + page.w * 0.35;
    
    // Vertical divider
    nodes.push(
      <Path
        key="vocab-divider"
        path={makePathFromPoints([
          { x: dividerX, y: page.y + 12 },
          { x: dividerX, y: page.y + page.h - 12 },
        ])}
        color={lineColor}
        strokeWidth={1.5}
        style="stroke"
      />
    );
    
    // Horizontal lines
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`vocab-line-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.8}
          style="stroke"
        />
      );
    }
  }
  
  // TODO - To-do list with checkboxes
  else if (template === "todo") {
    const gap = 32;
    const checkboxSize = 16;
    
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      // Checkbox
      nodes.push(
        <Path
          key={`checkbox-${y}`}
          path={makePathFromPoints([
            { x: page.x + 20, y: y - checkboxSize / 2 },
            { x: page.x + 20 + checkboxSize, y: y - checkboxSize / 2 },
            { x: page.x + 20 + checkboxSize, y: y + checkboxSize / 2 },
            { x: page.x + 20, y: y + checkboxSize / 2 },
            { x: page.x + 20, y: y - checkboxSize / 2 },
          ])}
          color={gridColor}
          strokeWidth={1.5}
          style="stroke"
        />
      );
      
      // Line
      nodes.push(
        <Path
          key={`todo-line-${y}`}
          path={makePathFromPoints([
            { x: page.x + 50, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
  }
  
  // HABIT - Habit tracker grid (optimized)
  else if (template === "habit") {
    const rows = 10; // 10 habits
    const cols = 15; // 15 days (reduced for performance)
    const cellHeight = (page.h - 60) / rows;
    const cellWidth = (page.w - 100) / cols;
    
    // Header row
    nodes.push(
      <Path
        key="habit-header"
        path={makePathFromPoints([
          { x: page.x + 100, y: page.y + 40 },
          { x: page.x + page.w - 12, y: page.y + 40 },
        ])}
        color={lineColor}
        strokeWidth={1.5}
        style="stroke"
      />
    );
    
    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const y = page.y + 40 + cellHeight * i;
      nodes.push(
        <Path
          key={`habit-row-${i}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
    
    // Vertical divider (habit name column)
    nodes.push(
      <Path
        key="habit-name-divider"
        path={makePathFromPoints([
          { x: page.x + 100, y: page.y + 40 },
          { x: page.x + 100, y: page.y + page.h - 12 },
        ])}
        color={lineColor}
        strokeWidth={1.5}
        style="stroke"
      />
    );
    
    // Vertical lines (days)
    for (let i = 1; i <= cols; i++) {
      const x = page.x + 100 + cellWidth * i;
      nodes.push(
        <Path
          key={`habit-col-${i}`}
          path={makePathFromPoints([
            { x, y: page.y + 40 },
            { x, y: page.y + page.h - 12 },
          ])}
          color={lineColor}
          strokeWidth={0.3}
          style="stroke"
        />
      );
    }
  }
  
  // GOAL - Goal setting template
  else if (template === "goal") {
    const sections = [
      { title: "Goal", height: 0.2 },
      { title: "Action Steps", height: 0.4 },
      { title: "Timeline", height: 0.2 },
      { title: "Progress", height: 0.2 },
    ];
    
    let currentY = page.y + 12;
    sections.forEach((section, idx) => {
      const sectionHeight = page.h * section.height;
      
      // Section divider
      nodes.push(
        <Path
          key={`goal-section-${idx}`}
          path={makePathFromPoints([
            { x: page.x + 12, y: currentY },
            { x: page.x + page.w - 12, y: currentY },
          ])}
          color={lineColor}
          strokeWidth={1.5}
          style="stroke"
        />
      );
      
      currentY += sectionHeight;
    });
  }
  
  // MEETING - Meeting notes template
  else if (template === "meeting") {
    const headerHeight = 80;
    const gap = 28;
    
    // Header section divider
    nodes.push(
      <Path
        key="meeting-header"
        path={makePathFromPoints([
          { x: page.x + 12, y: page.y + headerHeight },
          { x: page.x + page.w - 12, y: page.y + headerHeight },
        ])}
        color={lineColor}
        strokeWidth={2}
        style="stroke"
      />
    );
    
    // Notes lines
    for (let y = page.y + headerHeight + gap; y < page.y + page.h - 100; y += gap) {
      nodes.push(
        <Path
          key={`meeting-line-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
    
    // Action items section
    nodes.push(
      <Path
        key="meeting-action"
        path={makePathFromPoints([
          { x: page.x + 12, y: page.y + page.h - 100 },
          { x: page.x + page.w - 12, y: page.y + page.h - 100 },
        ])}
        color={lineColor}
        strokeWidth={2}
        style="stroke"
      />
    );
  }
  
  // PROJECT - Project planning template
  else if (template === "project") {
    const cols = 3;
    const colWidth = (page.w - 24) / cols;
    
    // Column dividers
    for (let i = 1; i < cols; i++) {
      const x = page.x + 12 + colWidth * i;
      nodes.push(
        <Path
          key={`project-col-${i}`}
          path={makePathFromPoints([
            { x, y: page.y + 12 },
            { x, y: page.y + page.h - 12 },
          ])}
          color={lineColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
    
    // Row lines
    const gap = 40;
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`project-row-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
  }
  
  // BRAINSTORM - Free-form brainstorming (optimized)
  else if (template === "brainstorm") {
    // Light dot grid for flexibility
    const gap = 40; // Increased gap to reduce dots
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      for (let x = page.x + gap; x < page.x + page.w; x += gap) {
        nodes.push(
          <Circle
            key={`brainstorm-dot-${x}-${y}`}
            cx={x}
            cy={y}
            r={1}
            color="#e0e0e0"
          />
        );
      }
    }
  }
  
  // KANBAN - Kanban board (To Do | In Progress | Done)
  else if (template === "kanban") {
    const cols = 3;
    const colWidth = (page.w - 24) / cols;
    
    // Column dividers
    for (let i = 1; i < cols; i++) {
      const x = page.x + 12 + colWidth * i;
      nodes.push(
        <Path
          key={`kanban-col-${i}`}
          path={makePathFromPoints([
            { x, y: page.y + 12 },
            { x, y: page.y + page.h - 12 },
          ])}
          color={lineColor}
          strokeWidth={1.5}
          style="stroke"
        />
      );
    }
    
    // Header row
    nodes.push(
      <Path
        key="kanban-header"
        path={makePathFromPoints([
          { x: page.x + 12, y: page.y + 50 },
          { x: page.x + page.w - 12, y: page.y + 50 },
        ])}
        color={lineColor}
        strokeWidth={1.5}
        style="stroke"
      />
    );
  }
  
  // JOURNAL - Daily journal template
  else if (template === "journal") {
    const gap = 30;
    const dateHeight = 60;
    
    // Date section
    nodes.push(
      <Path
        key="journal-date"
        path={makePathFromPoints([
          { x: page.x + 12, y: page.y + dateHeight },
          { x: page.x + page.w - 12, y: page.y + dateHeight },
        ])}
        color={lineColor}
        strokeWidth={1.5}
        style="stroke"
      />
    );
    
    // Journal lines
    for (let y = page.y + dateHeight + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`journal-line-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
  }
  
  // DIARY - Similar to journal but with time slots
  else if (template === "diary") {
    const gap = 35;
    const timeWidth = 70;
    
    // Time column divider
    nodes.push(
      <Path
        key="diary-time-divider"
        path={makePathFromPoints([
          { x: page.x + timeWidth, y: page.y + 12 },
          { x: page.x + timeWidth, y: page.y + page.h - 12 },
        ])}
        color={lineColor}
        strokeWidth={1.5}
        style="stroke"
      />
    );
    
    // Entry lines
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`diary-line-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
  }
  
  // GRATITUDE - Gratitude journal (3 things)
  else if (template === "gratitude") {
    const sections = 3;
    const sectionHeight = (page.h - 60) / sections;
    const gap = 28;
    
    for (let i = 0; i < sections; i++) {
      const sectionY = page.y + 40 + sectionHeight * i;
      
      // Section divider
      nodes.push(
        <Path
          key={`gratitude-section-${i}`}
          path={makePathFromPoints([
            { x: page.x + 12, y: sectionY },
            { x: page.x + page.w - 12, y: sectionY },
          ])}
          color={lineColor}
          strokeWidth={1.5}
          style="stroke"
        />
      );
      
      // Lines within section
      for (let y = sectionY + gap; y < sectionY + sectionHeight - 10; y += gap) {
        nodes.push(
          <Path
            key={`gratitude-line-${i}-${y}`}
            path={makePathFromPoints([
              { x: page.x + 30, y },
              { x: page.x + page.w - 12, y },
            ])}
            color={lineColor}
            strokeWidth={0.5}
            style="stroke"
          />
        );
      }
    }
  }
  
  // BUDGET - Budget tracking template
  else if (template === "budget") {
    const cols = 4; // Category | Planned | Actual | Difference
    const colWidths = [0.3, 0.23, 0.23, 0.24];
    const headerHeight = 50;
    const rowHeight = 35;
    
    // Header divider
    nodes.push(
      <Path
        key="budget-header"
        path={makePathFromPoints([
          { x: page.x + 12, y: page.y + headerHeight },
          { x: page.x + page.w - 12, y: page.y + headerHeight },
        ])}
        color={lineColor}
        strokeWidth={2}
        style="stroke"
      />
    );
    
    // Column dividers
    let currentX = page.x + 12;
    for (let i = 0; i < cols - 1; i++) {
      currentX += (page.w - 24) * colWidths[i];
      nodes.push(
        <Path
          key={`budget-col-${i}`}
          path={makePathFromPoints([
            { x: currentX, y: page.y + 12 },
            { x: currentX, y: page.y + page.h - 12 },
          ])}
          color={lineColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
    
    // Row lines
    for (let y = page.y + headerHeight + rowHeight; y < page.y + page.h; y += rowHeight) {
      nodes.push(
        <Path
          key={`budget-row-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={0.5}
          style="stroke"
        />
      );
    }
  }
  
  // Fallback to old paperStyle for backward compatibility
  else if (paperStyle === "ruled") {
    const gap = 28;
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`r-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
  } else if (paperStyle === "grid") {
    const gap = 28;
    for (let y = page.y + gap; y < page.y + page.h; y += gap) {
      nodes.push(
        <Path
          key={`gy-${y}`}
          path={makePathFromPoints([
            { x: page.x + 12, y },
            { x: page.x + page.w - 12, y },
          ])}
          color={lineColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
    for (let x = page.x + gap; x < page.x + page.w; x += gap) {
      nodes.push(
        <Path
          key={`gx-${x}`}
          path={makePathFromPoints([
            { x, y: page.y + 12 },
            { x, y: page.y + page.h - 12 },
          ])}
          color={lineColor}
          strokeWidth={1}
          style="stroke"
        />
      );
    }
  }
  
  return nodes;
}
