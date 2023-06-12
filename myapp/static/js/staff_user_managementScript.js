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
  function clearEditStaffUserForm()
    {
        $("#editStaffEmail").val("");
        $("#editStaffName").val("");
        $("#editStaffContactNo").val("");
        $("#editStaffDesignation").val("");
    }
$("#closeEditStaffUserModalIcon").click(function (e)
{
    e.preventDefault();
    clearEditStaffUserForm();
    $("#editStaffUserModal").modal("hide");
});
$("#closeEditStaffUserModalButton").click(function (e)
{
    e.preventDefault();
    clearEditStaffUserForm();
    $("#editStaffUserModal").modal("hide");
});

  document.querySelectorAll(".editStaffUserButton").forEach((button) => {
    button.addEventListener("click", function () {
      let userId = this.getAttribute('data-id');
      console.log(userId);
      fetch(`/api/staff_user_get/${userId}/`) // Please replace this with your actual API endpoint.
        .then(response => response.json())
        .then(data => {
            $('#editStaffUserId').val(userId);
            $('#editStaffEmail').val(data.email);
            $('#editStaffName').val(data.name);
            $('#editStaffContactNo').val(data.contact_no);
            $('#editStaffDesignation').val(data.employee_designation);
            
            $('#editStaffUserModal').modal('show');
  
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  });
  

  document.querySelector("#submitEditStaffUserForm").addEventListener("click", function () {
    let userId = $('#editStaffUserId').val();
    let updatedData = {
        email: $('#editStaffEmail').val(),
        name: $('#editStaffName').val(),
        contact_no: $('#editStaffContactNo').val(),
        employee_designation: $('#editStaffDesignation').val()
    };

    const csrftoken = getCookie("csrftoken"); // Fetching CSRF token
    fetch(`/api/staff_user_update/${userId}/`, {  // Please replace this with your actual API endpoint.
        method: 'PUT', // or 'POST'
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken  // Attaching CSRF token to the request
        },
        body: JSON.stringify(updatedData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            $('#editStaffUserModal').modal('hide');
            clearEditStaffUserForm();
            //reload the page
            location.reload();
            // Here you can also add code to update the user card with new data without refreshing the page.
        } else if (data.error_message) {
            alert(data.error_message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});


document.querySelectorAll(".deleteStaffUserButton").forEach((button) => {
    button.addEventListener("click", function () {
        if(!confirm("Are you sure you want to delete this user?")){
            return;
        }
        
        let userId = this.getAttribute('data-id');
        let csrftoken = getCookie('csrftoken');

        fetch(`/api/staff_user_delete/${userId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
        })
        .then(response => {
            if (response.ok) {
                // remove the card of the deleted user or refresh the page
                
                location.reload();
            } else {
                return response.json();
            }
        })
        .then(data => {
            if(data){
                console.error('Error:', data.error_message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});
