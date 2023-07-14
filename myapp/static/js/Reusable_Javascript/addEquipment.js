document
  .getElementById("addEquipmentForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("addEquipmentForm");
    var formData = new FormData();
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
    //if the
    if (document.getElementById("image").files[0] != undefined) {
      formData.append("image", document.getElementById("image").files[0]);
    }
    if (document.getElementById("purchaseReceipt").files[0] != undefined) {
      formData.append(
        "purchase_receipt",
        document.getElementById("purchaseReceipt").files[0]
      );
    }
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
//clear the staff user form 
document.getElementById("addEquipmentModal").addEventListener("hidden.bs.modal", function () {

  document.getElementById("addEquipmentForm").reset();
});
