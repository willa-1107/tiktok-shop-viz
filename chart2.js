// chart2.js - Boxplot visualization component


export function renderBoxplot(data, topN, selectedCategory, highlight = false) {
  // Get container element and its dimensions
  const containerNode = document.getElementById("scroll-chart-area");
  const width = containerNode.clientWidth;
  const height = containerNode.clientHeight;
  
  // Define margins for the chart
  const margin = { top: 40, right: 30, bottom: 60, left: 60 };

  // Select container and clear any existing content
  const container = d3.select("#scroll-chart-area");
  container.selectAll("*").remove();

  // Create SVG element with responsive dimensions
  const svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("class", highlight ? "active-mode" : null);  // Apply highlight class if needed

  // Add chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Boxplot: Product Count Distribution");

  // Filter data by selected category if not "All"
  let filtered = data;
  if (selectedCategory !== "All") {
    filtered = filtered.filter(d => d.Category_cleaned === selectedCategory);
  }

  // Sort shops by Total GMV and mark top N shops
  filtered = filtered
    .sort((a, b) => b.Total_GMV_cleaned - a.Total_GMV_cleaned)
    .map((d, i) => ({ ...d, isTop: i < topN }));

  // Exit if no data available
  if (!filtered || filtered.length === 0) return;

  // Group data into top and non-top categories
  const grouped = d3.group(filtered, d => d.isTop ? "Top" : "Non-top");
  const categories = ["Top", "Non-top"];

  // Create x-scale for categories
  const x = d3.scaleBand()
    .domain(categories)
    .range([margin.left, width - margin.right])
    .padding(0.5);

  // Prepare y-scale based on product counts
  const allValues = filtered.map(d => +d["Selling products"]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(allValues)]).nice()
    .range([height - margin.bottom, margin.top]);

  // Add x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  // Add y-axis with custom class
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickPadding(8));

  // Add x-axis label
  svg.append("text")
    .attr("x", (margin.left + width - margin.right) / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .text("Shop Group");

  // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + height - margin.bottom) / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .text("Selling Products (units)");

  // Create tooltip for hover interactions
  const tooltip = d3.select("body").append("div")
    .attr("id", "custom-tooltip")
    .style("position", "fixed")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "13px")
    .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.2)")
    .style("visibility", "hidden")
    .style("pointer-events", "none")
    .style("z-index", 9999);

  // Process each category (Top and Non-top)
  categories.forEach(cat => {
    const raw = grouped.get(cat) || [];
    // Extract and clean product count values
    const values = raw.map(d => +d["Selling products"]).filter(v => !isNaN(v)).sort(d3.ascending);
    if (values.length === 0) return;

    // Calculate boxplot statistics
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const iqr = q3 - q1;
    // Adjust min/max to exclude outliers beyond 1.5*IQR
    const min = Math.max(d3.min(values), q1 - 1.5 * iqr);
    const max = Math.min(d3.max(values), q3 + 1.5 * iqr);

    // Calculate box position and width
    const cx = x(cat);
    const boxWidth = x.bandwidth();

    // Draw whisker (line from min to max)
    svg.append("line")
      .attr("x1", cx + boxWidth / 2)
      .attr("x2", cx + boxWidth / 2)
      .attr("y1", y(min))
      .attr("y2", y(max))
      .attr("stroke", "black");

    // Draw box (IQR range)
    svg.append("rect")
      .attr("x", cx)
      .attr("y", y(q3))
      .attr("height", y(q1) - y(q3))
      .attr("width", boxWidth)
      .attr("fill", cat === "Top" ? "#1abc9c" : "#ccc")
      // Highlight styling if active
      .attr("stroke", highlight ? "black" : "none")
      .attr("stroke-width", highlight ? 2 : 0)
      .attr("class", `highlightable box-${cat}`)
      .attr("data-highlight", "box-core")
      .append("title")  // Add box statistics to tooltip
      .text(`${cat} Shops\nQ1: ${q1}\nMedian: ${median}\nQ3: ${q3}\nMin: ${min}\nMax: ${max}`);

    // Draw median line
    svg.append("line")
      .attr("x1", cx)
      .attr("x2", cx + boxWidth)
      .attr("y1", y(median))
      .attr("y2", y(median))
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Add jitter to points to reduce overplotting
    const jittered = raw.map(d => ({
      ...d,
      cxOffset: (Math.random() - 0.5) * boxWidth * 0.6
    }));

    // Draw individual data points
    svg.selectAll(".dot-" + cat)
      .data(jittered)
      .enter()
      .append("circle")
      .attr("cx", d => cx + boxWidth / 2 + d.cxOffset)
      .attr("cy", d => y(+d["Selling products"]))
      .attr("r", 3)
      .attr("fill", cat === "Top" ? "#1abc9c" : "#cccccc")
      .attr("stroke", "none")
      // Style outliers differently
      .attr("stroke-width", d => d["Selling products"] > q3 + 1.5 * iqr ? 2 : 0)
      // Adjust opacity for visual hierarchy
      .attr("opacity", highlight ? 0.9 : 0.5)
      .attr("class", d => `highlightable ${cat === "Top" ? "dot-top" : "dot-nontop"}${d["Selling products"] > q3 + 1.5 * iqr ? " outlier" : ""}`)
      .attr("data-highlight", d => d["Selling products"] > q3 + 1.5 * iqr ? "box-outliers" : null)
      // Interactive hover effects
      .on("pointerenter", function(event, d) {
        d3.select(this)
          .attr("r", 6)
          .attr("stroke", "#111")
          .attr("stroke-width", 2);

        tooltip
          .html(`<strong>${d["Shop Name"]}</strong><br/>Products: ${d["Selling products"]}`)
          .style("top", (event.clientY + 12) + "px")
          .style("left", (event.clientX + 12) + "px")
          .style("visibility", "visible")
          .style("opacity", 1);
      })
      .on("pointermove", function(event) {
        tooltip
          .style("top", (event.clientY + 12) + "px")
          .style("left", (event.clientX + 12) + "px");
      })
      .on("pointerleave", function() {
        d3.select(this)
          .attr("r", 3)
          .attr("stroke", "none");

        tooltip.style("visibility", "hidden").style("opacity", 0);
      });
  });

  // Add legend to explain color coding
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 120}, ${margin.top})`);

  // Top shops legend item
  legend.append("circle")
    .attr("cx", 0).attr("cy", 0).attr("r", 6)
    .attr("fill", "#1abc9c");
  legend.append("text").attr("x", 10).attr("y", 5).text("Top").style("font-size", "13px");

  // Non-top shops legend item
  legend.append("circle")
    .attr("cx", 0).attr("cy", 25).attr("r", 6)
    .attr("fill", "#aaa");
  legend.append("text").attr("x", 10).attr("y", 30).text("Non-top").style("font-size", "13px");
}
