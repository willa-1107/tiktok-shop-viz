// intro.js
// This function draws the intro scene with an avatar and five speech bubbles,
// creating an interactive introduction sequence with animated transitions.
// Entire layout is now grouped and shifted left via a <g> element.

export function showIntro(svg) {
  const canvasWidth = 1200; // Logical canvas width (matches viewBox width)
  const canvasCenter = canvasWidth / 2;

  // Wrap all visuals in a group and shift entire group to the left
  const group = svg.append("g")
    .attr("transform", "translate(-150, 0)");  // Shift everything left by 100 units

  // 1. ADD AVATAR IMAGE
  const avatarWidth = 580;
  const avatarX = canvasCenter - avatarWidth / 2;

  group.append("image")
    .attr("href", "assets/avatar.png")
    .attr("x", avatarX)
    .attr("y", 20)
    .attr("width", avatarWidth)
    .attr("height", 750)
    .attr("opacity", 0)
    .transition()
    .duration(1000)
    .attr("opacity", 1);

  // 2. DRAW MAIN SPEECH BUBBLE (ELLIPSE SHAPE)
  const mainBubble = {
    cx: canvasCenter + 520,
    cy: 140,
    rx: 230,
    ry: 90
  };

  group.append("ellipse")
    .attr("cx", mainBubble.cx)
    .attr("cy", mainBubble.cy)
    .attr("rx", mainBubble.rx)
    .attr("ry", mainBubble.ry)
    .attr("fill", "#fff8dc")
    .attr("stroke", "#e0d7b5")
    .attr("stroke-width", 1)
    .attr("opacity", 0)
    .transition()
    .duration(1500)
    .attr("opacity", 1);

  group.append("foreignObject")
    .attr("x", mainBubble.cx - 200)
    .attr("y", mainBubble.cy - 50)
    .attr("width", 420)
    .attr("height", 120)
    .append("xhtml:div")
    .style("font-size", "24px")
    .style("font-family", "'Comic Sans MS', cursive, sans-serif")
    .style("color", "#5F9EA0")
    .style("line-height", "1.4")
    .style("word-wrap", "break-word")
    .style("text-align", "center")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("height", "100%")
    .style("opacity", 0)
    .text("I want to open a TikTok store, what factors should I consider?")
    .transition()
    .delay(1000)
    .duration(1000)
    .style("opacity", 1);

  // 4. DRAW SMALLER QUESTION BUBBLES
  const bubbles = [
    { text: "Category?", dx: -300, dy: 200 },
    { text: "Product?", dx: 300, dy: 200 },
    { text: "Price?", dx: -300, dy: 400 },
    { text: "Video Promotion?", dx: 300, dy: 400 }
  ];

  bubbles.forEach((d, i) => {
    const centerX = canvasCenter + d.dx;
    const centerY = d.dy;
    const bubbleWidth = d.text === "Video Promotion?" ? 200 : 160;
    const offsetX = bubbleWidth / 2;

    group.append("rect")
      .attr("x", centerX - offsetX)
      .attr("y", centerY - 25)
      .attr("width", bubbleWidth)
      .attr("height", 50)
      .attr("fill", "#ffffff")
      .attr("stroke", "#666")
      .attr("stroke-width", 1.5)
      .attr("rx", 12)
      .attr("ry", 12)
      .attr("opacity", 0)
      .transition()
      .delay(1700 + i * 600)
      .duration(600)
      .attr("opacity", 1);

    group.append("text")
      .attr("x", centerX)
      .attr("y", centerY)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("fill", "#000")
      .style("font-family", "'Comic Sans MS', cursive, sans-serif")
      .attr("opacity", 0)
      .text(d.text)
      .transition()
      .delay(1800 + i * 600)
      .duration(600)
      .attr("opacity", 1);
  });

  // 5. ANIMATE PAGE TITLE (EXTERNAL DOM MANIPULATION)
  setTimeout(() => {
    const title = document.querySelector(".title-drop");
    title.style.opacity = 1;
    title.style.animation = "dropIn 0.8s ease forwards";

    setTimeout(() => {
      title.style.animation = "wiggle 0.6s ease";
    }, 600);
  }, 4500);
}
