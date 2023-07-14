//& table details

const myTable = document.querySelector("#datatablesSimple");

const columns = [
  { select: 0, sort: "asc", title: "request_id" },
  { select: 1, title: "Requested By" },
  { select: 2, title: "Item Name" },
  { select: 3, title: "Category" },
  { select: 4, title: "date of Request" },
  {
    select: 5,
    title: "viewDetails",
    render: function (data, cell, _dataIndex, _cellIndex) {
      console.log(cell.childNodes[0].data);
      const itemRequestId = cell.childNodes[0].data;
      return `<a href="#" data-bs-toggle="modal" data-bs-target="#ItemRequestsModal" onclick="showRequestDetails(${itemRequestId})">View Details</a>`;
    },
  },
  {
    select: 6,
    title: "CheckBox",
    html: true,
  },
];

window.fetchData(
  "datatablesSimple",
  myTable,
  "/api/equipmentRequests/",
  "/api/equipmentRequests/",
  columns
);

// Show the Edit button

function setEquipmentDetails(data) {
  document.querySelector("#item_request_id_d").value = data.item_request_id;
  document.querySelector("#item_request_requested_by").value =
    data.item_request_requested_by;
  document.querySelector("#item_request_name_d").value = data.item_request_name;
  document.querySelector("#category_d").value = data.category;
  document.querySelector("#location_d").value = data.location;
  document.querySelector("#date_of_request_d").value = data.date_of_request;
  document.querySelector("#date_of_purchase_d").value = data.date_of_purchase;
  document.querySelector("#item_request_image_d").href = data.image_url;
  document.querySelector("#purchase_receipt_d").href =
    data.purchase_receipt_url;
}

window.showRequestDetails = function (itemRequestId) {
  window.makeRequest({
    url: `/api/item_requests_details/?item_request_id=${itemRequestId}`,
    method: "GET",
    onSuccess: (data) => {
      if (data.status) {
        //editing accordint to the item request modal
        setEquipmentDetails(data);
        // Store the equipmentId for later use
        document.querySelector("#item_request_id_d").dataset.id = itemRequestId;
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

window.editRequest = function () {
  // Remove readonly from all input fields
  document.querySelectorAll("#ItemRequestsModal input").forEach((input) => {
    input.removeAttribute("readonly");
  });

  //make some fields readonly
  document.querySelector("#item_request_id_d").setAttribute("readonly", true);
  document
    .querySelector("#item_request_requested_by")
    .setAttribute("readonly", true);
  document.querySelector("#date_of_request_d").setAttribute("readonly", true);

  console.log("editEquipment");

  // Show the Save button and the image file input
  document.querySelector("#saveButton").style.display = "inline-block";

  // Hide the Edit button
  document.querySelector("#editButton").style.display = "none";
  // Show the Save button and the image file input
  document.querySelector("#item_request_image_upload").style.display = "block";
  document.querySelector("#purchase_receipt_upload").style.display = "block";
};

window.saveRequest = function () {
  console.log("saving Equipment");
  const data = new FormData();
  // Retrieve the File objects for the images
  const equipmentImageFile = document.querySelector("#item_request_image_file")
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

  data.append("id", document.querySelector("#item_request_id_d").value);
  data.append(
    "equipment_name",
    document.querySelector("#item_request_name_d").value
  );
  data.append("category", document.querySelector("#category_d").value);
  data.append("location", document.querySelector("#location_d").value);
  data.append(
    "date_of_purchase",
    document.querySelector("#date_of_purchase_d").value
  );
  //list the data to be sent to the server

  window.makeRequest({
    url: "/api/update_itemRequest/",
    method: "POST",
    body: data,
    onSuccess: (data) => {
      alert(data.message);
      resetItemRequestModal();
      equipmentId = document.querySelector("#item_request_id_d").value;
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

var modal = document.getElementById("ItemRequestsModal");

modal.addEventListener("hidden.bs.modal", function (event) {
  resetItemRequestModal();
});
resetItemRequestModal = function () {
  // Hide the Save button
  document.querySelector("#saveButton").style.display = "none";
  document.querySelector("#item_request_image_file").value = "";
  document.querySelector("#purchase_receipt_file").value = "";
  // Hide the image file input
  document.querySelector("#item_request_image_upload").style.display = "none";
  document.querySelector("#purchase_receipt_upload").style.display = "none";
  //don't reset the values of the input fields
  // Make all input fields read only again
  document.querySelectorAll("#ItemRequestsModal input").forEach((input) => {
    input.setAttribute("readonly", true);
  });
  //make edit button visible
  document.querySelector("#editButton").style.display = "inline-block";
};

//delete item request
document.querySelector("#deleteButton").addEventListener("click", () => {
  // Get the requestIds from the checkboxes
  const checkboxes = document.querySelectorAll(
    "input.user-checkbox:checked"
  );
  console.log("Checked checkboxes (active):", checkboxes);

  const ids = Array.from(checkboxes).map((checkbox) => {
    console.log("Checkbox (active):", checkbox);
    return checkbox.dataset.id;
  });
  //get the ids in the url of the request 
  window.makeRequest({
    url: `/api/delete_itemRequests/?ids[]=${ids.join(",")}`,
    method: "GET",
    onSuccess: (data) => {
      // reload the table
      window.fetchData(
        "datatablesSimple",
        myTable,
        "/api/equipmentRequests/",
        "/api/equipmentRequests/",
        columns
      );
    },
    onErrorMessage: (errorMessage) => {
      showAlertGlobal(errorMessage, "error");
    },
    onNetError: (error) => {
      showAlertGlobal("Network error. Please try again later.", "error");
    },
  });
});
