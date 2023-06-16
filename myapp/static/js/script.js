window.addEventListener("DOMContentLoaded", (event) => {
  // Toggle the side navigationxw
  const sidebarToggle = document.body.querySelector("#sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", (event) => {
      event.preventDefault();
      document.body.classList.toggle("sb-sidenav-toggled");
      localStorage.setItem(
        "sb|sidebar-toggle",
        document.body.classList.contains("sb-sidenav-toggled")
      );
    });
  }
});

window.showAlert = function (id, type, message) {
  let alertDiv = document.getElementById(id);
  let alertText = alertDiv.querySelector("#customAlertText");

  // Set the text
  alertText.textContent = message;

  // Add the relevant classes
  alertDiv.classList.add(type); // type could be 'success', 'info', 'warning'

  // Make the alert visible
  alertDiv.style.display = "block";
};

window.getCookie = function (name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};



//*methods for fetching data for datatables
window.generateDataTableConfig = (columns) => (data) => ({
    data: data,
    columns: columns,
});


window.fetchData = function (
    tableId,
    url,
    searchUrl,
    columns,
    query = ""
) {
    console.log("fetching data");
    fetch(`${url}?search=${query}`)
        .then((response) => response.json())
        .then((data) => {
            console.log("table refreshed");
            const myTable = document.querySelector(tableId);
            let dataTable;
            if (dataTable) {
                dataTable.destroy();
            }
            dataTable = new simpleDatatables.DataTable(
                myTable,
                generateDataTableConfig(columns)(data)
            );
            document
                .querySelector(".datatable-input")
                .addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        const query = event.target.value;
                        if (query.length >= 1 || query.length === 0) {
                            window.fetchData(tableId, searchUrl, searchUrl, columns, query);
                        }
                    }
                });
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}


//methods for fetching data using fetch api
window.makeRequest = function({ url, method, body, onSuccess, onNetError, onErrorMessage }) {
    const csrftoken = window.getCookie('csrftoken');
  
    return fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: body,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            console.log(error);
            if (error.message) {
              if (onErrorMessage) onErrorMessage(error.message);
              return Promise.resolve();
            } else {
              throw new Error("Something went wrong");
            }
          });
        } else {
          return response.json();
        }
      })
      .then((data) => {
        if (onSuccess) onSuccess(data);
      })
      .catch((error) => {
        console.log(error);
        if (onNetError) onNetError(error);
      });
  }
  



