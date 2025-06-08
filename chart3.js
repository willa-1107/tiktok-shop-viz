export function renderStackedBar(data, topN, selectedCategory, highlight = false) {
  // Get container dimensions
  const containerNode = document.getElementById("scroll-chart-area");
  const width = containerNode.clientWidth;
  const height = containerNode.clientHeight;
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };

  // Clear previous chart and create new SVG
  const container = d3.select("#scroll-chart-area");
  container.selectAll("*").remove(); // Clear existing content

  const svg = container.append("svg")
    .attr("class", "stacked-bar")  // Add class for CSS styling
    .attr("width", "100%")
    .attr("height", "100%");

  // Add chart title
  svg.append("text")
    .attr("x", width / 2)                              // Center position
    .attr("y", margin.top - 6)                         // Slightly above top margin
    .attr("text-anchor", "middle")                     // Horizontal centering
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Top vs Non-top Shops: Engagement and Product Strategies"); // Main title

  // Define metrics and their colors
  const metrics = ["Related creator", "Related_video_cleaned", "Selling products"];
  const color = d3.scaleOrdinal()
    .domain(metrics)
    .range(["#7aaedc", "#fbbd65", "#a6d4ae"]);  // Colors for creator, video, product

  // Filter data by selected category if not "All"
  let filtered = data;
  if (selectedCategory !== "All") {
    filtered = filtered.filter(d => d.Category_cleaned === selectedCategory);
  }

  // Sort by Total_GMV_cleaned and mark top N shops
  filtered = filtered
    .sort((a, b) => b.Total_GMV_cleaned - a.Total_GMV_cleaned)
    .map((d, i) => ({ ...d, isTop: i < topN }));

  // Group data into Top and Non-top categories with average metrics
  const grouped = d3.rollups(
    filtered,
    v => ({
      "Related creator": d3.mean(v, d => +d["Related creator"]),
      "Related_video_cleaned": d3.mean(v, d => +d["Related_video_cleaned"]),
      "Selling products": d3.mean(v, d => +d["Selling products"])
    }),
    d => d.isTop ? "Top" : "Non-top"
  );

  // Prepare stacked data format
  const groups = ["Top", "Non-top"];
  const stackedData = groups.map(g => {
    const row = grouped.find(d => d[0] === g)?.[1] || {};
    return { group: g, ...row };
  });

  // Create x-axis scale 
  const x = d3.scaleBand()
    .domain(groups)
    .range([margin.left, width - margin.right])
    .padding(0.3);

  // Create y-axis scale 
  const y = d3.scaleLinear()
    .domain([
      0,
      d3.max(stackedData, d => metrics.reduce((sum, m) => sum + (d[m] || 0), 0))
    ])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Stack generator for the data
  const stackGen = d3.stack().keys(metrics);
  const series = stackGen(stackedData);

  // Add x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  // Add y-axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Add axis labels
  svg.append("text")
    .attr("x", (margin.left + width - margin.right) / 2)
    .attr("y", height - 15)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .text("Shop Group");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + height - margin.bottom) / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .text("Average Count (per shop)");

  // Tooltip setup
  const tooltip = d3.select("#tooltip");

  // Draw stacked bars
  svg.selectAll("g.layer")
    .data(series)
    .join("g")
    .attr("class", "layer")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("class", (d, i, nodes) => {
      const key = d3.select(nodes[i].parentNode).datum().key;
      const nameMap = {
        "Related creator": "stack-creator",
        "Related_video_cleaned": "stack-video",
        "Selling products": "stack-product"
      };
      return `highlightable ${nameMap[key] || ""}`;
    })
    .attr("data-highlight", (d, i, nodes) => {
      const key = d3.select(nodes[i].parentNode).datum().key;
      const nameMap = {
        "Related creator": "stack-creator",
        "Related_video_cleaned": "stack-video",
        "Selling products": "stack-product"
      };
      return nameMap[key] || null;
    })
    .attr("x", d => x(d.data.group))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("stroke", highlight ? "#333" : "none")
    .attr("stroke-width", highlight ? 1 : 0)
    .on("mouseover", (event, d) => {
      // Get the key of the stacked group 
      const layerDatum = d3.select(event.currentTarget.parentNode).datum();
      const rawKey = layerDatum?.key || "Unknown";

      // Map metric names to display names
      const displayMap = {
        "Related creator": "Related Creators",
        "Related_video_cleaned": "Related Videos",
        "Selling products": "Selling Products"
      };

      // Get group label (Top/Non-top) and value
      const group = d?.data?.group || "Unknown";
      const label = displayMap[rawKey] || rawKey;
      const value = (d && d[1] != null && d[0] != null) ? d[1] - d[0] : 0;

      // Show tooltip
      tooltip
        .style("display", "block")
        .html(`
          <strong>${group} Shops</strong><br>
          ${label}: ${value.toFixed(0)}
        `);
    })
    .on("mousemove", event => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  // Add legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 150}, ${margin.top - 10})`);

  metrics.forEach((m, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(m));

    legend.append("text")
      .attr("x", 18)
      .attr("y", i * 20 + 10)
      .text(m)
      .attr("font-size", "12px");
  });
}