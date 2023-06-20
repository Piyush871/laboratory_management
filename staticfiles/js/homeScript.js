document.addEventListener("DOMContentLoaded", function () {
  function checkEquipmentAssignment(event) {
    event.preventDefault();
    const equipmentId = document.querySelector("#equipment_id").value;
    const employeeId = document.querySelector("#employee_id").value;
    console.log(equipmentId);
    console.log(employeeId);

    window.makeRequest({
      url: `/get_names?equipment_id=${equipmentId}&employee_id=${employeeId}`,
      method: "GET",
      onSuccess: (data) => {
        if (data) {
          const DetailsElement = document.querySelector("#details_1");
          console.log(data);
          DetailsElement.innerHTML = data.responseText;
        }
      },
      onNetError: (error) => {
        console.log(error);
        document.getElementById("message_div_assign_form").innerHTML =
          "Something went wrong";
      },
      onErrorMessage: (message) => {
        window.showAlert("message_div_assign_form", "warning", message);
      },
    });
  }

  //&&&&&&&&&&&&&&&&&&&&& method for assigning the eq
  function assignEquipment(event) {
    event.preventDefault(); // prevents the form from being submitted

    const equipmentId = document.querySelector("#equipment_id").value;
    const employeeId = document.querySelector("#employee_id").value;
    const location = document.querySelector("#location").value;

    const formData = new FormData();
    formData.append("equipment_id", equipmentId);
    formData.append("employee_id", employeeId);
    formData.append("location", location);

    const body = JSON.stringify(Object.fromEntries(formData));

    window.makeRequest({
      url: "/assign_equipment",
      method: "POST",
      body: body,
      onSuccess: (data) => {
        alert(data.message);
        fetchData();
      },
      onErrorMessage: (errorMessage) => {
        window.showAlert("message_div_assign_form", "warning", errorMessage);
      },
      onNetError: (error) => {
        console.log(error);
        document.getElementById("message_div_deassign_form").innerHTML =
          "Something went wrong";
      },
    });
  }

  document
    .querySelector("#check_button_assign")
    .addEventListener("click", checkEquipmentAssignment);

  //&&deal with cheking when  deassigning the eq

  function checkEquipmentDeassignment(event) {
    event.preventDefault(); // prevents the form from being submitted

    const equipmentId = document.querySelector("#equipment_id_deassign").value;

    window.makeRequest({
      url: `check_equipment_deassign?equipment_id=${equipmentId}`,
      method: "GET",
      onSuccess: (data) => {
        const DetailsElement = document.querySelector("#details_2");
        DetailsElement.innerHTML = data.responseText;
      },
      onNetError: (error) => {
        console.log(error);
      },
      onErrorMessage: (errorMessage) => {
        console.log(errorMessage);
      },
    });
  }

  document
    .querySelector("#check_button_deassign")
    .addEventListener("click", checkEquipmentDeassignment);

  //&& deal with deassigning the eq

  function deassignEquipment(event) {
    event.preventDefault(); // prevents the form from being submitted
    console.log("deassigning equipment");

    const equipmentId = document.querySelector("#equipment_id_deassign").value;
    const location = document.querySelector("#location_deassign").value;

    const requestBody = {
      equipment_id: equipmentId,
      location: location,
    };

    window.makeRequest({
      url: "/deassign_equipment",
      method: "POST",
      body: JSON.stringify(requestBody),
      onSuccess: (data) => {
        alert(data.message);
      },
      onErrorMessage: (errorMessage) => {
        console.log(errorMessage);
        alert("An error occurred while deassigning the equipment.");
      },
      onNetError: (error) => {
        console.log(error);
        alert("An error occurred while deassigning the equipment.");
      },
    });
  }

  document
    .querySelector("#deassign-equipment-form")
    .addEventListener("submit", deassignEquipment);

  //&equipment details

  window.showEquipmentDetails = function (equipmentId) {
    window.makeRequest({
      url: `/api/equipment_details/?equipment_id=${equipmentId}`,
      method: "GET",
      onSuccess: (data) => {
        if (data.status) {
          document.querySelector("#equipment_id_d").value = data.equipment_id;
          document.querySelector("#equipment_name_d").value =
            data.equipment_name;
          document.querySelector("#category_d").value = data.category;
          document.querySelector("#assigned_user_d").value = data.assigned_user;
          document.querySelector("#last_assigned_d").value = data.last_assigned;
          document.querySelector("#location_d").value = data.location;
          document.querySelector("#equipment_image_d").href = data.image_url;
          // Store the equipmentId for later use
          document.querySelector("#equipment_id").dataset.id = equipmentId;
          // Where you're setting the modal data
          document.getElementById("purchase_receipt_d").href =
            data.purchase_receipt_url;
        } else {
          console.error("Error fetching equipment details:", data.error);
        }
      },
      onErrorMessage: (errorMessage) => {
        console.error("Error fetching equipment details:", errorMessage);
      },
      onNetError: (error) => {
        console.error("Error fetching equipment details:", error);
      },
    });
  };

  window.editEquipment = function () {
    // Remove readonly from all input fields
    document.querySelector("#equipment_id_d").readOnly = true;
    document.querySelector("#equipment_name_d").readOnly = false;
    document.querySelector("#category_d").readOnly = false;
    document.querySelector("#assigned_user_d").readOnly = true;
    document.querySelector("#last_assigned_d").readOnly = true;
    document.querySelector("#location_d").readOnly = false;

    console.log("editEquipment");

    // Show the Save button and the image file input
    document.querySelector("#saveButton").style.display = "inline-block";

    // Hide the Edit button
    document.querySelector("#editButton").style.display = "none";
    // Show the Save button and the image file input
    document.querySelector("#equipment_image_upload").style.display = "block";
    document.querySelector("#purchase_receipt_upload").style.display = "block";
  };

  //this cannot be converted to json because it has a file
  window.saveEquipment = function () {
    const data = new FormData();
    data.append(
      "equipment_id",
      document.querySelector("#equipment_id_d").value
    );
    data.append(
      "equipment_name",
      document.querySelector("#equipment_name_d").value
    );
    data.append("category", document.querySelector("#category_d").value);
    data.append("location", document.querySelector("#location_d").value);
    data.append("image", document.querySelector("#new_image").files[0]);

    window.makeRequest({
      url: "/api/update_equipment/",
      method: "POST",
      body: data,
      onSuccess: (data) => {
        if (data.status) {
          console.log("Equipment updated successfully");
          // Hide the Save button and the image file input
          document.querySelector("#saveButton").style.display = "none";
          document.querySelector("#new_image").style.display = "none";
          // Show the Edit button
          document.querySelector("#editButton").style.display = "inline-block";
          // Make all input fields read only again
          document.querySelector("#equipment_name_d").readOnly = true;
          document.querySelector("#category_d").readOnly = true;
          document.querySelector("#location_d").readOnly = true;
          equipmentId = document.querySelector("#equipment_id_d").value;
          showEquipmentDetails(equipmentId);
        } else {
          console.error("Error updating equipment:", data.error);
        }
      },
      onErrorMessage: (errorMessage) => {
        console.error("Error updating equipment:", errorMessage);
      },
      onNetError: (error) => {
        console.error("Error updating equipment:", error);
      },
    });
  };

  var modal = document.getElementById("equipmentModal");
  modal.addEventListener("hidden.bs.modal", function (event) {
    // Hide the Save button and the image file input
    document.querySelector("#saveButton").style.display = "none";
    document.querySelector("#new_image").style.display = "none";

    // Show the Edit button
    document.querySelector("#editButton").style.display = "inline-block";

    // Make all input fields read only again
    document.querySelector("#equipment_id_d").readOnly = true;
    document.querySelector("#equipment_name_d").readOnly = true;
    document.querySelector("#category_d").readOnly = true;
    document.querySelector("#assigned_user_d").readOnly = true;
    document.querySelector("#last_assigned_d").readOnly = true;
    document.querySelector("#location_d").readOnly = true;
  });

  //&table details

  const myTable = document.querySelector("#datatablesSimple");

  const columns = [
    { select: 0, sort: "asc", title: "equipment_id" },
    { select: 1, title: "equipment_name" },
    { select: 2, title: "category" },
    { select: 3, title: "assigned_user" },
    { select: 4, title: "last_assigned" },
    {
      select: 5,
      title: "viewDetails",
      render: function (data, cell, _dataIndex, _cellIndex) {
        console.log(cell.childNodes[0].data);
        const equipmentId = cell.childNodes[0].data;
        return `<a href="#" data-bs-toggle="modal" data-bs-target="#equipmentModal" onclick="showEquipmentDetails(${equipmentId})">View Details</a>`;
      },
    },
  ];

  window.fetchData(
    "datatablesSimple",
    myTable,
    "/api/equipment/",
    "/api/equipment/",
    columns
  );
});
