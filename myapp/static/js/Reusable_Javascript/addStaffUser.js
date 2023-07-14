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
    console.log(password);
    console.log(confirmPassword);
  
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
  
    window.makeRequest({
      url: "/api/staff_users/",
      method: "POST",
      body: JSON.stringify(newUser),
      onSuccess: function (res) {
        // Add this line to display the success message
        $('#message-container').html('<div class="alert alert-success" role="alert">' + res.message + '</div>');
        //wait for 2 seconds
  
          //then redirect to the home page
          clearAddStaffUserForm();
          $("#addStaffUserModal").modal("hide");
          window.location.href = res.redirect_url;
      },
      onErrorMessage: function (error) {
        // Add this line to display the error message
        $('#message-container').html('<div class="alert alert-danger" role="alert">' + error + '</div>');
      },
      onNetError: function (error) {
        console.error(error);
      }
    });
  });
  
  
  $("#closeAddStaffUserModalIcon").click(function (e) {
    e.preventDefault();
    clearAddStaffUserForm();
    $("#addStaffUserModal").modal("hide");
  });
  
  $("#closeAddStaffUserModalButton").click(function (e) {
    e.preventDefault();
    clearAddStaffUserForm();
    $("#addStaffUserModal").modal("hide");
  });
  
  function clearAddStaffUserForm() {
    $("#staffEmail").val("");
    $("#staffName").val("");
    $("#staffContactNo").val("");
    $("#staffDesignation").val("");
    $("#staffPassword").val("");
    $("#confirmStaffPassword").val("");
  }
  