export function renderScatter(data, topN, selectedCategory, highlight = false) {
  // Use unified container scroll-chart-area
  const containerNode = document.getElementById("scroll-chart-area");
  const width = containerNode.clientWidth;
  const height = containerNode.clientHeight;
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };

  const container = d3.select("#scroll-chart-area");
  container.selectAll("*").remove();

  const svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  // Add main chart title
  svg.append("text")
    .attr("x", width / 2)                              // Centered position
    .attr("y", margin.top - 6)                         // Slightly above top margin
    .attr("text-anchor", "middle")                     // Horizontal text centering
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("How Price Relates to Shop Performance");       // Main chart title

  // Data filtering
  let filtered = data;
  if (selectedCategory !== "All") {
    filtered = filtered.filter(d => d.Category_cleaned === selectedCategory);
  }

  // Mark TopN shops
  filtered = filtered
    .sort((a, b) => b.Total_GMV_cleaned - a.Total_GMV_cleaned)
    .map((d, i) => ({ ...d, isTop: i < topN }));

  // Calculate median unit price
  const unitPriceMedian = d3.median(filtered, d => +d["Unit_Price"]);

  // Display message if no data available
  if (filtered.length === 0) {
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .text("No data available");
    return;
  }

  // Define scales
  const x = d3.scaleLinear()
    .domain(d3.extent(filtered, d => +d["Unit_Price"]))
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(filtered, d => +d["Total_GMV_cleaned"]))
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Add axes
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3.axisLeft(y)
        .tickFormat(d => d >= 1e6 ? `${d / 1e6}M` : d) // Format as millions if >= 1M
    );

  // Add axis labels
  svg.append("text")
    .attr("x", (margin.left + width - margin.right) / 2)
    .attr("y", height - 15)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .text("Average Unit Price (USD)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + height - margin.bottom) / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .text("GMV (Million USD)");

  // Select tooltip element (specific to each chart)
  const tooltip = d3.select("#tooltip");

  // Draw scatter plot points
  svg.selectAll("circle")
    .data(filtered)
    .join("circle")
    .attr("class", d => {
      const base = `highlightable ${+d["Unit_Price"] < unitPriceMedian ? "scatter-low" : "scatter-high"}`;
      return d.isTop ? `${base} scatter-top` : base;
    })
    .attr("data-highlight", d => d.isTop ? "scatter-top" : null)  // ✅ 关键新增
    .attr("data-name", d => d["Shop Name"]) // Support keyword binding lookup
    .attr("cx", d => x(+d["Unit_Price"]))
    .attr("cy", d => y(+d["Total_GMV_cleaned"]))
    .attr("r", d => highlight && d.isTop ? 10 : 6)  // Larger radius for highlighted/top shops
    .attr("fill", d => d.isTop ? "#FF6B6B" : "#C0C0C0") // Coral red for top, silver gray for others
    .attr("opacity", highlight ? 0.85 : 0.6)  // Adjust opacity based on highlight state
    .on("mouseover", (event, d) => {
      // Show tooltip with shop details
      tooltip
        .style("display", "block")
        .html(`
          <strong>${d["Shop Name"]}</strong><br>
          Unit Price: $${(+d["Unit_Price"]).toFixed(1)}<br>
          GMV: $${(+d["Total_GMV_cleaned"] / 1e6).toFixed(2)}M
        `);
    })
    .on("mousemove", event => {
      // Position tooltip near cursor
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      // Hide tooltip when mouse leaves
      tooltip.style("display", "none");
    });

  // Legend: Top vs Non-top shops
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 120}, ${margin.top})`);

  // Add Top shop legend item
  legend.append("circle")
    .attr("cx", 0).attr("cy", 0).attr("r", 6)
    .attr("fill", "#FF6B6B");
  legend.append("text").attr("x", 10).attr("y", 5).text("Top").style("font-size", "13px");

  // Add Non-top shop legend item
  legend.append("circle")
    .attr("cx", 0).attr("cy", 25).attr("r", 6)
    .attr("fill", "#C0C0C0");
  legend.append("text").attr("x", 10).attr("y", 30).text("Non-top").style("font-size", "13px");
}