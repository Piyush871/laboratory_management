document.addEventListener("DOMContentLoaded", function () {
  const dateBeforeInput = document.getElementById("dateBefore");
  const dateAfterInput = document.getElementById("dateAfter");
  const assignedStatusSelect = document.getElementById("assignedStatus");
  const applyFiltersButton = document.getElementById("apply-filter");
  const clearFiltersButton = document.getElementById("clear-filter");

  // Call fetchData on page load with empty filters
  const tableId = "datatablesSimple";
  const myTable = document.getElementById(tableId);
  const url = "/api/equipment_filter/";
  const searchUrl = "/api/equipment_filter/";
  const columns = [
    { select: 0, sort: "asc", title: "equipment_id" },
    { select: 1, title: "equipment_name" },
    { select: 2, title: "category" },
    { select: 3, title: "assigned_user" },
    { select: 4, title: "last_assigned" },
    {
      select: 5,
      title: "viewDetails",
      render: function (data, cell, _dataIndex, _cellIndex) {
        console.log(cell.childNodes[0].data);
        const equipmentId = cell.childNodes[0].data;
        return `<a href="#" data-bs-toggle="modal" data-bs-target="#equipmentModal" onclick="showEquipmentDetails(${equipmentId})">View Details</a>`;
      },
    },
    { select: 6, title: "CheckBox", html: true },
  ];
  window.fetchDataFilter(tableId, myTable, url, searchUrl, columns, {});

  // "Apply Filters" button click event
  applyFiltersButton.addEventListener("click", () => {
    const filters = {
      date_before: dateBeforeInput.value,
      date_after: dateAfterInput.value,
      assigned_status: assignedStatusSelect.value,
    };
    console.log(filters);
    window.fetchDataFilter(tableId, myTable, url, searchUrl, columns, filters);
  });

  // "Clear Filters" button click event
  clearFiltersButton.addEventListener("click", () => {
    // Clear the filter form inputs
    dateBeforeInput.value = "";
    dateAfterInput.value = "";
    assignedStatusSelect.value = "";

    // Call fetchData with empty filters
    window.fetchDataFilter(tableId, myTable, url, searchUrl, columns, {});
  });

  document
    .getElementById("addEquipmentForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      var formData = new FormData();
      formData.append(
        "equipment_id",
        document.getElementById("equipmentId").value
      );
      formData.append(
        "equipment_name",
        document.getElementById("equipmentName").value
      );
      formData.append("category", document.getElementById("category").value);
      formData.append(
        "date_of_purchase",
        document.getElementById("dateOfPurchase").value
      );
      formData.append("location", document.getElementById("location").value);
      formData.append("image", document.getElementById("image").files[0]);

      window.makeRequest({
        url: "/api/addEquipment/",
        method: "POST",
        body: formData,
        onSuccess: (data) => {
          alert("Equipment added successfully");
          $("#addEquipmentModal").modal("hide");
          window.fetchDataFilter(tableId, myTable, url, searchUrl, columns, {});
        },
        onNetError: (error) => {
          alert("Error: " + error);
        },
        onErrorMessage: (errorMessage) => {
          alert("Error: " + errorMessage);
        },
      });
    });

  
});
