

document.addEventListener("DOMContentLoaded", function () {
    const myTable = document.querySelector("#datatablesSimple");
  
    const generateDataTableConfig = (data) => ({
      data: data,
      columns: [
        { select: 0, sort: "asc", title: "employee_id" },
        { select: 1, title: "Name" },
        { select: 2, title: "Employee_designation" },
        { select: 3, title: "Email" },
        { select: 4, title: "Contact_number" },
        {
          select: 5,
          title: "CheckBox",
          render: function (data, cell, row) {
            return `<input type="checkbox" class="user-checkbox" data-id="${row[0]}" />`;
          },
        },
      ],
    });
  
    let dataTable;
  
    function fetchData(query = "") {
      console.log("fetching data");
      fetch(`api/inactive_users/?search=${query}`)
        .then((response) => response.json())
        .then((data) => {
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
  