// 1. Initialize global tooltip if it doesn't exist
if (d3.select("#tooltip").empty()) {
  d3.select("body")
    .append("div")
    .attr("id", "tooltip");  // Create tooltip element in body if missing
}

// Main controller for the TikTok Shop Scrollytelling page.
// main.js

import { showIntro } from './intro.js';
import { initQuadrantChart } from './chart1.js';
import { renderBoxplot } from './chart2.js';
import { renderStackedBar } from './chart3.js';
import { renderScatter } from './chart4.js';

// Global variables
let sharedData = [];  // Stores the loaded shop data
let currentTopN = 10;  // Current number of top shops to highlight
let currentCategory = 'All';  // Currently selected category filter

const scroller = scrollama();  // Scrollama instance for scroll-triggered animations
let currentChart = null;  // Tracks which chart is currently active
let enteredCharts = new Set();  // Tracks which charts have been entered during scroll

// 2. Initialize intro animation
const svg = d3.select("#intro-wrapper")
  .append("svg")
  .attr("id", "intro-svg")
  .attr("viewBox", "0 0 1200 800")
  .attr("preserveAspectRatio", "xMidYMid meet")  
  .attr("width", "100%")
  .attr("height", "100%");

showIntro(svg);  // Show initial introduction animation

// 3. Load data and initialize charts
Promise.all([
  d3.json("data/non_anomalous_tiktok_shops_cleaned.json"),  // Load shop data
  d3.json("data/category_avg_gmv_video.json")  // Load category average data
]).then(([shopData, categoryData]) => {
  sharedData = shopData;  // Store loaded shop data
  initCategoryOptions(shopData);  // Initialize category dropdowns
  initQuadrantChart(categoryData);  // Initialize quadrant chart
  // scrollToTopAndResetFlow();  // Disabled auto-scroll on page load
});

// 4. Populate category dropdowns with available categories
function initCategoryOptions(data) {
  // Get unique categories from data
  const categories = [...new Set(data.map(d => d.Category_cleaned))];
  // Get both dropdown elements (main and scroll-triggered)
  const dropdowns = [document.getElementById("categorySelector"), document.getElementById("scrollCategorySelector")];

  // Populate each dropdown
  dropdowns.forEach(select => {
    // Add "All" option
    select.innerHTML = `<option value=\"All\">All</option>`;
    // Add each category as an option
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.text = cat;
      select.appendChild(option);
    });
  });
}

