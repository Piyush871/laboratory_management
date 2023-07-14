
  if (document.querySelector("#deleteButton")) {
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
                window.fetchData(
                  "datatablesSimple",
                  myTable,
                  "/api/vendors/",
                  "/api/vendors/",
                  columns
                );
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
            },
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
      formData.append("name", document.getElementById("VendorName").value);
      formData.append("parts", document.getElementById("parts").value);
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
          window.fetchData(
            "datatablesSimple",
            myTable,
            "/api/vendors/",
            "/api/vendors/",
            columns
          );
        },
        onErrorMessage: function (message) {
          alert("Error: " + message);
        },
        onNetError: function (error) {
          alert("Error: " + error);
        },
      });
    });

