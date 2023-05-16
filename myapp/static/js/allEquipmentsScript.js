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
      { select: 6, title: "CheckBox", html: true },
    ],
  });

  let dataTable;

  function fetchData(query = "") {
    console.log("fetching data");
    fetch(`/api/allEquipments/?search=${query}`)
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

    fetch("/api/addEquipment/", {
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
