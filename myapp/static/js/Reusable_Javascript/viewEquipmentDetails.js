
  resetEquipmentModal = function () {
    // Hide the Save button
    document.querySelector("#saveButton").style.display = "none";
    document.querySelector("#equipment_image_file").value = "";
    document.querySelector("#purchase_receipt_file").value = "";
    // Hide the image file input
    document.querySelector("#equipment_image_upload").style.display = "none";
    document.querySelector("#purchase_receipt_upload").style.display = "none";

    //don't reset the values of the input fields

    // Make all input fields read only again
    document.querySelector("#equipment_name_d").readOnly = true;
    document.querySelector("#category_d").readOnly = true;
    document.querySelector("#location_d").readOnly = true;

    //make edit button visible
    document.querySelector("#editButton").style.display = "inline-block";
  };
  window.showEquipmentDetails = function (equipmentId) {
    window.makeRequest({
      url: `/api/equipment_details/?equipment_id=${equipmentId}`,
      method: "GET",
      onSuccess: (data) => {
        if (data.status) {
          document.querySelector("#equipment_id_d").value = data.equipment_id;
          document.querySelector("#equipment_name_d").value =
            data.equipment_name;
          document.querySelector("#category_d").value = data.category;
          document.querySelector("#assigned_user_d").value = data.assigned_user;
          document.querySelector("#last_assigned_d").value = data.last_assigned;
          document.querySelector("#location_d").value = data.location;
          document.querySelector("#equipment_image_d").href = data.image_url;
          // Store the equipmentId for later use
          document.querySelector("#equipment_id").dataset.id = equipmentId;
          // Where you're setting the modal data
          document.getElementById("purchase_receipt_d").href =
            data.purchase_receipt_url;
        } else {
          console.error("Error fetching equipment details:", data.error);
        }
      },
      onErrorMessage: (errorMessage) => {
        console.error("Error fetching equipment details:", errorMessage);
      },
      onNetError: (error) => {
        console.error("Error fetching equipment details:", error);
      },
    });
  };

  window.editEquipment = function () {
    // Remove readonly from all input fields
    document.querySelector("#equipment_id_d").readOnly = true;
    document.querySelector("#equipment_name_d").readOnly = false;
    document.querySelector("#category_d").readOnly = false;
    document.querySelector("#assigned_user_d").readOnly = true;
    document.querySelector("#last_assigned_d").readOnly = true;
    document.querySelector("#location_d").readOnly = false;

    console.log("editEquipment");

    // Show the Save button and the image file input
    document.querySelector("#saveButton").style.display = "inline-block";

    // Hide the Edit button
    document.querySelector("#editButton").style.display = "none";
    // Show the Save button and the image file input
    document.querySelector("#equipment_image_upload").style.display = "block";
    document.querySelector("#purchase_receipt_upload").style.display = "block";
  };

  //this cannot be converted to json because it has a file
  window.saveEquipment = function () {
    console.log("saving Equipment");
    const data = new FormData();

    // Retrieve the File objects for the images
    const equipmentImageFile = document.querySelector("#equipment_image_file")
      .files[0];
    const purchaseReceiptFile = document.querySelector("#purchase_receipt_file")
      .files[0];

    // Check the sizes of the images
    const maxSize = 0.5 * 1024 * 1024; // 0.5 MB in bytes

    if (equipmentImageFile) {
      // Check if the file size is less than 0.5 MB
      if (equipmentImageFile.size > 0.5 * 1024 * 1024) {
        alert(
          "The equipment image file is too large. Please upload a file smaller than 0.5 MB."
        );
        return;
      }
      if (!equipmentImageFile.name.match(/\.(jpg|jpeg|png)$/)) {
        alert(
          "Invalid file type for equipment image. Please upload a .jpg or .png file."
        );
        return;
      }
      data.append("image", equipmentImageFile);
    }

    if (purchaseReceiptFile) {
      // Check if the file size is less than 0.5 MB
      if (purchaseReceiptFile.size > 0.5 * 1024 * 1024) {
        alert(
          "The purchase receipt file is too large. Please upload a file smaller than 0.5 MB."
        );
        return;
      }
      if (!purchaseReceiptFile.name.match(/\.(jpg|jpeg|png)$/)) {
        alert(
          "Invalid file type for purchase receipt. Please upload a .jpg or .png file."
        );
        return;
      }
      data.append("purchase_receipt", purchaseReceiptFile);
    }

    data.append(
      "equipment_id",
      document.querySelector("#equipment_id_d").value
    );
    data.append(
      "equipment_name",
      document.querySelector("#equipment_name_d").value
    );
    data.append("category", document.querySelector("#category_d").value);
    data.append("location", document.querySelector("#location_d").value);

    window.makeRequest({
      url: "/api/update_equipment/",
      method: "POST",
      body: data,
      onSuccess: (data) => {
        alert(data.message);
        resetEquipmentModal();
        equipmentId = document.querySelector("#equipment_id_d").value;
        showEquipmentDetails(equipmentId);
      },
      onErrorMessage: (errorMessage) => {
        alert(errorMessage);
      },
      onNetError: (error) => {
        alert("Network error. Please try again later.");
      },
    });
  };

  var modal = document.getElementById("equipmentModal");

  modal.addEventListener("hidden.bs.modal", function (event) {
    resetEquipmentModal();
  });

