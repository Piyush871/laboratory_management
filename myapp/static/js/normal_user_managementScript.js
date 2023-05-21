document.addEventListener("DOMContentLoaded", function () {
  const myTable = document.querySelector("#inactive_users_table");
  const myActiveTable = document.querySelector("#active_user_table");

  // Function to generate configuration for DataTable
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

  // Function to fetch data from API
  function fetchData(url, table, dataTable) {
    console.log("fetching data");
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (dataTable) {
          dataTable.destroy();
        }
        console.log("Data:", data);
        // create DataTable and attach event listener to datatable-input
        dataTable = new simpleDatatables.DataTable(
          table,
          generateDataTableConfig(data)
        );
        attachSearchEvent(dataTable, url, table);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  // Function to attach search event listener to datatable-input
  function attachSearchEvent(dataTable, url, table) {
    document
      .querySelector(".datatable-input")
      .addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          const query = event.target.value;
          if (query.length >= 1 || query.length === 0) {
            const queryURL = `${url}?search=${query}`;
            fetchData(queryURL, table, dataTable);
          }
        }
      });
  }

  // Fetch inactive users initially
  fetchData("api/inactive_users/", myTable);

  // Fetch active users initially
  fetchData("api/active_users/", myActiveTable);

  // Function to handle User Status Change button clicks (active/delete)
  function handleUserStatusChange(
    buttonId,
    url,
    dataTable,
    fetchUrl,
    table,
    successMessage,
    errorMessage
  ) {
    document.querySelector(buttonId).addEventListener("click", function () {
      const checkboxes = document.querySelectorAll(
        "input.user-checkbox:checked"
      );
      console.log("Checked checkboxes:", checkboxes);

      const ids = Array.from(checkboxes).map((checkbox) => {
        console.log("Checkbox:", checkbox);
        return checkbox.dataset.id;
      });

      console.log("User ids:", ids);

      if (ids.length > 0) {
        fetch(`${url}?ids[]=${ids.join("&ids[]=")}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(data);

            if (data.status === "success") {
              alert(successMessage);
              fetchData(fetchUrl, table, dataTable);
            } else {
              alert("Error: " + data.message);
            }
          })
          .catch((error) => {
            console.error(errorMessage, error);
            alert(errorMessage + " Please try again.");
          });
      } else {
        alert("Please select at least one user to change status.");
      }
    });
  }

  // Attach event handlers to buttons
  handleUserStatusChange(
    "#activeButton",
    "api/activate_users/",
    undefined,
    "api/inactive_users/",
    myTable,
    "Users activated successfully!",
    "Error activating users:"
  );
  handleUserStatusChange(
    "#deleteButton",
    "api/delete_users/",
    undefined,
    "api/inactive_users/",
    myTable,
    "Users deleted successfully!",
    "Error deleting users:"
  );

  // Function to handle the switching between Active and Inactive users' views
  function handleViewSwitch(
    activeButtonId,
    inactiveButtonId,
    activeContainerId,
    inactiveContainerId,
    activeTitle,
    inactiveTitle
  ) {
    document
      .getElementById(activeButtonId)
      .addEventListener("click", function () {
        // Show Active users' table and hide Inactive users' table
        document.getElementById(inactiveContainerId).style.display = "none";
        document.getElementById(activeContainerId).style.display = "block";
        // Adjust button styles
        this.classList.add("btn-primary");
        document
          .getElementById(inactiveButtonId)
          .classList.remove("btn-primary");
        // Adjust template heading
        document.getElementById("template heading").innerText = activeTitle;
      });

    document
      .getElementById(inactiveButtonId)
      .addEventListener("click", function () {
        // Show Inactive users' table and hide Active users' table
        document.getElementById(inactiveContainerId).style.display = "block";
        document.getElementById(activeContainerId).style.display = "none";
        // Adjust button styles
        this.classList.add("btn-primary");
        document.getElementById(activeButtonId).classList.remove("btn-primary");
        // Adjust template heading
        document.getElementById("template heading").innerText = inactiveTitle;
      });
  }

  // Implement the handleViewSwitch
  handleViewSwitch(
    "showActive",
    "showInactive",
    "activeContainer",
    "inactiveContainer",
    "Active Users",
    "Inactive Users"
  );

  // Handle delete action for active users
  handleUserStatusChange(
    "#activeContainer #deleteButton",
    "api/delete_users/",
    undefined,
    "api/active_users/",
    myActiveTable,
    "Active users deleted successfully!",
    "Error deleting active users:"
  );
});
