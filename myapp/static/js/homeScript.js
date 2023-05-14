function checkEquipmentAssignment(event) {
  event.preventDefault(); // prevents the form from being submitted
  const equipmentId = document.querySelector("#equipment_id").value;
  const employeeId = document.querySelector("#employee_id").value;

  fetch(`/get_names?equipment_id=${equipmentId}&employee_id=${employeeId}`)
    .then((response) => response.json())
    .then((data) => {
      const DetailsElement = document.querySelector("#details_1");
      DetailsElement.innerHTML =
        data.equipment_name + " will be assigned to " + data.employee_name;
    });
}

document
  .querySelector("#check_button_assign")
  .addEventListener("click", checkEquipmentAssignment);

//&&&&&&&&&&&&&&&&&&&&& method for assigning the eq
function assignEquipment(event) {
  event.preventDefault(); // prevents the form from being submitted

  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  const equipmentId = document.querySelector("#equipment_id").value;
  const employeeId = document.querySelector("#employee_id").value;
  const location = document.querySelector("#location").value;

  const formData = new FormData();
  formData.append("equipment_id", equipmentId);
  formData.append("employee_id", employeeId);
  formData.append("location", location);

  fetch("/assign_equipment", {
    method: "POST",
    headers: { "X-CSRFToken": csrftoken },
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Something went wrong");
      }
    })
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.log(error);
      alert("An error occurred while assigning the equipment.");
    });
}

document
  .querySelector("#assign-equipment-form")
  .addEventListener("submit", assignEquipment);

//&&deal with cheking when  deassigning the eq

function checkEquipmentDeassignment(event) {
  event.preventDefault(); // prevents the form from being submitted
  const equipmentId = document.querySelector("#equipment_id_deassign").value;

  fetch(`check_equipment_deassign?equipment_id=${equipmentId}`)
    .then((response) => response.json())
    .then((data) => {
      const DetailsElement = document.querySelector("#details_2");
      DetailsElement.innerHTML =
        data.equipment_name + "is assigned to " + data.employee_name;
      const LocationElement = document.querySelector("#location_deassign_text");
      LocationElement.innerHTML = "Location: " + data.location;
    });
}

document
  .querySelector("#check_button_deassign")
  .addEventListener("click", checkEquipmentDeassignment);

//&& deal with deassigning the eq

function deassignEquipment(event) {
  event.preventDefault(); // prevents the form from being submitted
  console.log("deassigning equipment");
  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  const equipmentId = document.querySelector("#equipment_id_deassign").value;
  const location = document.querySelector("#location_deassign_input").value;

  const formData = new FormData();
  formData.append("equipment_id", equipmentId);
  formData.append("location", location);

  fetch("/deassign_equipment", {
    method: "POST",
    headers: { "X-CSRFToken": csrftoken },
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Something went wrong");
      }
    })
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.log(error);
      alert("An error occurred while assigning the equipment.");
    });
}

document
  .querySelector("#deassign-equipment-form")
  .addEventListener("submit", deassignEquipment);














//&equipment details

window.showEquipmentDetails = function (equipmentId) {
  fetch(`/api/equipment_details/?equipment_id=${equipmentId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        document.querySelector("#equipment_id_d").value = data.equipment_id;
        document.querySelector("#equipment_name_d").value = data.equipment_name;
        document.querySelector("#category_d").value = data.category;
        document.querySelector("#assigned_user_d").value = data.assigned_user;
        document.querySelector("#last_assigned_d").value = data.last_assigned;
        document.querySelector("#location_d").value = data.location;
        document.querySelector("#equipment_image_d").src = data.image_url;
        // Store the equipmentId for later use
        document.querySelector("#equipment_id").dataset.id = equipmentId;
      } else {
        console.error("Error fetching equipment details:", data.error);
      }
    })
    .catch((error) => {
      console.error("Error fetching equipment details:", error);
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
  document.querySelector("#new_image").style.display = "block";

  // Hide the Edit button
  document.querySelector("#editButton").style.display = "none";
};

window.saveEquipment = function () {
  // Fetch the CSRF token from the csrftoken cookie
  const csrftoken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken"))
    .split("=")[1];

  const data = new FormData();
  data.append("equipment_id", document.querySelector("#equipment_id_d").value);
  data.append(
    "equipment_name",
    document.querySelector("#equipment_name_d").value
  );
  data.append("category", document.querySelector("#category_d").value);
  data.append("location", document.querySelector("#location_d").value);
  data.append("image", document.querySelector("#new_image").files[0]);

  fetch("/api/update_equipment/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrftoken,
    },
    body: data,
  })
    .then((response) => response.json())
    .then((data) => {
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
        equipmentId=document.querySelector("#equipment_id_d").value;
        showEquipmentDetails(equipmentId);
      } else {
        console.error("Error updating equipment:", data.error);
      }
    })
    .catch((error) => {
      console.error("Error updating equipment:", error);
    });
};

var modal = document.getElementById('equipmentModal');
modal.addEventListener('hidden.bs.modal', function (event) {
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
document.addEventListener("DOMContentLoaded", function () {
  const myTable = document.querySelector("#datatablesSimple");

  const generateDataTableConfig = (data) => ({
    data: data,
    columns: [
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
    ],
  });

  let dataTable;

  function fetchData(query = "") {
    console.log("fetching data");
    fetch(`/api/equipment/?search=${query}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (dataTable) {
          dataTable.destroy();
        }
        dataTable = new simpleDatatables.DataTable(
          myTable,
          generateDataTableConfig(data)
        );
        document
          .querySelector(".datatable-input")
          .addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
              const query = event.target.value;
              if (query.length >= 3 || query.length === 0) {
                fetchData(query);
              }
            }
          });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  fetchData();
});
