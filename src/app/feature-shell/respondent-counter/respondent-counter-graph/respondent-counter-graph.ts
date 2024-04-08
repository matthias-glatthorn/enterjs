import * as d3 from 'd3';
import { ArcData } from "../respondent-counter.component";
import { EnterjsGraph, RespondentCounterDataItem } from "../../../data-access/data.model";

const chartWidth = 300;
const chartHeight = 300;
const outerRadius = chartHeight / 2;
const innerRadius = outerRadius * 0.75;
const unColored = "#ddd";

const previousArcs: Record<string, d3.PieArcDatum<RespondentCounterDataItem>> = {};


export function createGraph(parentGraph: Element, parentLegend?: Element): EnterjsGraph<RespondentCounterDataItem[]> {
    const containerGraph = d3.select(parentGraph);
    const containerLegend = parentLegend ? d3.select(parentLegend) : undefined;

    const svg = containerGraph.append('svg')
      .attr("viewBox", [0, 0, chartWidth, chartHeight]);

    const transformGroup = svg
      .append("g")
      .attr(
        "transform", "translate(" + chartWidth / 2 + "," + chartHeight / 2 + ")"
      );
    
    const arcGenerator = d3.arc<ArcData>()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius);

    const pieGenerator = d3.pie<RespondentCounterDataItem>()
      .sort(null)
      .value(d => d.amount);

    const colorGenerator = d3.scaleOrdinal(d3.schemeCategory10);

    // Path for the background
    transformGroup.append("path")
      .style("fill", unColored)
      .attr("d", arcGenerator({ startAngle: 0, endAngle: 2 * Math.PI }));

    function update(data: RespondentCounterDataItem[]) {
      updateGraph(data);
      updateLegend(data);
    }

    function updateGraph(data: RespondentCounterDataItem[]) {

      transformGroup.selectAll(".arc")
        .data(pieGenerator(data), (d: any) => d.data.computed_response)
        .join(
          enter => {
            const g = enter.append("g")
              .attr("class", "arc");
            
            g.append("path")
              .attr("d", arcGenerator)
              .each(d => {
                previousArcs[d.data.computed_response] = d;
              })
              .style("fill", ({ data }) =>
                data.colored ? colorGenerator(data.computed_response): unColored);
            
            g.append("text")
              .text(d => d.data.amount > 0 ? d.data.amount : '' )
              .attr("transform", d => "translate(" + arcGenerator.centroid(d) + ")" )
              .style("text-anchor", "middle")
              .style("font-size", 12);
            
            return g;
          },
          update => {

            update.select("path")
              .transition()
              .duration(750)
              .attrTween("d", function (d) {
                const previousArc = previousArcs[d.data.computed_response] ?? d;
                const interpolate = d3.interpolate(previousArc, d);
                return t => arcGenerator(interpolate(t)) as string;
              })
              .on("end", d => {
                previousArcs[d.data.computed_response] = d;
              });
            
            update.select("text")
              .text(d => d.data.amount > 0 ? d.data.amount : '' )
              .transition()
              .duration(750)
              .attrTween("transform", function (d) {
                const previousArc = previousArcs[d.data.computed_response] ?? d;
                const interpolate = d3.interpolate(previousArc, d);

                return t => "translate(" + arcGenerator.centroid(interpolate(t)) + ")"
              })
            
            return update;
          }
        );
    }


    function updateLegend(data: RespondentCounterDataItem[]) {
      if (!containerLegend) {
        return;
      }

      const filteredData = data.filter(d => d.amount > 0);
      
      containerLegend.selectAll(".legend")
        .data(filteredData)
        .join(
          enter => {
            const legendItem = enter
              .append("div")
              .attr("class", "legend");

            legendItem
              .append("div")
              .attr("class", "legend__color")
              .style("background-color", data => 
                data.colored ? colorGenerator(data.computed_response) : unColored
              );

            legendItem
              .append("div")
              .attr("class", "legend__text")
              .text(data => data.computed_response);
            

            return legendItem;
          },
          update => update,
          exit => exit.remove()
        );
    }

    return {
        update
    }
}