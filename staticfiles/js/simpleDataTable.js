document.addEventListener("DOMContentLoaded", function () {
  const myTable = document.querySelector("#datatablesSimple");

  const generateDataTableConfig = (data) => ({
    data: data,
    columns: [
      { select: 0, sort: "asc", title: "equipment_id" },
      { select: 1, title: "equipment_name" },
      { select: 2, title: "Employee_designation" },
      { select: 3, title: "Contact_no" },
      { select: 4, title: "Checkbox" },
    ],
  });

  let dataTable;

  function fetchData(query = "") {
    console.log("fetching data");
    fetch(`/api/inactive_users/?search=${query}`)
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
          .querySelector(".dataTable-input")
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
