var startRange = "";
var completeRange = "";

function handleCheckboxChange(checkbox) {
    const itemId = checkbox.dataset.itemId;
    const isActive = checkbox.checked;

    console.log(`Item ID: ${itemId}, Is Active: ${isActive}`);

    const token = localStorage.getItem("token");

    // You can now send this information to your server-side script or perform other actions
    // For example, using AJAX:
    fetch("/api/v1/uploads/update-video-feed-status", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
        },
        body: JSON.stringify({
            videoId: itemId,
            isActive: isActive,
        }),
    })
        .then(response => {
            // Handle the response
        })
        .catch(error => {
            // Handle errors
        });
}

function initializePagination(totalRecords, recordsPerPage, pageNumber = 1) {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const pageLinksContainer = document.getElementById("pagination");
    pageLinksContainer.innerHTML = "";

    // Define the number of visible page links around the current page
    const visibleLinks = 5;

    // Calculate the starting and ending page numbers to display
    let startPage = Math.max(1, pageNumber - Math.floor(visibleLinks / 2));
    const endPage = Math.min(
        totalPages,
        pageNumber + Math.floor(visibleLinks / 2),
    );

    // Show ellipsis (...) at the beginning if needed
    if (startPage > 1) {
        const prevLink = document.createElement("a");
        prevLink.textContent = "...";
        prevLink.href = `#page-${startPage - 1}`;
        prevLink.addEventListener("click", function (event) {
            event.preventDefault();
            loadPage(startPage - 2);
        });
        prevLink.classList.add("disabled");
        pageLinksContainer.appendChild(prevLink);
        startPage++;
    }

    // Show page links
    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement("a");
        pageLink.textContent = i;
        pageLink.href = `#`;
        if (i === pageNumber) pageLink.classList.add("active_page");
        pageLink.addEventListener("click", function (event) {
            event.preventDefault();
            loadPage(i);
        });
        pageLinksContainer.appendChild(pageLink);
    }

    // Show ellipsis (...) at the end if needed
    if (endPage < totalPages) {
        const nextLink = document.createElement("a");
        nextLink.textContent = "...";
        nextLink.href = `#page-${endPage + 1}`;
        nextLink.addEventListener("click", function (event) {
            event.preventDefault();
            loadPage(endPage + 1);
        });
        nextLink.classList.add("disabled");
        pageLinksContainer.appendChild(nextLink);
    }
}

function removeEventListeners(totalPages) {
    const pageLinksContainer = document.getElementById("pagination");
    console.log(pageLinksContainer.firstChild, "pageLinksContainer");
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = pageLinksContainer.children[i];
        pageLink.removeEventListener("click", pageLink.clickHandler);
    }
}

const recordsPerPageSelect = document.getElementById("recordsPerPageSelect");
let previousValue = recordsPerPageSelect.value;
recordsPerPageSelect.addEventListener("change", function () {
    // removeEventListeners(previousValue);
    const selectedValue = recordsPerPageSelect.value;
    previousValue = selectedValue;
    loadPage(1);
    // Update pagination based on the selected value
});