// 5. Initialize scrollama with scroll-triggered steps
function initScrollama() {
  scroller
    .setup({
      step: ".long-step",  // CSS selector for scroll steps
      offset: 0.7,  // Scroll position offset threshold (70% of viewport)
      debug: false  // Disable debug mode
    })
    // Event handler for when a step enters the viewport
    .onStepEnter(response => {
      const el = response.element;  // Current step element
      const chartName = el.dataset.chart;  // Chart name from data attribute
      const highlightId = el.getAttribute("data-highlight");  // Highlight ID from attribute

      // Switch to the current chart if it changed
      if (chartName !== currentChart) {
        currentChart = chartName;  // Update current chart tracker

        // Render appropriate chart based on chart name
        if (chartName === "chart2") {
          renderBoxplot(sharedData, currentTopN, currentCategory, false);
        } else if (chartName === "chart3") {
          renderStackedBar(sharedData, currentTopN, currentCategory, false);
        } else if (chartName === "chart4") {
          renderScatter(sharedData, currentTopN, currentCategory, false);
        }
      }

      // Set current step as active, deactivate others
      d3.selectAll(".long-step").classed("active", false);
      d3.select(el).classed("active", true);

      // Boxplot highlight control
      if (chartName === "chart2") {
        renderBoxplot(sharedData, currentTopN, currentCategory, false);  // Re-render for consistent state
        d3.selectAll("[data-highlight]").classed("highlighted", false);  // Clear all highlights

        // Apply highlight if specific ID is provided
        if (highlightId && highlightId !== "none") {
          d3.selectAll(`[data-highlight='${highlightId}']`).classed("highlighted", true);
        }
      }

      // Chart 3 highlight control (stacked bar)
      if (chartName === "chart3") {
        d3.selectAll(".stacked-bar rect").classed("highlighted", false);  // Clear previous highlights
        // Apply highlight for specific bar segments
        if (["stack-creator", "stack-video", "stack-product"].includes(highlightId)) {
          d3.selectAll(`.stacked-bar rect.${highlightId}`).classed("highlighted", true);
          d3.select(".stacked-bar").classed("active-mode", true);  // Activate chart mode
        } else {
          d3.select(".stacked-bar").classed("active-mode", false);  // Deactivate chart mode
        }
      }

      // Chart 4 highlight control (scatter plot)
      if (chartName === "chart4") {
        // Default: Show all points with normal opacity
        d3.selectAll(".highlightable").attr("opacity", 0.7);

        // If highlighting specific group, dim others and highlight target
        if (["scatter-top", "scatter-low", "scatter-high"].includes(highlightId)) {
          d3.selectAll(".highlightable").attr("opacity", 0.1);  // Dim all points
          d3.selectAll(`.${highlightId}`).attr("opacity", 0.9);  // Highlight target group
        }
      }
    })
    // Event handler for when a step exits the viewport
    .onStepExit(response => {
      const el = response.element;
      if (!el) return;

      const chartName = el.dataset.chart;

      // When leaving Chart 4, reset all points to default opacity
      if (chartName === "chart4") {
        d3.selectAll(".highlightable").attr("opacity", 0.7);
      }
    });
}

// 6. Initialize scrollama
initScrollama();

// 7. Event listeners for selector changes
["scrollTopSelector", "scrollCategorySelector"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", (e) => {
    // Update global state based on which selector changed
    if (id.includes("Top")) {
      currentTopN = +e.target.value;  // Update top N value
    } else {
      currentCategory = e.target.value;  // Update category filter
    }

    // Re-render Chart3 with new filters (no highlight)
    renderStackedBar(sharedData, currentTopN, currentCategory, false);
    d3.select(".stacked-bar").classed("active-mode", false);  // Reset chart mode

    // Scroll to Chart3's first step and reset flow
    scrollToTopAndResetFlow();
  });
});

// 8. Utility: Scroll to first boxplot step and reset scroll sequence
function scrollToTopAndResetFlow() {
  const firstStep = document.getElementById("chart2-anchor-step");
  if (!firstStep) return;

  // Calculate scroll position to make first step appear at offset position
  const offset = 0.65;  // scrollama's offset percentage
  const viewportHeight = window.innerHeight;
  const scrollTarget = firstStep.getBoundingClientRect().top + window.scrollY;
  const adjustedScroll = scrollTarget - viewportHeight * offset;

  // Scroll to calculated position
  window.scrollTo({ top: adjustedScroll, behavior: "auto" });

  // Reset global state and chart initial states
  enteredCharts.clear();  // Clear entered charts tracker
  currentChart = null;  // Reset current chart tracker
  d3.selectAll(".long-step").classed("active", false);  // Deactivate all steps
  d3.selectAll(".highlightable").attr("opacity", 1);  // Reset all points opacity
  d3.selectAll("[data-highlight]").classed("highlighted", false);  // Clear all highlights

  renderBoxplot(sharedData, currentTopN, currentCategory, false);  // Re-render initial chart

  // Force scrollama to re-evaluate current step position
  setTimeout(() => {
    scroller.resize();  // Refresh scrollama's internal calculations
  }, 300);
}


// 9. Control filter bar visibility when entering summary section
const filterBar = document.getElementById("filter-bar");
const summarySection = document.getElementById("summary-section");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      filterBar.style.display = "none";
    } else {
      filterBar.style.display = "flex";
    }
  });
}, {
  root: null,
  threshold: 0.3
});

observer.observe(summarySection);
