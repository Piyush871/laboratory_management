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

// window.fetchData = function (
//     tableId,
//     url,
//     searchUrl,
//     columns,
//     query = ""
// ) {
//     console.log("fetching data");
//     fetch(`${url}?search=${query}`)
//         .then((response) => response.json())
//         .then((data) => {
//             console.log("table refreshed");
//             const myTable = document.querySelector(tableId);
//             let dataTable ;
//             if (dataTable) {
//                 dataTable.destroy();
//             }
//             dataTable = new simpleDatatables.DataTable(
//                 myTable,
//                 window.generateDataTableConfig(columns)(data)
//             );
//             document
//                 .querySelector(".datatable-input")
//                 .addEventListener("keydown", (event) => {
//                     if (event.key === "Enter") {
//                         const query = event.target.value;
//                         if (query.length >= 1 || query.length === 0) {
//                             window.fetchData(tableId, searchUrl, searchUrl, columns, query);
//                         }
//                     }
//                 });
//         })
//         .catch((error) => {
//             console.error("Error fetching data:", error);
//         });
// }

//methods for fetching data using fetch api
window.makeRequest = function ({
  url,
  method,
  body,
  onSuccess,
  onNetError,
  onErrorMessage,
}) {
  const csrftoken = window.getCookie("csrftoken");

  return fetch(url, {
    method: method,
    headers: {
      "X-CSRFToken": csrftoken,
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
};
//*methods for fetching data for datatables
window.dataTables = {};
window.generateDataTableConfig = (columns) => (data) => ({
  data: data,
  columns: columns,
});

window.fetchData = function (
  tableId,
  myTable,
  url,
  searchUrl,
  columns,
  query = ""
) {
  console.log("fetching data");
  console.log(url);
  fetch(`${url}?search=${query}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("table refreshed");

      console.log(window.dataTables[tableId]);
      if (window.dataTables[tableId]) {
        console.log("destroying table");
        window.dataTables[tableId].destroy();
        delete window.dataTables[tableId];
      }
      window.dataTables[tableId] = new simpleDatatables.DataTable(
        myTable,
        window.generateDataTableConfig(columns)(data)
      );

      var element = document.querySelector(
        `input[aria-controls=${tableId}].datatable-input`
      );
      if (element) {
        element.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            const query = event.target.value;
            if (query.length >= 1 || query.length === 0) {
              window.fetchData(
                tableId,
                myTable,
                searchUrl,
                searchUrl,
                columns,
                query
              );
            }
          }
          else{
            console.log("element not found");
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

window.fetchDataFilter = function (
  tableId,
  myTable,
  url,
  searchUrl,
  columns,
  filters = {}
) {
  console.log("fetching data");
  console.log(url);

  let params = new URLSearchParams();
  for (let key in filters) {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  }
  console.log(`${url}?${params.toString()}`);
  fetch(`${url}?${params.toString()}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("table refreshed");

      console.log(window.dataTables[tableId]);
      if (window.dataTables[tableId]) {
        console.log("destroying table");
        window.dataTables[tableId].destroy();
        delete window.dataTables[tableId];
      }

      window.dataTables[tableId] = new simpleDatatables.DataTable(
        myTable,
        window.generateDataTableConfig(columns)(data)
      );

      var element = document.querySelector(
        `input[aria-controls=${tableId}].datatable-input`
      );
      if (element) {
        element.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            const query = event.target.value;
            if (query.length >= 1 || query.length === 0) {
              filters.search = query;  // Add the search query to the filters
              window.fetchData(
                tableId,
                myTable,
                searchUrl,
                searchUrl,
                columns,
                filters
              );
            }
          }
          else{
            console.log("element not found");
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};
