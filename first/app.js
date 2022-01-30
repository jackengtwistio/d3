// select the svg container first
const svg = d3.select("svg").attr("width", 600).attr("height", 600);

const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .style("stroke", "black");

const xAxisGroup = graph
  .append("g")
  .attr("transform", `translate(0, ${graphHeight})`);
const yAxisGroup = graph.append("g");
function update(data) {
  const rects = graph.selectAll("rect").data(data).style("stroke", "black");
  rects.exit().remove();
  let x = d3
    .scaleBand()
    .domain(data.map((e) => e.name))
    .range([0, graphWidth])
    .paddingInner(0.2)
    .paddingOuter(0.2);

  let y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.orders)])
    .range([graphHeight, 0]);

  rects
    .attr("width", x.bandwidth)
    .attr("height", (d) => graphHeight - y(d.orders))
    .attr("fill", "orange")
    .attr("x", (d) => x(d.name))
    .attr("y", (d) => y(d.orders));

  rects
    .enter()
    .append("rect")
    .attr("width", x.bandwidth)
    .attr("height", (d) => graphHeight - y(d.orders))
    .attr("fill", "orange")
    .attr("x", (d) => x(d.name))
    .attr("y", (d) => y(d.orders));

  const xAxis = d3.axisBottom(x);
  const yAxis = d3
    .axisLeft(y)
    .ticks(3)
    .tickFormat((d) => d + " orders");

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
}
let data = [];
db.collection("first").onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };
    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "removed":
        data = data.filter((e) => e.id !== doc.id);
        break;
      case "modified":
        const index = data.findIndex((e) => e.id === doc.id);
        data[index] = doc;
        break;
      default:
        break;
    }
  });
  // d3.interval(() => {
  //   data.push({ name: "doc", orders: 100 });
  //   update(data);
  // }, 1000);
  update(data);
});
