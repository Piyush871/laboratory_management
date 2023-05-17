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
      { select: 5, title: "CheckBox", html: true },
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
});
