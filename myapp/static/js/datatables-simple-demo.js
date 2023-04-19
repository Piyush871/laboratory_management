document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/data/")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.data)
        const myTable = document.querySelector("#datatablesSimple");
        const dataTable = new simpleDatatables.DataTable(myTable, {
          data: {
            data: data.data,
          },
          columns: [
            { select: 0, sort: "asc", title: "equipment_id" },
            { select: 1, title: "equipment_name" },
            { select: 2, title: "category" },
            { select: 3, title: "assigned_user" },
            { select: 4, title: "last_assigned" },
            {
              select: 5,
              title: "viewDetails",
              render: function (data, cell, row) {
                return `<a href="/equipment/${row[0]}/">View Details</a>`;
              },
            },
          ],
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  });