function loadPage(pageNumber) {
    let sortbyElement = document.querySelector(".sorted");
    let coulmnName = "";
    let orderByDirection = "";
    if (sortbyElement) {
        coulmnName = sortbyElement.getAttribute("data-sort-column");
        if (sortbyElement.classList.contains("asc")) orderByDirection = "asc";
        else orderByDirection = "desc";
    }
    const recordsPerPage = recordsPerPageSelect.value;

    // Get the current timestamp in milliseconds
    const timestamp = Date.now();
    const token = localStorage.getItem("token");
    // Make an AJAX request to fetch the data for the current page

    fetch(
        `/api/v1/uploads/videos?page=${pageNumber}&limit=${recordsPerPage}&column=${coulmnName}&direction=${orderByDirection}&timestamp=${timestamp}&startRange=${startRange}&completeRange=${completeRange}`,
        {
            headers: {
                Authorization: `${token}`,
            },
        },
    )
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("tableData");
            tableBody.innerHTML = ""; // Clear existing data
            if (data.error) {
                if (data.error == "Unauthenticated") {
                    tableBody.innerHTML =
                        "<p style='color:red; width:180px' class='error-msg'>Please login again!</p>";
                }
            } else {
                data.data.videos.forEach(video => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
           <td>${video.is_opt_in_post_media ? "Yes" : "No"}</td>
            <td><input data-item-id="${video.id}" onchange="handleCheckboxChange(this)" type="checkbox" ${video.video_feed ? "checked" : ""}></td>
            <td>${video.created_ts}</td>
            <td><a target="_blank" href="/video/${video.name}">View</a></td>
            
          `;
                    tableBody.appendChild(row);
                });
                initializePagination(
                    data.data.total,
                    recordsPerPage,
                    pageNumber,
                );
                // Calculate the starting and ending record numbers for the first page
                const firstRecord =
                    pageNumber > 1 ? (pageNumber - 1) * recordsPerPage + 1 : 1;
                const lastRecord =
                    Math.min(pageNumber * recordsPerPage) > data.data.total
                        ? data.data.total
                        : Math.min(pageNumber * recordsPerPage);

                // Update the pagination UI with total records information
                const paginationInfo =
                    document.getElementById("pagination-info");

                paginationInfo.textContent = `${firstRecord}-${lastRecord} of ${data.data.total}`;

                const pageLinksContainerMain =
                    document.getElementById("pagination-main");
                pageLinksContainerMain.insertBefore(
                    paginationInfo,
                    pageLinksContainerMain.firstChild,
                );
            }
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
        });
}

function sortTable(event) {
    event.preventDefault();
    const oldElement = document.querySelector(".sorted");
    const element = event.target;

    if (oldElement) {
        if (oldElement !== element) {
            oldElement.classList.remove("sorted");
            oldElement.classList.remove("asc");
            oldElement.classList.remove("desc");
        }
    }
    // Assuming the function is called from an event handler
    element.classList.add("sorted");
    console.log(element.classList, "element.classList");
    if (element.classList.contains("asc")) {
        element.classList.remove("asc");
        element.classList.add("desc");
    } else {
        element.classList.add("asc");
        element.classList.remove("desc");
    }

    loadPage(1);
}

loadPage(1);
// Updating the endpoint with token
function updateExportLink() {
    const exportLink = document.getElementById("export-link");
    const tokenLocal = localStorage.getItem("token");
    exportLink.href = `/api/v1/users/export?token=${tokenLocal}&startRange=${startRange}&completeRange=${completeRange}`;
}
updateExportLink();
// Initialize the date range picker
document.addEventListener("DOMContentLoaded", () => {
    const fp = flatpickr("#dateRangePicker", {
        mode: "range",
        dateFormat: "m-d-Y",
        onChange: selectedDates => {
            // Handle the selected date range here
            console.log(selectedDates);
            startRange = "";
            completeRange = "";
            if (selectedDates[0]) {
                // Extract the date components
                const day = selectedDates[0].getDate();
                const month = selectedDates[0].getMonth() + 1; // Adjust for 0-based months
                const year = selectedDates[0].getFullYear();

                // Format the date
                const formattedDate = `${year}-${month}-${day}`;
                console.log(formattedDate, "formattedDate");
                startRange = formattedDate;
            }
            if (selectedDates[1]) {
                // Extract the date components
                const day = selectedDates[1].getDate();
                const month = selectedDates[1].getMonth() + 1; // Adjust for 0-based months
                const year = selectedDates[1].getFullYear();

                // Format the date
                const formattedDate = `${year}-${month}-${day}`;
                console.log(formattedDate, "formattedDate");
                completeRange = formattedDate;
            }
            if (
                (startRange == "" && completeRange == "") ||
                (startRange != "" && completeRange != "")
            )
                loadPage(1);
            updateExportLink();
        },
        resetButton: true,
    });
    const resetButton = document.getElementById("resetButton");
    resetButton.addEventListener("click", function () {
        fp.clear();
    });

    // Assuming you have a function to update the database:
    function updateItemStatus(itemId, isActive) {
        // Send an AJAX request or use a similar method to update the database
        // ...
        console.log(itemId, isActive);
    }

    // Event listener for checkbox changes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const itemId = checkbox.dataset.itemId;
            const isActive = checkbox.checked;
            updateItemStatus(itemId, isActive);
        });
    });
});
