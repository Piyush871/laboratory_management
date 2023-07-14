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
  //get the search values
  let search = document.querySelector(
    `input[aria-controls=${tableId}].datatable-input`
  );
  const filters = {
    date_before: dateBeforeInput.value,
    date_after: dateAfterInput.value,
    assigned_status: assignedStatusSelect.value,
    search: search.value,
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
document.querySelector("#deleteButton").addEventListener("click", function () {
  //confirm from the user
  if (!confirm("Are you sure you want to delete the selected equipments?")) {
    return;
  }
  const checkboxes = document.querySelectorAll("input.user-checkbox:checked");
  console.log("Checked checkboxes:", checkboxes);

  const ids = Array.from(checkboxes).map((checkbox) => {
    console.log("Checkbox:", checkbox);
    return checkbox.dataset.id;
  });

  // Call your activate API endpoint with ids array
  console.log("Delete equipment ids:", ids);

  if (ids.length > 0) {
    window.makeRequest({
      url: `api/delete_equipments/?ids[]=${ids.join("&ids[]=")}`,
      method: "POST",
      onSuccess: (data) => {
        window.fetchDataFilter(tableId, myTable, url, searchUrl, columns, {});
      },
      onNetError: (error) => {
        window.showAlertGlobal(error, "error");
      },
      onErrorMessage: (errorMessage) => {
        console.error("Error deleting equipments:", errorMessage);
        window.showAlertGlobal(errorMessage, "error");
      },
    });
  } else {
    alert("Please select at least one equipment to delete.");
  }
});
