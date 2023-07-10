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

window.removeAlert = function (id) {
  let alertDivGlobal = document.getElementById(id);
  let alertText = alertDivGlobal.querySelector("#customAlertText");

  // Set the text
  alertText.textContent = "";
  alertDivGlobal.style.display = "none";
  alertDivGlobal.classList.remove("success", "info", "warning");
};

window.showAlert = function (id, type, message) {
  let alertDivGlobal = document.getElementById(id);
  let alertText = alertDivGlobal.querySelector("#customAlertText");

  // Set the text
  alertText.textContent = message;

  // Add the relevant classes
  alertDivGlobal.classList.add(type); // type could be 'success', 'info', 'warning'

  // Make the alert visible
  alertDivGlobal.style.display = "block";
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
          if (error.message) {
            if (onErrorMessage) onErrorMessage(error.message);
          }
          return Promise.reject(new Error("HTTP response was not OK")); // Reject the promise instead of throwing an error
        });
      } else {
        return response.json().then((data) => {
          if (onSuccess) onSuccess(data);
        });
      }
    })
    .catch((error) => {
      // Check if the error is a network error (i.e., not an application error)
      if (error.message !== "HTTP response was not OK") {
        if (onNetError) onNetError(error);
      }
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
  query = "",
  tablenum = 1
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
      if (!element) {
        element = document.querySelectorAll(".datatable-input")[tablenum - 1];
      }
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
                query,
                tablenum
              );
            }
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
  console.log(filters);
  let params = new URLSearchParams();
  for (let key in filters) {
    if (filters[key]) {
      let value = filters[key];
      // If the value is an object, convert it to a JSON string
      if (typeof value === "object" && value !== null) {
        value = JSON.stringify(value);
      }
      params.append(key, value);
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
            console.log(query);
            if (query.length >= 1 || query.length === 0) {
              filters.search = query; // Add the search query to the filters
              console.log("filters", filters);
              window.fetchDataFilter(
                tableId,
                myTable,
                searchUrl,
                searchUrl,
                columns,
                filters
              );
            }
          } else {
            console.log("element not found");
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};
window.createAlertDiv = function () {
  // Create the overlay element
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.style.position = 'fixed';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.4)';
  overlay.style.zIndex = '9998'; // Lower than alertDivGlobal
  overlay.style.display = 'none'; // Initially hidden

  // Create the alertDivGlobal element
  const alertDivGlobal = document.createElement('div');
  alertDivGlobal.id = 'alertDivGlobal';
  alertDivGlobal.style.position = 'fixed';
  alertDivGlobal.style.maxWidth = '50%';
  alertDivGlobal.style.top = '50%';
  alertDivGlobal.style.left = '50%';
  alertDivGlobal.style.transform = 'translate(-50%, -50%)'; // Center on the page
  alertDivGlobal.style.backgroundColor = '#f8f9fa';
  alertDivGlobal.style.borderRadius = '5px';
  alertDivGlobal.style.padding = '20px';
  alertDivGlobal.style.zIndex = '9999'; // Higher than overlay
  alertDivGlobal.style.display = 'none'; // Initially hidden
  //add the border to the alertDivGlobal


  // Create the alert message paragraph
  const alertMessage = document.createElement('p');
  alertMessage.id = 'alertMessage';
  alertMessage.style.fontSize = '20px';

  // Create the "OK" button
  const okButton = document.createElement('button');
  okButton.innerText = 'OK';
  okButton.style.marginTop = '20px';
  okButton.style.backgroundColor = 'green'; // Set the button color to brown
  okButton.style.color = 'white'; // Set the button text color to white
  okButton.style.border = 'none'; // Remove the default button border
  okButton.style.padding = '5px 10px'; // Add some padding to the button
  okButton.style.fontSize = '20px'; // Increase the font size
  okButton.style.cursor = 'pointer'; // Change the cursor when hovering over the button
  okButton.style.display = 'block'; // Make the button a block-level element
  okButton.style.margin = '0 auto'; // Center the button

  // Append all elements
  alertDivGlobal.appendChild(alertMessage);
  alertDivGlobal.appendChild(okButton);
  document.body.appendChild(overlay);
  document.body.appendChild(alertDivGlobal);

  // Hide alert when 'OK' button is clicked
  okButton.addEventListener('click', window.hideAlertGlobal);
}


window.showAlertGlobal = function (message,divtype) {
  // Get the alertDivGlobal, alertMessage, and overlay elements
  const alertDivGlobal = document.getElementById('alertDivGlobal');
  const alertMessage = alertDivGlobal.querySelector('#alertMessage');
  const overlay = document.getElementById('overlay');
  if(divtype == 'error'){
    //change the background color of the alertDivGlobal
    alertDivGlobal.style.backgroundColor = '#F8D7D9';
    //change the background color of the button to red
    const okButton = document.querySelector('#alertDivGlobal button');
    okButton.style.backgroundColor = '#FB617F';

  }else{
    alertDivGlobal.style.backgroundColor = '#D4EDD9';
    //change the background color of the button to green
    const okButton = document.querySelector('#alertDivGlobal button');
    okButton.style.backgroundColor = 'green';

  }

  // Set the alert message and show the alertDivGlobal and overlay
  alertMessage.innerText = message;
  alertDivGlobal.style.display = 'block';
  overlay.style.display = 'block';
  
}

window.hideAlertGlobal = function () {
  // Get the alertDivGlobal and overlay elements
  const alertDivGlobal = document.getElementById('alertDivGlobal');
  const overlay = document.getElementById('overlay');

  // Hide the alertDivGlobal and overlay
  alertDivGlobal.style.display = 'none';
  overlay.style.display = 'none';
}

// First, create the alert div
createAlertDiv();

