import * as d3 from "d3";
import { voronoiTreemap } from "d3-voronoi-treemap";

let walletId = '0xaaaaaa1111111111111111111111111111111111';
let accounts = []

// Graphing variables
var _2PI = 2 * Math.PI;
const _voronoiTreemap = voronoiTreemap();
let hierarchy, circlingPolygon;
const fontScale = d3.scaleLinear();
let svg, drawingArea, treemapContainer;
var svgWidth = 960,
    svgHeight = 500,
    margin = { top: 10, right: 10, bottom: 10, left: 10 },
    height = svgHeight - margin.top - margin.bottom,
    width = svgWidth - margin.left - margin.right,
    halfWidth = width / 2,
    halfHeight = height / 2,
    quarterWidth = width / 4,
    quarterHeight = height / 4,
    titleY = 20,
    legendsMinY = height - 20,
    treemapRadius = 205,
    treemapCenter = [ halfWidth, halfHeight + 5 ];

export function updateGraphs() {
    clearGraphs();

    const timeline = document.querySelector( '#timeline' );
    const timelineLabel = document.querySelector( 'h2[for="timeline"]' );
    timelineLabel.innerHTML = 'Week ' + timeline.value;

    // initData();
    circlingPolygon = computeCirclingPolygon( 205 );
    fontScale.domain( [ 6, 18 ] ).range( [ 6, 18 ] ).clamp( true );

    // initLayout( );
    svg = d3.select( "svg#graph" )
        .attr( "width", svgWidth )
        .attr( "height", svgHeight );

    drawingArea = svg.append( "g" )
        .classed( "drawingArea", true )
        .attr( "transform", "translate(" + [ margin.left, margin.top ] + ")" );

    treemapContainer = drawingArea.append( "g" )
        .classed( "treemap-container", true )
        .attr( "transform", "translate(" + treemapCenter + ")" );

    treemapContainer.append( "path" )
        .classed( "world", true )
        .attr( "transform", "translate(" + [ -treemapRadius, -treemapRadius ] + ")" )
        .attr( "d", "M" + circlingPolygon.join( "," ) + "Z" );

    let tempRoot = {
        name: walletId,
        children: []
    };
    let transactions = dataTable[ timeline.value ];
    let currencies = [];

    var colours = [ '#48cbd9', '#79e7e7', '#605a83', '#bd948c', '#7e779e' ];

    var displayedCurrencies = {};

    var transactionTable = document.querySelector( 'table#transactions tbody' );
    transactionTable.innerHTML = '';
    transactions.forEach( ( transaction ) => {
        if ( !( transaction.currency in displayedCurrencies ) ) {
            let currency = {};
            currency.code = transaction.currency;
            currency.name = transaction.currency;
            currency.color = colours[ Math.floor( Math.random() * colours.length ) ];
            currency.balance = 0.0;
            currency.children = [];

            tempRoot.children.push(currency);
            displayedCurrencies[ transaction.currency ] = currency;
        }

        displayedCurrencies[ transaction.currency ].balance += parseFloat( transaction.amount );
        displayedCurrencies[ transaction.currency ].children.push( transaction );

        let tableRow = document.createElement('tr');
        let fieldId = document.createElement('td');
        fieldId.innerHTML = transaction.id;
        tableRow.append( fieldId );

        let fieldType = document.createElement('td');
        fieldType.innerHTML = transaction.type;
        tableRow.append( fieldType );

        let fieldTimestamp = document.createElement('td');
        fieldTimestamp.innerHTML = transaction.timestamp;
        tableRow.append( fieldTimestamp );
        
        let fieldCreated = document.createElement('td');
        fieldCreated.innerHTML = transaction.created;
        tableRow.append( fieldCreated );

        let fieldFrom = document.createElement('td');
        fieldFrom.innerHTML = transaction.from;
        tableRow.append( fieldFrom );

        let fieldTo = document.createElement('td');
        fieldTo.innerHTML = transaction.to;
        tableRow.append( fieldTo );

        let fieldAmount = document.createElement('td');
        fieldAmount.innerHTML = transaction.amount;
        tableRow.append( fieldAmount );

        let fieldCurrency = document.createElement('td');
        fieldCurrency.innerHTML = transaction.currency;
        tableRow.append( fieldCurrency );

        let fieldPrice = document.createElement('td');
        fieldPrice.innerHTML = transaction.price;
        tableRow.append( fieldPrice );

        transactionTable.append(tableRow);

    } );

    for ( currency in displayedCurrencies ) {
        currencies.push( displayedCurrencies[currency] );
    }

    // drawLegends
    var legendHeight = 13,
        interLegend = 4,
        colorWidth = legendHeight * 6;

    var legendContainer = drawingArea.append( "g" )
        .classed( "legend", true )
        .attr( "transform", "translate(" + [ 0, legendsMinY ] + ")" );

    var legends = legendContainer.selectAll( ".legend" )
        .data( currencies )
        .enter();

    var legend = legends.append( "g" )
        .classed( "legend", true )
        .attr( "transform", function ( d, i ) {
            return "translate(" + [ 0, -i * ( legendHeight + interLegend ) ] + ")";
        } )

    legend.append( "rect" )
        .classed( "legend-color", true )
        .attr( "y", -legendHeight )
        .attr( "width", colorWidth )
        .attr( "height", legendHeight )
        .style( "fill", function ( d ) { return d.color; } );
    legend.append( "text" )
        .classed( "tiny", true )
        .attr( "transform", "translate(" + [ colorWidth + 5, -2 ] + ")" )
        .text( function ( d ) { return d.name; } );

    legendContainer.append( "text" )
        .attr( "transform", "translate(" + [ 0, -currencies.length * ( legendHeight + interLegend ) - 5 ] + ")" )
        .text( "Currencies" );

    hierarchy = d3.hierarchy( tempRoot ).sum( function ( d ) { return d.amount; } );

    _voronoiTreemap
        .clip( circlingPolygon )
        ( hierarchy );

    drawTreemap( hierarchy, tempRoot );
}

