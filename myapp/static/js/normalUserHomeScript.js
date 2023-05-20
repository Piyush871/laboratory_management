document.addEventListener("DOMContentLoaded", function () {
  const myTable = document.querySelector("#datatablesSimple");

  const generateDataTableConfig = (data) => ({
    data: data,
    columns: [
      { select: 0, sort: "asc", title: "equipment_id" },
      { select: 1, title: "equipment_name" },
      { select: 2, title: "category" },
      {
        select: 3,
        title: "availability_status",
        render: function (data, type, row) {
          var available;
          if (data[0].data == "false") {
            available = true;
          } else {
            available = false;
          }
          if (available) {
            return `<span style="color:green">✔️</span>`;
          } else {
            return `<span style="color:red">❌</span>`;
          }
        },
      },
      {
        select: 4,
        title: "viewDetails",
        render: function (data, cell, _dataIndex, _cellIndex) {
          console.log(cell.childNodes[0].data);
          const equipmentId = cell.childNodes[0].data;
          return `<a href="#" data-bs-toggle="modal" data-bs-target="#equipmentModal" >View Details</a>`;
        },
      },
      { select: 5, title: "Select", html: true },
    ],
  });
  let dataTable;

  function fetchData(
    query = "",
    url = "/api/normal_user/assigned_equipments/"
  ) {
    console.log("fetching data");
    fetch(`${url}?search=${query}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("table refreshed");
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
              if (query.length >= 1 || query.length === 0) {
                fetchData(query, "/api/normal_user/all_equipments/");
              }
            }
          });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
  document.getElementById("allButton").addEventListener("click", function () {
    fetchData("", "/api/normal_user/all_equipments/");
  });

  document
    .getElementById("assignedEquipmentsButton")
    .addEventListener("click", function () {
      fetchData();
    });

  document
    .getElementById("availableEquipmentsButton")
    .addEventListener("click", function () {
      fetchData("", "/api/normal_user/available_equipments/");
    });

  fetchData();

  document
    .getElementById("addEquipmentForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      var formData = new FormData();
      formData.append(
        "equipment_id",
        document.getElementById("equipmentId").value
      );
      formData.append(
        "equipment_name",
        document.getElementById("equipmentName").value
      );
      formData.append("category", document.getElementById("category").value);
      formData.append(
        "date_of_purchase",
        document.getElementById("dateOfPurchase").value
      );
      formData.append("location", document.getElementById("location").value);
      formData.append("image", document.getElementById("image").files[0]);

      fetch("/api/normal_user/addEquipment/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCookie("csrftoken"), // function to get the cookie value
        },
      })
        .then(function (response) {
          if (response.ok) {
            alert("Equipment added successfully");
            $("#addEquipmentModal").modal("hide");
            fetchData();
          } else {
            alert("Error: " + response.statusText);
          }
        })
        .catch(function (error) {
          alert("Error: " + error);
        });
    });
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  document.addEventListener('change', function(event) {
  if(event.target.classList.contains('user-checkbox')) {
    var checked = document.querySelectorAll('.user-checkbox:checked');
    if(checked.length > 5) {
      alert('You can select at most 5 equipments at a time.');
      event.target.checked = false;
    }
  }
});


//send request
function sendRequest(requestType, selectedEquipments) {
  var csrftoken = getCookie('csrftoken');

  fetch('/api/normal_user/request_equipment/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({
          'request_type': requestType,
          'equipments': selectedEquipments
      })
  })
  .then(response => response.json())
  .then(data => {
      alert(data.message);
  })
  .catch((error) => {
      console.error('Error:', error);
  });
}

document.getElementById("requestAssignmentButton").addEventListener('click', function() {
  var checked = document.querySelectorAll('.user-checkbox:checked');
  var selectedEquipments = Array.from(checked).map((checkbox) => {
    console.log("Checkbox:", checkbox);
    return checkbox.dataset.id;
  });
  if(selectedEquipments.length > 0) {
      // Make a request to the server with the selectedEquipments
      sendRequest('ALLOCATION', selectedEquipments);
  } else {
      alert('You must select at least one equipment.');
  }
});

document.getElementById("deallocationButton").addEventListener('click', function() {
  var checked = document.querySelectorAll('.user-checkbox:checked');
  var selectedEquipments = Array.from(checked).map((checkbox) => {
    console.log("Checkbox:", checkbox);
    return checkbox.dataset.id;
  });


  if(selectedEquipments.length > 0) {
      // Make a request to the server with the selectedEquipments
      sendRequest('DEALLOCATION', selectedEquipments);
  } else {
      alert('You must select at least one equipment.');
  }
});


});
