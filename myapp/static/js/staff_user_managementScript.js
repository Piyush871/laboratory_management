document.getElementById("search").addEventListener("input", function (e) {
  var searchTerm = e.target.value.toLowerCase();
  var requestContainer = document.querySelector(".keep-cards");
  var requestCards = requestContainer.getElementsByClassName("col-md-4");

  for (var i = 0; i < requestCards.length; i++) {
    var card = requestCards[i];
    var cardText = card.innerText.toLowerCase();

    if (cardText.includes(searchTerm)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  }
});



// Delete Staff User


  document.querySelectorAll(".deleteStaffUserButton").forEach((button) => {
    button.addEventListener("click", function () {
      if (!confirm("Are you sure you want to delete this user?")) {
        return;
      }
  
      let userId = this.getAttribute("data-id");
  
      window.makeRequest({
        url: `/api/staff_user_delete/${userId}/`,
        method: "DELETE",
        onSuccess: function (data) {
          // remove the card of the deleted user or refresh the page
          location.reload();
        },
        onErrorMessage: function (message) {
          console.error("Error:", message);
        },
        onNetError: function (error) {
          console.error("Error:", error);
        }
      });
    });
  });
  