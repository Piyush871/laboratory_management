document.addEventListener("DOMContentLoaded", function () {
  const myTable = document.querySelector("#datatablesSimple");

  const generateDataTableConfig = (data) => ({
    data: data,
    columns: [
      { select: 0, sort: "asc", title: "Vendor_id" }, 
      { select: 1, title: "Name" },
      { select: 2, title: "Parts" },
      { select: 3, title: "Contact_no" },
      {
        select: 4,
        title: "Website_link",
        render: function (data, cell, _dataIndex, _cellIndex) {
          const website_link = cell.childNodes[0].data;
          return `<a href="${website_link}" target="_blank">${website_link}</a>`;
        },
      },
      {
        select: 5,
        title: "viewDetails",
        render: function (data, cell, _dataIndex, _cellIndex) {
          const vendorId = cell.childNodes[0].data;
          return `<a href="#" data-bs-toggle="modal" data-bs-target="#viewVendorModal" onclick="showVendorDetails(${vendorId})">View Details</a>`;
        },
      },
      { select: 6, title: "CheckBox", html: true },
    ],
  });

  let dataTable;

  function fetchData(query = "") {
    console.log("fetching data");
    fetch(`/api/vendors/?search=${query}`)
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

showVendorDetails = (vendorId) => {
  fetch(`/api/vendor_details/?vendor_id=${vendorId}`)
  .then((response) => response.json())
  .then((data) => {
    if(data.status)
    {
      document.getElementById("vendor_id_d").value=data.vendor_id;
      document.getElementById("Vendor_name_d").value=data.name;
      document.getElementById("Vendor_parts_d").value=data.parts;
      document.getElementById("Vendor_email_d").value=data.email;
      document.getElementById("Vendor_contact_no_d").value=data.contact_no;
      document.getElementById("Vendor_website_link_d").value=data.website_link;
      document.getElementById("Vendor_address_d").value=data.address;
    }
    else
    {
      alert("Error in fetching data");
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

}

editVendor=()=>{
  document.getElementById("vendor_id_d").readOnly=true;
      document.getElementById("Vendor_name_d").readOnly=false;
      document.getElementById("Vendor_parts_d").readOnly=false;
      document.getElementById("Vendor_email_d").readOnly=false;
      document.getElementById("Vendor_contact_no_d").readOnly=false;
      document.getElementById("Vendor_website_link_d").readOnly=false;
      document.getElementById("Vendor_address_d").readOnly=false;
      // Show the Save button and the image file input
      document.querySelector("#saveButton").style.display = "inline-block";

      // Hide the Edit button
      document.querySelector("#editButton").style.display = "none";

}


saveVendor = function () {
  // Fetch the CSRF token from the csrftoken cookie
  const csrftoken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken"))
    .split("=")[1];

  const data = new FormData();
  data.append("vendor_id", document.querySelector("#vendor_id_d").value);
  data.append("name", document.querySelector("#Vendor_name_d").value);
  data.append("parts", document.querySelector("#Vendor_parts_d").value);
  data.append("email", document.querySelector("#Vendor_email_d").value);
  data.append("contact_no", document.querySelector("#Vendor_contact_no_d").value);
  data.append("website_link", document.querySelector("#Vendor_website_link_d").value);
  data.append("address", document.querySelector("#Vendor_address_d").value);

  fetch("/api/update_vendor/", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrftoken,
    },
    body: data,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        console.log("Vendor updated successfully");
        // Hide the Save button
        document.querySelector("#saveButton").style.display = "none";
        // Show the Edit button
        document.querySelector("#editButton").style.display = "inline-block";
        // Make all input fields read only again
        document.querySelector("#Vendor_name_d").readOnly = true;
        document.querySelector("#Vendor_parts_d").readOnly = true;
        document.querySelector("#Vendor_email_d").readOnly = true;
        document.querySelector("#Vendor_contact_no_d").readOnly = true;
        document.querySelector("#Vendor_website_link_d").readOnly = true;
        document.querySelector("#Vendor_address_d").readOnly = true;
        vendorId=document.querySelector("#vendor_id_d").value;
        showVendorDetails(vendorId);
      } else {
        console.error("Error updating vendor:", data.error);
      }
    })
    .catch((error) => {
      console.error("Error updating vendor:", error);
    });
};

//if the user closes the modal while editing, reset the form
document.querySelector("#viewVendorModal").addEventListener("hidden.bs.modal", function () {
  // Hide the Save button
  document.querySelector("#saveButton").style.display = "none";
  // Show the Edit button
  document.querySelector("#editButton").style.display = "inline-block";
  // Make all input fields read only again
  document.querySelector("#Vendor_name_d").readOnly = true;
  document.querySelector("#Vendor_parts_d").readOnly = true;
  document.querySelector("#Vendor_email_d").readOnly = true;
  document.querySelector("#Vendor_contact_no_d").readOnly = true;
  document.querySelector("#Vendor_website_link_d").readOnly = true;
  document.querySelector("#Vendor_address_d").readOnly = true;
  vendorId=document.querySelector("#vendor_id_d").value;
  showVendorDetails(vendorId);
});


//delete the selected vendors by the checkbox if the user clicks on the delete button
if (document.querySelector("#deleteButton"))
{
document
.querySelector("#deleteButton")
.addEventListener("click", function () {
  const checkboxes = document.querySelectorAll(
    "input.user-checkbox:checked"
  );
  console.log("Checked checkboxes:", checkboxes);

  const ids = Array.from(checkboxes).map((checkbox) => {
    console.log("Checkbox:", checkbox);
    return checkbox.dataset.id;
  });

  // Call your delete API endpoint with ids array
  console.log("Delete vendor ids:", ids);

  if (ids.length > 0) {
    fetch(`api/delete_vendors/?ids[]=${ids.join("&ids[]=")}`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.status === "success") {
          alert(data.message);

          // Reload the table data
          fetchData();
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error deleting vendors:", error);
        alert("Error deleting vendors. Please try again.");
      });
  } else {
    alert("Please select at least one vendor to delete.");
  }
});
}
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


document
  .getElementById("addVendorForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var formData = new FormData();
    formData.append(
      "name",
      document.getElementById("VendorName").value
    );
    formData.append(
      "parts",
      document.getElementById("parts").value
    );
    formData.append("email", document.getElementById("email").value);
    formData.append(
      "contact_no",
      document.getElementById("contactNumber").value
    );
    formData.append("address", document.getElementById("Address").value);
    formData.append(
      "website_link",
      document.getElementById("Website_link").value
    );

    fetch("/api/addVendor/", {
      method: "POST",
      body: formData,
      headers: {
        "X-CSRFToken": getCookie("csrftoken"), // function to get the cookie value
      },
    })
      .then(function (response) {
        if (response.ok) {
          alert("Vendor added successfully");
          $("#addVendorModal").modal("hide");
          fetchData();
        } else {
          alert("Error: " + response.statusText);
        }
      })
      .catch(function (error) {
        alert("Error: " + error);
      });
  });