function clearGraphs() {
    d3.selectAll("svg#graph > *").remove();
}

function drawTreemap( hierarchy, tempRoot ) {
    var leaves = hierarchy.leaves();
    let currencies = tempRoot.children.reverse()

    var cells = treemapContainer.append( "g" )
        .classed( 'cells', true )
        .attr( "transform", "translate(" + [ -treemapRadius, -treemapRadius ] + ")" )
        .selectAll( ".cell" )
        .data( leaves )
        .enter()
        .append( "path" )
        .classed( "cell", true )
        .attr( "d", function ( d ) { return "M" + d.polygon.join( "," ) + "z"; } )
        .style( "fill", function ( d ) {
            return d.parent.data.color;
        } );

    var labels = treemapContainer.append( "g" )
        .classed( 'labels', true )
        .attr( "transform", "translate(" + [ -treemapRadius, -treemapRadius ] + ")" )
        .selectAll( ".label" )
        .data( leaves )
        .enter()
        .append( "g" )
        .classed( "label", true )
        .attr( "transform", function ( d ) {
            return "translate(" + [ d.polygon.site.x, d.polygon.site.y ] + ")";
        } )
        .style( "font-size", function ( d ) {
            return fontScale( d.parent.data.balance );
        } );


    labels.append( "text" )
        .classed( "value", true )
        .text( function ( d ) { return d.parent.data.balance; } );
    labels.append( "text" )
        .classed( "name", true )
        .html( function ( d ) {
            return ( d.parent.data.balance < 1 ) ? d.parent.data.code : d.parent.data.name;
        } );

    var hoverers = treemapContainer.append( "g" )
        .classed( 'hoverers', true )
        .attr( "transform", "translate(" + [ -treemapRadius, -treemapRadius ] + ")" )
        .selectAll( ".hoverer" )
        .data( leaves )
        .enter()
        .append( "path" )
        .classed( "hoverer", true )
        .attr( "d", function ( d ) { return "M" + d.polygon.join( "," ) + "z"; } );

    hoverers.append( "title" )
        .text( function ( d ) { return parseFloat( d.value ).toFixed( 2 ) + " " + d.parent.data.name; } );
}


// From the d3-voronoi-treemap example.
function computeCirclingPolygon( radius ) {
    var points = 60,
        increment = _2PI / points,
        circlingPolygon = [];

    for ( var a = 0, i = 0; i < points; i++, a += increment ) {
        circlingPolygon.push(
            [ radius + radius * Math.cos( a ), radius + radius * Math.sin( a ) ]
        )
    }

    return circlingPolygon;
};
