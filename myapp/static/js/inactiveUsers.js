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
      { select: 5, title: "CheckBox", html: true },
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
        console.log("Data:", data);
        
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

document.querySelector("#activeButton").addEventListener("click", function () {
  const checkboxes = document.querySelectorAll("input.user-checkbox:checked");
  console.log("Checked checkboxes:", checkboxes);

  const ids = Array.from(checkboxes).map((checkbox) => {
    console.log("Checkbox:", checkbox);
    return checkbox.dataset.id;
  });

  // Call your activate API endpoint with ids array
  console.log("Activate user ids:", ids);

  if (ids.length > 0) {
    fetch(`api/activate_users/?ids[]=${ids.join("&ids[]=")}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.status === 'success') {
          alert(data.message);
          // Reload the table data
          fetchData();
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error activating users:", error);
        alert("Error activating users. Please try again.");
      });
  } else {
    alert("Please select at least one user to activate.");
  }
});

