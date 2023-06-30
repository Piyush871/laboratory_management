document.addEventListener("DOMContentLoaded", function () {
  const myTable = document.querySelector("#inactive_users_table");
  const columns = [
    { select: 0, sort: "asc", title: "employee_id" },
    { select: 1, title: "Name" },
    { select: 2, title: "Employee_designation" },
    { select: 3, title: "Email" },
    { select: 4, title: "Contact_number" },
    { select: 5, title: "CheckBox", html: true },
  ];

  window.fetchData("inactive_users_table",myTable, "/api/inactive_users/", "/api/inactive_users/", columns);

  document
  .querySelector("#activeButton")
  .addEventListener("click", function () {
    const checkboxes = document.querySelectorAll(
      "input.user-checkbox:checked"
    );
    console.log("Checked checkboxes:", checkboxes);

    const ids = Array.from(checkboxes).map((checkbox) => {
      console.log("Checkbox:", checkbox);
      return checkbox.dataset.id;
    });

    // Call your activate API endpoint with ids array
    console.log("Activate user ids:", ids);

    if (ids.length > 0) {
      window.makeRequest({
        url: `api/activate_users/?ids[]=${ids.join("&ids[]=")}`,
        method: "GET",
        onSuccess: (data) => {
          console.log(data);
          if (data.status === "success") {
            alert(data.message);
            // Reload the table data
            console.log("reloading both the tables");
            window.fetchData("inactive_users_table",myTable, "/api/inactive_users/", "/api/inactive_users/", columns);
            window.fetchData("active_user_table",myActiveTable, "/api/active_users/", "/api/active_users/", columns,"",2);

          } else {
            alert("Error: " + data.message);
          }
        },
        onNetError: (error) => {
          console.error("Error activating users:", error);
          alert("Error activating users. Please try again.");
        }
      });
    } else {
      alert("Please select at least one user to activate.");
    }
  });

  document
  .querySelector("#inactiveContainer #deleteButton")
  .addEventListener("click", function () {
    const checkboxes = document.querySelectorAll(
      "#inactiveContainer input.user-checkbox:checked"
    );
    console.log("Checked checkboxes:", checkboxes);

    const ids = Array.from(checkboxes).map((checkbox) => {
      console.log("Checkbox:", checkbox);
      return checkbox.dataset.id;
    });

    //should not be able to delete more than 5 users at a time
    if (ids.length > 5) {
      alert("You cannot delete more than 5 users at a time");
      return;
    }
    if (ids.length > 0) {
      window.makeRequest({
        url: `api/delete_users/?ids[]=${ids.join("&ids[]=")}`,
        method: "GET",
        onSuccess: (data) => {
          console.log(data);
          if (data.status === "success") {
            alert(data.message);
            // Reload the table data
            window.fetchData("inactive_users_table",myTable, "/api/inactive_users/", "/api/inactive_users/", columns);
          } else {
            alert("Error: " + data.message);
          }
        },
        onNetError: (error) => {
          console.error("Error deleting users:", error);
          alert("Error deleting users. Please try again.");
        },
        onErrorMessage: (message) => {
          console.error("Server returned error:", message);
        }
      });
    } else {
      alert("Please select at least one user to delete.");
    }
  });


  document
    .getElementById("showInactive")
    .addEventListener("click", function () {
      document.getElementById("inactiveContainer").style.display = "block";
      document.getElementById("activeContainer").style.display = "none";
      this.classList.add("btn-primary");
      document.getElementById("showActive").classList.remove("btn-primary");
      document.getElementById("template_heading").innerText="InactiveUsers"
    });

  document.getElementById("showActive").addEventListener("click", function () {
    document.getElementById("inactiveContainer").style.display = "none";
    document.getElementById("activeContainer").style.display = "block";
    this.classList.add("btn-primary");
    document.getElementById("showInactive").classList.remove("btn-primary");
    document.getElementById("template_heading").innerText="ActiveUsers"
  });
  
  //code for the active users table
  const myActiveTable = document.querySelector("#active_user_table");

  window.fetchData("active_user_table",myActiveTable, "/api/active_users/", "/api/active_users/", columns,"",2);


  document.querySelector("#activeContainer #deleteButton").addEventListener("click", function () {
    const checkboxes = document.querySelectorAll(
      "#active_user_table input.user-checkbox:checked"
    );
    console.log("Checked checkboxes (active):", checkboxes);
  
    const ids = Array.from(checkboxes).map((checkbox) => {
      console.log("Checkbox (active):", checkbox);
      return checkbox.dataset.id;
    });
  
    // Call your delete API endpoint with ids array
    console.log("Delete active user ids:", ids);
  
    if (ids.length > 0) {
      window.makeRequest({
        url: `api/delete_users/?ids[]=${ids.join("&ids[]=")}`,
        method: "GET",
        onSuccess: (data) => {
          console.log(data);
          if (data.status === "success") {
            alert(data.message);
            // Reload the active users table data
            window.fetchData("active_user_table",myActiveTable, "/api/active_users/", "/api/active_users/", columns,"",2);
          } else {
            alert("Error: " + data.message);
          }
        },
        onNetError: (error) => {
          console.error("Error deleting active users:", error);
          alert("Error deleting users. Please try again.");
        },
        onErrorMessage: (message) => {
          console.error("Server returned error:", message);
        }
      });
    } else {
      alert("Please select at least one active user to delete.");
    }
  });
  
  
});
