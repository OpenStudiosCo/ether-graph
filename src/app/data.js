export function processCSV( rootData ) {

    rootData.forEach( function ( csvRow ) {

        transaction = {};
        transaction.id = csvRow[ 'TransactionID' ];
        transaction.type = csvRow[ 'Type' ];
        transaction.timestamp = csvRow[ 'UnixTimestamp' ];
        transaction.created = csvRow[ 'NormalTimestamp' ];
        transaction.from = csvRow[ 'FromWallet' ];
        transaction.to = csvRow[ 'ToWallet' ];
        transaction.amount = csvRow[ 'Amount' ];
        transaction.currency = csvRow[ 'Currency' ];
        transaction.price = csvRow[ 'ETH_USD_Price' ];

        let weekNumber = new Date( transaction.created ).getWeek();

        if ( !( weekNumber in dataTable ) ) {
            dataTable[ weekNumber ] = [];
            weekNumbers.push( parseInt( weekNumber ) );
        }
        dataTable[ weekNumber ].push( transaction );

    } );

    const weekDataList = document.querySelector( '#weeks' );

    for ( weekNumber in dataTable ) {
        const option = document.createElement( 'option' );
        option.setAttribute( 'value', weekNumber );
        option.setAttribute( 'label', 'Week ' + weekNumber );
        weekDataList.appendChild( option );
    }

    const timeline = document.querySelector( '#timeline' );
    timeline.setAttribute( 'min', Math.min( ...weekNumbers ) );
    timeline.setAttribute( 'max', Math.max( ...weekNumbers ) );
    timeline.setAttribute( 'value', Math.min( ...weekNumbers ) );

    updateGraphs();
}