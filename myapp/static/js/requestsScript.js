

document.getElementById('AllocReqButton').addEventListener('click', function() {
    document.getElementById('allocation_requests_container').style.display = 'block';
    document.getElementById('deallocation_requests_container').style.display = 'none';
    //make the button primary
    document.getElementById('AllocReqButton').classList.add('btn-primary');
    document.getElementById('DeallocReqButton').classList.remove('btn-primary');
});
function generateAndAppendRequest(request, containerSelector) {
  var requestHtml = `<div class="col-md-4" data-name="${request.user.name}">
      <div class="card card-1" style="background-image: url(${request.image})">
          <h3 id="user_name">${request.user.name}</h3>
          <div class="card-body">
              <h5 class="card-title">${request.equipment.id}</h5>
              <p class="card-text">${request.equipment.equipment_name}</p>
              <p class="card-text">${request.timestamp}</p>
              <button class="btn btn-primary" onclick="handleRequest(${request.id}, 'approve')">Approve</button>
              <button class="btn btn-danger" onclick="handleRequest(${request.id}, 'reject')">Reject</button>
              <button class="btn btn-warning" onclick="handleRequest(${request.id}, 'reject')">Details</button>
          </div>
      </div>
  </div>`;
  $(containerSelector).append(requestHtml);
}


function updateAllocationRequests() {
  console.log("updating allocation requests");
  window.makeRequest({
      url: '/api/getRequest/Allocation/', 
      method: 'GET',
      onSuccess: function(data) {
        console.log("success updating allocation requests")
        console.log("Before empty: ", $("#allocation_requests_container .request-row").html());
        $("#allocation_requests_container .request-row").empty();
        console.log("After empty: ", $("#allocation_requests_container .request-row").html());

        console.log(data);
        data.allocation_requests.forEach(function(request) {
            generateAndAppendRequest(request, "#allocation_requests_container .request-row");
          });
      },
      onNetError: function(error) {
          console.log(error);
      },
      onErrorMessage: function(errorMessage) {
          console.log(errorMessage);
      }
  });
}

function updateDeallocationRequests() {
  window.makeRequest({
      url: '/api/getRequest/DeAllocation/', 
      method: 'GET',
      onSuccess: function(data) {
          $("#deallocation_requests_container .request-row").empty();
          data.deallocation_requests.forEach(function(request) {
              generateAndAppendRequest(request, "#deallocation_requests_container .request-row");
          });
      },
      onNetError: function(error) {
          console.log(error);
      },
      onErrorMessage: function(errorMessage) {
          console.log(errorMessage);
      }
  });
}





document.getElementById('DeallocReqButton').addEventListener('click', function() {
    document.getElementById('allocation_requests_container').style.display = 'none';
    document.getElementById('deallocation_requests_container').style.display = 'block';
    //make the button primary
    document.getElementById('DeallocReqButton').classList.add('btn-primary');
    document.getElementById('AllocReqButton').classList.remove('btn-primary');

});


document.getElementById('search').addEventListener('input', function(e) {
    // Get the search term and convert it to lower case for case-insensitive matching
    var searchTerm = e.target.value.toLowerCase();

    // Get the current visible request container
    var requestContainer = document.querySelector('.keep-cards:not([style*="display: none"])');
    
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

//create function handleRequest
function handleRequest(requestId, action) {
  const csrftoken = window.getCookie("csrftoken");
  const url = "/api/handleRequest/";
  const method = "POST";
  const body = new FormData();
  body.append("request_id", requestId);
  body.append("action", action);
  console.log(body);
  const onSuccess = function (data) {
    updateAllocationRequests();
    updateDeallocationRequests();
    window.showAlertGlobal(data.message, "success");

  };
  const onNetError = function (error) {
    window.showAlertGlobal("Network Error", "error");
  };
  const onErrorMessage = function (message) {
    window.showAlertGlobal(message, "error");
  };
  window.makeRequest({ url, method, body, onSuccess, onNetError, onErrorMessage });
}
