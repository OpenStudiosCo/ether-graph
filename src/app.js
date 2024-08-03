// NPM
import * as d3 from "d3";
import { voronoiTreemap } from "d3-voronoi-treemap";

// App modules
import { processCSV } from './app/data';
import './app/helpers';
import { updateGraphs } from './app/graph';

// Functions used by UI and the app.
window.updateGraphs = updateGraphs;

// Variables used across the graphing app.
window.dataTable = {};
window.weekNumbers = [];

// Grab the data file
d3.csv( "sample-gpt-v2.csv" ).then( function(rootData) {
    processCSV( rootData );
} );
