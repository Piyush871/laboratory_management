document.getElementById('search').addEventListener('input', function(e) {
    // Get the search term and convert it to lower case for case-insensitive matching
    var searchTerm = e.target.value.toLowerCase();

    // Get the current visible request container
    var requestContainer = document.querySelector('.keep-cards');
    
    // Get all the request cards within the container
    var requestCards = requestContainer.getElementsByClassName('col-md-4');

    // Loop through the request cards
    for (var i = 0; i < requestCards.length; i++) {
        // Get the card's text and convert it to lower case
        var card = requestCards[i];
        var cardText = card.innerText.toLowerCase();

        // If the card's text includes the search term, show the card, otherwise hide it
        if (cardText.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    }
});