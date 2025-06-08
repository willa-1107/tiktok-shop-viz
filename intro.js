// intro.js
// This function draws the intro scene with an avatar and five speech bubbles,
// creating an interactive introduction sequence with animated transitions.

export function showIntro(svg) {
  // 1. ADD AVATAR IMAGE
  // Append the main avatar image to the SVG canvas with fade-in animation
  svg.append("image")
    .attr("href", "assets/avatar.png")  // Image source path
    .attr("x", 480)                    // X-coordinate position
    .attr("y", 20)                     // Y-coordinate position
    .attr("width", 580)                // Display width
    .attr("height", 750)               // Display height
    .attr("opacity", 0)                // Start with full transparency
    .transition()                      // Begin animation
    .duration(1000)                    // Animation duration (1 second)
    .attr("opacity", 1);               // Fade in to full opacity

  // 2. DRAW MAIN SPEECH BUBBLE (ELLIPSE SHAPE)
  // Create the large main speech bubble using an ellipse element
  svg.append("ellipse")
    .attr("cx", 1320)                  // Center X-coordinate
    .attr("cy", 140)                   // Center Y-coordinate
    .attr("rx", 230)                   // Horizontal radius
    .attr("ry", 90)                    // Vertical radius
    .attr("fill", "#fff8dc")           // Fill color (cornsilk)
    .attr("stroke", "#e0d7b5")         // Border color
    .attr("stroke-width", 1)           // Border thickness
    .attr("opacity", 0)                // Start invisible
    .transition()
    .duration(1500)                    // 1.5 second fade-in
    .attr("opacity", 1);

  // 3. ADD MAIN QUESTION TEXT
  // Place text inside the main speech bubble with centered alignment
  svg.append("foreignObject")          // Allows HTML content in SVG
    .attr("x", 1120)                   // Starting X position
    .attr("y", 90)                     // Starting Y position
    .attr("width", 420)                // Container width
    .attr("height", 120)               // Container height
    .append("xhtml:div")               // Create HTML div element
    // Text styling properties
    .style("font-size", "24px")
    .style("font-family", "'Comic Sans MS', cursive, sans-serif")
    .style("color", "#5F9EA0")          // Cadet Blue color
    .style("line-height", "1.4")
    .style("word-wrap", "break-word")
    .style("text-align", "center")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("height", "100%")
    .style("opacity", 0)               // Start invisible
    .text("I want to open a TikTok store, what factors should I consider?") // The question text
    .transition()
    .delay(1000)                       // Wait 1 second after main bubble appears
    .duration(1000)                    // 1 second fade-in
    .style("opacity", 1);

  // 4. DRAW SMALLER QUESTION BUBBLES
  // Define positions and text for four smaller bubbles
  const bubbles = [
    { text: "Category?", x: 425, y: 220 },          // Top-left bubble
    { text: "Product?", x: 1025, y: 220 },         // Top-right bubble
    { text: "Price?", x: 425, y: 420 },            // Bottom-left bubble
    { text: "Video Promotion?", x: 1025, y: 420 }  // Bottom-right bubble (wider)
  ];

  // Process each bubble definition
  bubbles.forEach((d, i) => {
    // Determine width based on text (wider for "Video Promotion?")
    const bubbleWidth = d.text === "Video Promotion?" ? 200 : 160;
    const bubbleOffsetX = bubbleWidth / 2;  // Calculate horizontal center offset

    // DRAW BUBBLE BACKGROUND (RECTANGLE WITH ROUNDED CORNERS)
    svg.append("rect")
      .attr("x", d.x - bubbleOffsetX)    // Position based on center X
      .attr("y", d.y - 25)              // Position based on center Y
      .attr("width", bubbleWidth)        // Bubble width
      .attr("height", 50)                // Bubble height
      .attr("fill", "#ffffff")           // White background
      .attr("stroke", "#666")            // Gray border
      .attr("stroke-width", 1.5)         // Border thickness
      .attr("rx", 12)                    // Horizontal corner radius
      .attr("ry", 12)                    // Vertical corner radius
      .attr("opacity", 0)                // Start invisible
      .transition()
      .delay(1700 + i * 600)            // Staggered delays (1.7s + 0.6s per bubble)
      .duration(600)                    // 0.6s fade-in
      .attr("opacity", 1);

    // ADD BUBBLE TEXT
    svg.append("text")
      .attr("x", d.x)                   // Center X position
      .attr("y", d.y)                   // Center Y position
      .attr("dy", ".35em")              // Fine vertical alignment
      .attr("text-anchor", "middle")    // Center text horizontally
      .attr("font-size", "18px")        // Text size
      .attr("font-weight", "bold")      // Bold text
      .attr("fill", "#000")             // Black text color
      .style("font-family", "'Comic Sans MS', cursive, sans-serif") // Font
      .attr("opacity", 0)               // Start invisible
      .text(d.text)                     // Set bubble text
      .transition()
      .delay(1800 + i * 600)            // Staggered delays (1.8s + 0.6s per bubble)
      .duration(600)                    // 0.6s fade-in
      .attr("opacity", 1);
  });

  // 5. ANIMATE PAGE TITLE (EXTERNAL DOM MANIPULATION)
  // After all SVG elements are drawn, animate the page title
  setTimeout(() => {
    const title = document.querySelector(".title-drop");  // Select title element
    title.style.opacity = 1;                             // Make visible
    title.style.animation = "dropIn 0.8s ease forwards";  // Drop-in animation

    // After drop animation completes, add wiggle effect
    setTimeout(() => {
      title.style.animation = "wiggle 0.6s ease";  // Wiggle animation
    }, 600);  // 0.6s after drop animation starts
  }, 4500);  // 4.5 seconds after initial function call (after all SVG animations)
}