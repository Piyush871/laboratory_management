function clearEditStaffUserForm() {
  $("#editStaffEmail").val("");
  $("#editStaffName").val("");
  $("#editStaffContactNo").val("");
  $("#editStaffDesignation").val("");
}
$("#closeEditStaffUserModalIcon").click(function (e) {
  e.preventDefault();
  clearEditStaffUserForm();
  $("#editStaffUserModal").modal("hide");
});
$("#closeEditStaffUserModalButton").click(function (e) {
  e.preventDefault();
  clearEditStaffUserForm();
  $("#editStaffUserModal").modal("hide");
});

document.querySelectorAll(".editStaffUserButton").forEach((button) => {
  button.addEventListener("click", function () {
    let userId = this.getAttribute("data-id");
    console.log(userId);

    window.makeRequest({
      url: `/api/staff_user_get/${userId}/`,
      method: "GET",
      onSuccess: function (data) {
        $("#editStaffUserId").val(userId);
        $("#editStaffEmail").val(data.email);
        $("#editStaffName").val(data.name);
        $("#editStaffContactNo").val(data.contact_no);
        $("#editStaffDesignation").val(data.employee_designation);

        $("#editStaffUserModal").modal("show");
      },
      onErrorMessage: function (message) {
        alert(message);
      },
      onNetError: function (error) {
        console.error("Error:", error);
      },
    });
  });
});
document
  .querySelector("#submitEditStaffUserForm")
  .addEventListener("click", function () {
    let userId = $("#editStaffUserId").val();
    let updatedData = {
      email: $("#editStaffEmail").val(),
      name: $("#editStaffName").val(),
      contact_no: $("#editStaffContactNo").val(),
      employee_designation: $("#editStaffDesignation").val(),
    };

    window.makeRequest({
      url: `/api/staff_user_update/${userId}/`,
      method: "PUT",
      body: JSON.stringify(updatedData),
      onSuccess: function (data) {
        if (data.message) {
          alert(data.message);
          $("#editStaffUserModal").modal("hide");
          clearEditStaffUserForm();
          //reload the page
          location.reload();
          // Here you can also add code to update the user card with new data without refreshing the page.
        }
      },
      onErrorMessage: function (message) {
        alert(message);
      },
      onNetError: function (error) {
        console.error("Error:", error);
      }
    });
  });
