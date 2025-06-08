// chart1.js

export function initQuadrantChart(data) {
  // Get container dimensions and set margins
  const container = document.getElementById("chart1-area");
  const padding = 60; // Chart margins
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Initialize SVG (responsive to container size)
  const svg = d3.select("#chart1-area")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  // Create scales (x: GMV, y: Video count)
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.AVG_GMV_USD)).nice()
    .range([padding, width - padding]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.AVG_Related_video)).nice()
    .range([height - padding, padding]);

  // Calculate means as default threshold positions
  const xMean = d3.mean(data, d => d.AVG_GMV_USD);
  const yMean = d3.mean(data, d => d.AVG_Related_video);

  // Set slider defaults and maximum values
  d3.select("#xThreshold").attr("max", x.domain()[1]).attr("value", xMean);
  d3.select("#yThreshold").attr("max", y.domain()[1]).attr("value", yMean);

  function draw(xThres, yThres) {
    // Clear previous chart elements
    svg.selectAll("*").remove();

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - padding})`)
      .classed("axis", true)
      .call(d3.axisBottom(x).tickFormat(d => (d / 1e6).toFixed(0) + 'M'));

    // X-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width - padding)
      .attr("y", height - 10)
      .text("Average GMV (USD)");

    // Y-axis
    svg.append("g")
      .attr("transform", `translate(${padding},0)`)
      .call(d3.axisLeft(y));

    // Y-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", padding - 45)               // Close to axis
      .attr("y", padding - 7)               // Slightly above
      .attr("transform", `rotate(-90, ${padding - 45}, ${padding - 7})`)
      .text("Average number of videos (count)");

    // Draw quadrant divider lines
    // Vertical divider
    svg.append("line")
      .attr("x1", x(xThres)).attr("x2", x(xThres))
      .attr("y1", padding).attr("y2", height - padding)
      .attr("stroke", "gray").attr("stroke-dasharray", "4");

    // X threshold label
    svg.append("text")
      .attr("x", x(xThres) + 5)
      .attr("y", padding + 15)
      .text("$" + (xThres / 1e6).toFixed(0) + "M");

    // Horizontal divider
    svg.append("line")
      .attr("y1", y(yThres)).attr("y2", y(yThres))
      .attr("x1", padding).attr("x2", width - padding)
      .attr("stroke", "gray").attr("stroke-dasharray", "4");

    // Y threshold label
    svg.append("text")
      .attr("x", width - padding - 40)
      .attr("y", y(yThres) - 6)
      .attr("text-anchor", "end")
      .text(yThres.toFixed(0));

    // Quadrant labels
    const quadrantLabels = [
      {
        text: "Cash Cow",
        x: (x(x.domain()[1]) + x(xThres)) / 2,
        y: (y(y.domain()[0]) + y(yThres)) / 2
      },
      {
        text: "Focused",
        x: (x(x.domain()[1]) + x(xThres)) / 2,
        y: (y(yThres) + y(y.domain()[1])) / 2
      },
      {
        text: "Weak",
        x: (x(x.domain()[0]) + x(xThres)) / 2,
        y: (y(yThres) + y(y.domain()[1])) / 2
      },
      {
        text: "Potential",
        x: (x(x.domain()[0]) + x(xThres)) / 2,
        y: (y(y.domain()[0]) + y(yThres)) / 2
      }
    ];

    // Add quadrant labels to chart
    svg.selectAll(".quadrant-label")
      .data(quadrantLabels)
      .enter()
      .append("text")
      .attr("class", "quadrant-label")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("fill", "#34495e")
      .text(d => d.text);

    // Color assignment function based on quadrant
    const getColor = d => {
      if (d.AVG_GMV_USD >= xThres && d.AVG_Related_video >= yThres) return "#1f77b4";  // Cash Cow
      if (d.AVG_GMV_USD >= xThres && d.AVG_Related_video < yThres) return "#2ca02c";   // Focused
      if (d.AVG_GMV_USD < xThres && d.AVG_Related_video < yThres) return "#d62728";    // Weak
      return "#ff7f0e"; // Potential
    };

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "6px 10px")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Draw data points with animation
    svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => x(d.AVG_GMV_USD))
      .attr("cy", d => y(d.AVG_Related_video))
      .attr("r", 0)
      .attr("fill", getColor)
      .attr("opacity", 0.7)
      .transition()
      .duration(800)
      .ease(d3.easeBackOut)
      .attr("r", 10);

    // Add tooltip interaction
    svg.selectAll("circle")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<b>${d.Category_cleaned}</b><br>GMV: $${(d.AVG_GMV_USD / 1e6).toFixed(0)}M<br>videos count: ${Math.round(d.AVG_Related_video)}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(300).style("opacity", 0);
      });
  }

  // Add slider event listeners for dynamic updates
  const xInput = document.getElementById("xThreshold");
  const yInput = document.getElementById("yThreshold");
  xInput.addEventListener("input", () => draw(+xInput.value, +yInput.value));
  yInput.addEventListener("input", () => draw(+xInput.value, +yInput.value));

  // Initial chart render
  draw(xMean, yMean);
}