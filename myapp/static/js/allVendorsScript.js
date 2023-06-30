document.addEventListener("DOMContentLoaded", function () {
  const myTable = document.querySelector("#datatablesSimple");
  const columns = [
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
  ];
  window.fetchData("datatablesSimple",myTable, "/api/vendors/", "/api/vendors/", columns);


showVendorDetails = (vendorId) => {
  window.makeRequest({
    url: `/api/vendor_details/?vendor_id=${vendorId}`,
    method: "GET",
    onSuccess: (data) => {
      if(data.status) {
        document.getElementById("vendor_id_d").value=data.vendor_id;
        document.getElementById("Vendor_name_d").value=data.name;
        document.getElementById("Vendor_parts_d").value=data.parts;
        document.getElementById("Vendor_email_d").value=data.email;
        document.getElementById("Vendor_contact_no_d").value=data.contact_no;
        document.getElementById("Vendor_website_link_d").value=data.website_link;
        document.getElementById("Vendor_address_d").value=data.address;
      } else {
        alert("Error in fetching data");
      }
    },
    onNetError: (error) => {
      console.error("Error fetching data:", error);
    },
    onErrorMessage: (message) => {
      alert(message);
    }
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
  const data = new FormData();
  data.append("vendor_id", document.querySelector("#vendor_id_d").value);
  data.append("name", document.querySelector("#Vendor_name_d").value);
  data.append("parts", document.querySelector("#Vendor_parts_d").value);
  data.append("email", document.querySelector("#Vendor_email_d").value);
  data.append("contact_no", document.querySelector("#Vendor_contact_no_d").value);
  data.append("website_link", document.querySelector("#Vendor_website_link_d").value);
  data.append("address", document.querySelector("#Vendor_address_d").value);

  window.makeRequest({
    url: "/api/update_vendor/",
    method: "POST",
    body: data,
    onSuccess: (data) => {
      if (data.status) {
        console.log("Vendor updated successfully");
        document.querySelector("#saveButton").style.display = "none";
        document.querySelector("#editButton").style.display = "inline-block";
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
    },
    onErrorMessage: (message) => {
      console.error("Error updating vendor:", message);
    },
    onNetError: (error) => {
      console.error("Error updating vendor:", error);
    }
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

  console.log("Delete vendor ids:", ids);

  if (ids.length > 5) {
    alert("You cannot delete more than 5 vendors at a time.");
  } else if (ids.length > 0) {
    window.makeRequest({
      url: `/api/delete_vendors/?ids[]=${ids.join("&ids[]=")}`,
      method: "DELETE",
      onSuccess: (data) => {
        console.log(data);
  
        if (data.status === "success") {
          alert(data.message);
          window.fetchData("datatablesSimple",myTable, "/api/vendors/", "/api/vendors/", columns);
        } else {
          alert("Error: " + data.message);
        }
      },
      onErrorMessage: (message) => {
        console.error("Error deleting vendors:", message);
        alert("Error deleting vendors. Please try again.");
      },
      onNetError: (error) => {
        console.error("Error deleting vendors:", error);
        alert("Error deleting vendors. Please try again.");
      }
    });
  } else {
    alert("Please select at least one vendor to delete.");
  }
});
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

    window.makeRequest({
      url: "/api/addVendor/",
      method: "POST",
      body: formData,
      onSuccess: function (data) {
        alert("Vendor added successfully");
        $("#addVendorModal").modal("hide");
        window.fetchData("datatablesSimple",myTable, "/api/vendors/", "/api/vendors/", columns);;
      },
      onErrorMessage: function (message) {
        alert("Error: " + message);
      },
      onNetError: function (error) {
        alert("Error: " + error);
      }
    });
  });
});