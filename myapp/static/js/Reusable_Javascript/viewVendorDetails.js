
  showVendorDetails = (vendorId) => {
    window.makeRequest({
      url: `/api/vendor_details/?vendor_id=${vendorId}`,
      method: "GET",
      onSuccess: (data) => {
        if (data.status) {
          document.getElementById("vendor_id_d").value = data.vendor_id;
          document.getElementById("Vendor_name_d").value = data.name;
          document.getElementById("Vendor_parts_d").value = data.parts;
          document.getElementById("Vendor_email_d").value = data.email;
          document.getElementById("Vendor_contact_no_d").value =
            data.contact_no;
          document.getElementById("Vendor_website_link_d").value =
            data.website_link;
          document.getElementById("Vendor_address_d").value = data.address;
        } else {
          alert("Error in fetching data");
        }
      },
      onNetError: (error) => {
        console.error("Error fetching data:", error);
      },
      onErrorMessage: (message) => {
        alert(message);
      },
    });
  };

  editVendor = () => {
    document.getElementById("vendor_id_d").readOnly = true;
    document.getElementById("Vendor_name_d").readOnly = false;
    document.getElementById("Vendor_parts_d").readOnly = false;
    document.getElementById("Vendor_email_d").readOnly = false;
    document.getElementById("Vendor_contact_no_d").readOnly = false;
    document.getElementById("Vendor_website_link_d").readOnly = false;
    document.getElementById("Vendor_address_d").readOnly = false;
    // Show the Save button and the image file input
    document.querySelector("#saveButton").style.display = "inline-block";

    // Hide the Edit button
    document.querySelector("#editButton").style.display = "none";
  };

  saveVendor = function () {
    const data = new FormData();
    data.append("vendor_id", document.querySelector("#vendor_id_d").value);
    data.append("name", document.querySelector("#Vendor_name_d").value);
    data.append("parts", document.querySelector("#Vendor_parts_d").value);
    data.append("email", document.querySelector("#Vendor_email_d").value);
    data.append(
      "contact_no",
      document.querySelector("#Vendor_contact_no_d").value
    );
    data.append(
      "website_link",
      document.querySelector("#Vendor_website_link_d").value
    );
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
          vendorId = document.querySelector("#vendor_id_d").value;
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
      },
    });
  };

  //if the user closes the modal while editing, reset the form
  document
    .querySelector("#viewVendorModal")
    .addEventListener("hidden.bs.modal", function () {
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
      vendorId = document.querySelector("#vendor_id_d").value;
      showVendorDetails(vendorId);
    });

