import * as d3 from 'd3';
import { ArcData } from "../respondent-counter.component";
import { EnterjsGraph, RespondentCounterDataItem } from "../../../data-access/data.model";

const chartWidth = 350;
const chartHeight = 350;
const outerRadius = chartHeight / 2;
const innerRadius = outerRadius * 0.75;
const unColored = "#ddd";

const currentAngles: Record<string, { startAngle: number; endAngle: number }> = {};

export function createGraph(parentGraph: Element, parentLegend?: Element): EnterjsGraph<RespondentCounterDataItem[]> {
    const containerGraph = d3.select(parentGraph);
    const containerLegend = parentLegend ? d3.select(parentLegend) : undefined;

    const svg = containerGraph.append('svg')
      .attr("viewBox", [0, 0, chartWidth, chartHeight])
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("class", "respondent-counter__graph");

    const transformGroup = svg
      .append("g")
      .attr(
        "transform", "translate(" + chartWidth / 2 + "," + chartHeight / 2 + ")"
      );

    const pieGenerator = d3.pie<RespondentCounterDataItem>()
      .sort(null)
      .value(d => d.amount);
    
    const arcGenerator = d3.arc<ArcData>()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius);

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

      transformGroup
        .selectAll<SVGElement, d3.PieArcDatum<RespondentCounterDataItem>>(".arc")
        .data(pieGenerator(data), d => d.data.computed_response)
        .join(
          enter => {
            const g = enter.append("g")
              .attr("class", "arc")
              .each(d => {
                currentAngles[d.data.computed_response] = {
                  startAngle: d.startAngle,
                  endAngle: d.endAngle
                }
              });
            
            g.append("path")
              .attr("d", arcGenerator)
              .style("fill", ({ data }) =>
                data.colored ? colorGenerator(data.computed_response): unColored);
            
            g.append("text")
              .text(d => d.data.amount > 0 ? d.data.amount : '' )
              .attr("transform", d => "translate(" + arcGenerator.centroid(d) + ")" )
              .style("text-anchor", "middle");
            
            return g;
          },
          update => { 
            update.select("path")
              .transition()
              .duration(750)
              .attrTween("d", d => {
                const currentAngle = currentAngles[d.data.computed_response];
                const interpolate = d3.interpolate(currentAngle, d);
                return t => arcGenerator(interpolate(t)) as string;
              })
              .on("end", d => {
                currentAngles[d.data.computed_response] = d;
              });
            
            update.select("text")
              .text(d => d.data.amount > 0 ? d.data.amount : '' )
              .transition()
              .duration(750)
              .attrTween("transform", d => {
                const currentAngle = currentAngles[d.data.computed_response];
                const interpolate = d3.interpolate(currentAngle, d);
                return t => "translate(" + arcGenerator.centroid(interpolate(t)) + ")"
              });
            
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