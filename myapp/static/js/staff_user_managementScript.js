document.getElementById('search').addEventListener('input', function(e) {
    // Get the search term and convert it to lower case for case-insensitive matching
    var searchTerm = e.target.value.toLowerCase();

    // Get the current visible request container
    var requestContainer = document.querySelector('.keep-cards');
    
    // Get all the request cards within the container
    var requestCards = requestContainer.getElementsByClassName('col-md-4');

    // Loop through the request cards
    for (var i = 0; i < requestCards.length; i++) {
        // Get the card's text and convert it to lower case
        var card = requestCards[i];
        var cardText = card.innerText.toLowerCase();

        // If the card's text includes the search term, show the card, otherwise hide it
        if (cardText.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    }
});


$('#addStaffUser').click(function(){
    $('#addStaffUserModal').modal('show');
});


$('#submitAddStaffUserForm').click(function(e) {
    console.log("submitAddStaffUserForm");
    e.preventDefault();

    var email = $('#staffEmail').val();
    var name = $('#staffName').val();
    var contact_no = $('#staffContactNo').val();
    var employee_designation = $('#staffDesignation').val();
    var password = $('#staffPassword').val();
    $('#submitAddStaffUserForm').click(function(e) {
    console.log("submitAddStaffUserForm");
    e.preventDefault();

    var email = $('#staffEmail').val();
    var name = $('#staffName').val();
    var contact_no = $('#staffContactNo').val();
    var employee_designation = $('#staffDesignation').val();
    var password = $('#staffPassword').val();
    var confirmPassword = $('#confirmStaffPassword').val();
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    console.log(email, name, contact_no, employee_designation, password);

    var newUser = {
        email: email,
        name: name,
        contact_no: contact_no,
        employee_designation: employee_designation,
        password: password,
    };
    
    let csrftoken = getCookie('csrftoken');

    $.ajax({
        type: 'POST',
        url: '/api/staff_users/', 
        headers:{
            'X-CSRFToken': csrftoken
        },
        data: JSON.stringify({
            'email': email,
            'name': name,
            'employee_id': employee_id,
            'contact_no': contact_no,
            'employee_designation': employee_designation,
            'password': password
        }),
        success: function(res) {
            alert('User created successfully!');
        },
        error: function(error) {
            console.log(error);
        }
    });

});

    var newUser = {
        email: email,
        name: name,
        contact_no: contact_no,
        employee_designation: employee_designation,
        password: password,
    };
    
    let csrftoken = getCookie('csrftoken');

    $.ajax({
        type: 'POST',
        url: '/api/staff_users/', 
        headers:{
            'X-CSRFToken': csrftoken
        },
        data: JSON.stringify({
            'email': email,
            'name': name,
            'contact_no': contact_no,
            'employee_designation': employee_designation,
            'password': password
        }),
        success: function(res) {
            alert('User created successfully!');
        },
        error: function(error) {
            console.log(error);
        }
    });

});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
