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
        DetailsElement.innerHTML = data.equipment_name + "is assigned to " + data.employee_name;
        const LocationElement = document.querySelector("#location_deassign_text");
        LocationElement.innerHTML = "Location: " + data.location;
      });
  }
  
  document.querySelector("#check_button_deassign").addEventListener("click", checkEquipmentDeassignment);


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
  

//^^ this is for the table 

$(document).ready(function() {
  $('#datatablesSimple').DataTable({
      "processing": true,
      "serverSide": true,
      "ajax": {
          "url": "/api/data/",
          "type": "GET"
      },
      "columns": [
          { "data": "equipment_name" },
          { "data": "category" },
          { "data": "assigned_user" },
          { "data": "last_assigned" },
          { "data": "view_details" }
      ],
      "columnDefs": [
          {
              "targets": 4,
              "render": function (data, type, row, meta) {
                  return '<a href="/equipment/' + row.equipment_id + '/">View Details</a>';
              }
          }
      ]
  });
});
