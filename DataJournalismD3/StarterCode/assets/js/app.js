//SVG attributes
var width = parseInt(d3.select('#scatter')
    .style("width"));

var height = width * 2/3;
var margin = 10;
var labelArea = 110;
var padding = 45;

//SVG object 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

//Axes labels
//Adding first "g" - tag for x axis text (css class)
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

//Make transformation to adjust for xText
var bottomTextX =  (width - labelArea)/2 + labelArea;
var bottomTextY = height - margin - padding;
xText.attr("transform",`translate(
    ${bottomTextX}, 
    ${bottomTextY})`
    );

//x-axis (bottom)
//Building xText details (css class)
xText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

xText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Age (Median)");

xText.append("text")
    .attr("y", 19)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Household Income (Median)");

//y-axis (left)
//Adding second "g" tag for yText (css class)
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

// Transform to adjust for yText
var leftTextX =  margin + padding;
var leftTextY = (height + labelArea) / 2 - labelArea;
yText.attr("transform",`translate(
    ${leftTextX}, 
     ${leftTextY}
    )rotate(-90)`
    );

// Build yText details (css class)
yText .append("text")
    .attr("y", -22)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

yText .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

yText .append("text")
    .attr("y", 22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");
    
// Visualizing data 
// Defining a dynamic circle radius
var cirRadius;
function adjustRadius() {
  if (width <= 530) {
    cirRadius = 7;}
  else { 
    cirRadius = 10;}
}
adjustRadius();

//Read in data as expected and then use d3.js method
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

function visualize (csvData) {
   var xMin;
   var xMax;
   var yMin;
   var yMax;

   //Current X & Y default selections
   var currentX = "poverty";
   var currentY = "obesity";

   //Tool tip info box (state, X stats and  Y stats)
   var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
            //Build text box
            var stateLine = `<div>${d.state}</div>`;
            var yLine = `<div>${currentY}: ${d[currentY]}%</div>`;
            if (currentX === "poverty") {
                xLine = `<div>${currentX}: ${d[currentX]}%</div>`}          
            else {
                xLine = `<div>${currentX}: ${parseFloat(d[currentX]).toLocaleString("en")}</div>`;}             
            return stateLine + xLine + yLine  
        });

    //Add toolTip to svg
    svg.call(toolTip);

    //Update upon axis option clicked
    function  labelUpdate(axis, clickText) {
        //Switch active to inactive
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
    
        //switching the text just clicked to active
        clickText.classed("inactive", false).classed("active", true);
        }

    //Finding the data max & min values for scaling
    function xMinMax() {
      xMin = d3.min(csvData, function(d) {
        return parseFloat(d[currentX]) * 0.85;
      });
      xMax = d3.max(csvData, function(d) {
        return parseFloat(d[currentX]) * 1.15;
      });     
    }

    function yMinMax() {
      yMin = d3.min(csvData, function(d) {
        return parseFloat(d[currentY]) * 0.85;
      });
      yMax = d3.max(csvData, function(d) {
        return parseFloat(d[currentY]) * 1.15;
      }); 
    }

    //Scatter plot X & Y axis computation
    xMinMax();
    yMinMax();

    var xScale = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])

    //Create scaled X and Y axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    //Calculate X and Y tick counts
    function tickCount() {
      if (width <= 530) {
         xAxis.ticks(5);
         yAxis.ticks(5);
      }
      else {
          xAxis.ticks(10);
          yAxis.ticks(10);
      }        
    }
    tickCount();

    //append axis to the svg as group elements
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labelArea})`
        );

    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(
            ${margin + labelArea}, 
            0 )`
        );

    //Append the circles for each row of data
    var allCircles = svg.selectAll("g allCircles").data(csvData).enter();

    allCircles.append("circle")
        .attr("cx", function(d) {
            //xScale figures the pixels
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", cirRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d) {
            //Show tooltip when mouse is on circle
            toolTip.show(d, this);
            //Highlighting circle border
            d3.select(this).style("stroke", "#dbc5c5");
        })
        .on("mouseout", function (d) {
            //Removing the tooltip
            toolTip.hide(d);
            //Removing the highlight
            d3.select(this).style("stroke", "#e3e3e3")
        });

        //Applying state text on circles (dx & dy are specified locations)
        allCircles
            .append("text")
            .attr("font-size", cirRadius)
            .attr("class", "stateText")
            .attr("dx", function(d) {
               return xScale(d[currentX]);
            })
            .attr("dy", function(d) {
              //Pushing text to center by a 1/3
              return yScale(d[currentY]) + cirRadius /1;
            })
            .text(function(d) {
                return d.abbr;
              })

            .on("mouseover", function(d) {
                toolTip.show(d);
                d3.select("." + d.abbr).style("stroke", "#323232");
            })

            .on("mouseout", function(d) {
                toolTip.hide(d);
                d3.select("." + d.abbr).style("stroke", "#e3e3e3");
            });

          //Dynamic graph on click
          d3.selectAll(".aText").on("click", function() {
              var self = d3.select(this)

              //Select inactive
              if (self.classed("inactive")) {
                //Obtaining name and axis saved in the label
                var axis = self.attr("data-axis")
                var name = self.attr("data-name")

                if (axis === "x") {
                  currentX = name;

                  //Updating min and max of domain (x)
                  xMinMax();
                  xScale.domain([xMin, xMax]);

                  svg.select(".xAxis")
                        .transition().duration(800)
                        .call(xAxis);
                  
                  //Updating location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function(d) {
                            return xScale(d[currentX])                
                        });
                  });   

                  d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dx", function(d) {
                            return xScale(d[currentX])                          
                        });
                  });          
                  //Update
                  labelUpdate(axis, self);
                }

                 //Updating for Y axis selection 
                else {
                  currentY = name;

                  //Updating min and max of range (y)
                  yMinMax();
                  yScale.domain([yMin, yMax]);

                  svg.select(".yAxis")
                        .transition().duration(800)
                        .call(yAxis);

                  //Updating location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cy", function(d) {
                            return yScale(d[currentY])                
                        });                       
                  });   

                  d3.selectAll(".stateText").each(function() {
                      d3.select(this)
                        .transition().duration(800)
                        .attr("dy", function(d) {
                           //Centering text
                            return yScale(d[currentY]) + cirRadius/1;                          
                        });
                  });

                  //Change the classes of to active and the clicked label
                  labelUpdate(axis, self);
                }
              }
          });
}

















