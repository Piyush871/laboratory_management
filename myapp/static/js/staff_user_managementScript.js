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
  
  $("#addStaffUser").click(function () {
    $("#addStaffUserModal").modal("show");
  });
  
  $("#submitAddStaffUserForm").click(function (e) {
    e.preventDefault();
    var email = $("#staffEmail").val();
    var name = $("#staffName").val();
    var contact_no = $("#staffContactNo").val();
    var employee_designation = $("#staffDesignation").val();
    var password = $("#staffPassword").val();
    var confirmPassword = $("#confirmStaffPassword").val();
  
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
  
    var newUser = {
      email: email,
      name: name,
      contact_no: contact_no,
      employee_designation: employee_designation,
      password: password,
    };
    let csrftoken = getCookie("csrftoken");
    $.ajax({
        type: "POST",
        url: "/api/staff_users/",
        headers: {
          "X-CSRFToken": csrftoken,
        },
        data: JSON.stringify({
          email: email,
          name: name,
          contact_no: contact_no,
          employee_designation: employee_designation,
          password: password,
        }),
        success: function (res) {
          // Add this line to display the success message
          $('#message-container').html('<div class="alert alert-success" role="alert">' + res.message + '</div>');
          //wait for 2 seconds
            setTimeout(function(){
                //then redirect to the home page
          clearAddStaffUserForm();
          $("#addStaffUserModal").modal("hide");
          window.location.href = res.redirect_url;
            });
        },
        error: function (error) {
          // Add this line to display the error message
          $('#message-container').html('<div class="alert alert-danger" role="alert">' + error.responseJSON.error_message + '</div>');
        },
      });
      
  });
  
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  
  $("#closeAddStaffUserModalIcon").click(function (e)
  {
      e.preventDefault();
      clearAddStaffUserForm();
      $("#addStaffUserModal").modal("hide");
  });
  
  $("#closeAddStaffUserModalButton").click(function (e)
  {
      e.preventDefault();
      clearAddStaffUserForm();
      $("#addStaffUserModal").modal("hide");
  });
  
  function clearAddStaffUserForm()
  {
      $("#staffEmail").val("");
      $("#staffName").val("");
      $("#staffContactNo").val("");
      $("#staffDesignation").val("");
      $("#staffPassword").val("");
      $("#confirmStaffPassword").val("");
  }
  

  document.querySelectorAll(".editStaffUserButton").forEach((button) => {
    button.addEventListener("click", function () {
      let userId = this.getAttribute('data-id');
      console.log(userId);
      fetch(`/api/staff_user/${userId}/`) // Please replace this with your actual API endpoint.
        .then(response => response.json())
        .then(data => {
          document.getElementById('staffEmail').value = "dummy";
          document.getElementById('staffName').value = "dummy";
          document.getElementById('staffContactNo').value = "dummy";
          document.getElementById('staffDesignation').value = "dummy";
          document.getElementById('submitAddStaffUserForm').style.display = 'none'; // Hide add button
          document.getElementById('submitEditStaffUserButton').style.display = 'block'; // Show edit button
          document.getElementById('submitEditStaffUserButton').setAttribute('data-id', userId); // Set the userId in the edit button's attribute
  
          // Open the modal
          $('#addStaffUserModal').modal('show');
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  });
  

  document.getElementById('submitEditStaffUserButton').addEventListener('click', function () {
    let userId = this.getAttribute('data-id'); // Get the userId from the button's attribute
    
    var email = $("#staffEmail").val();
    var name = $("#staffName").val();
    var contact_no = $("#staffContactNo").val();
    var employee_designation = $("#staffDesignation").val();
  
    // No need to get password and confirmPassword fields as we're editing existing user.
    
    let csrftoken = getCookie("csrftoken");
    $.ajax({
        type: "PUT", // Change method to PUT as we're updating existing user.
        url: `/api/staff_user/${userId}/`, // Include userId in URL.
        headers: {
          "X-CSRFToken": csrftoken,
        },
        data: JSON.stringify({
          email: email,
          name: name,
          contact_no: contact_no,
          employee_designation: employee_designation,
        }),
        success: function (res) {
          // Add this line to display the success message
          $('#message-container').html('<div class="alert alert-success" role="alert">' + res.message + '</div>');
          //wait for 2 seconds
            setTimeout(function(){
              //then redirect to the home page
              clearAddStaffUserForm();
              $("#addStaffUserModal").modal("hide");
              window.location.href = res.redirect_url;
            }, 2000);
        },
        error: function (error) {
          // Add this line to display the error message
          $('#message-container').html('<div class="alert alert-danger" role="alert">' + error.responseJSON.error_message + '</div>');
        },
      });
  });
  $('#addStaffUserModal').on('hidden.bs.modal', function () {
    clearAddStaffUserForm();
    document.getElementById('submitAddStaffUserForm').style.display = 'block'; // Show add button
    document.getElementById('submitEditStaffUserButton').style.display = 'none'; // Hide edit button
  });
    