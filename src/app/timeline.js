let timer;

function pauseTimeline() {
    clearInterval(timer);
    timer = false;
}

function playTimeline() {
    timer = setInterval( function () {
        const timeline = document.querySelector( '#timeline' );

        if ( timeline.value < timeline.max ) {
            timeline.value++;
        }
        else {
            timeline.value = timeline.min;
        }

        // Create a new 'change' event
        var event = new Event('change');

        // Dispatch it.
        timeline.dispatchEvent(event);

    }, 1000 );
}

export function handleTimelineButtonClick() {
    const button = document.querySelector( '#timeline_control' );
    
    button.classList.toggle( 'playing' );
    button.classList.toggle( 'paused' );

    if ( button.classList.contains( 'playing' ) ) {
        playTimeline();
    }
    else {
        pauseTimeline();
    }

}
