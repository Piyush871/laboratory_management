const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

$(document).ready(function () {
	function getCookie(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
	
	var csrftoken = getCookie('csrftoken');
	

  $("form[name='registerForm']").on("submit", function (e) {
    e.preventDefault(); // Prevent the form from submitting via the browser.
    var password = $(this).find("input[name='password']").val();
    var confirmPassword = $(this).find("input[name='confirm_password']").val();
    var email = $(this).find("input[name='email']").val();

    if (password != confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }

    // Ask the user to confirm their email
    var confirmEmail = confirm("Is your email correct: " + email + "?");
    if (confirmEmail) {
      // Here is where we'll submit the form via AJAX.
      $.ajax({
        type: "POST",
        url: "/reg_normal_user",
        data: $(this).serialize(),
		beforeSend: function(xhr) {
			xhr.setRequestHeader("X-CSRFToken", csrftoken);
		},
        success: function (response) {
          console.log("success");
          console.log(response.message);
          document.getElementById("message_div").innerHTML = response.message;
        },
        error: function (error) {
          console.log("error");
          console.log(error.responseJSON.message);
          document.getElementById("message_div").innerHTML =
            error.responseJSON.message;
        },
      });
    } else {
      alert("Please correct your email address.");
      return false;
    }
  });
  $("form[name='loginForm']").on("submit", function (e) {
    e.preventDefault(); // Prevent the form from submitting via the browser.
    // Here is where we'll submit the form via AJAX.
    var email = $(this).find("input[name='email']").val();
    var password = $(this).find("input[name='password']").val();
    $.ajax({
      type: "POST",
      url: "/login",
      data: $(this).serialize(),
	  beforeSend: function(xhr) {
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
    },
      success: function (response) {
        console.log("success");
        console.log(response);
        document.getElementById("message_div").innerHTML = response.message;
        window.location.href = response.redirect;
      },
      error: function (error) {
        console.log("error");
        console.log(error.responseJSON.message);
		document.getElementById("message_div").innerHTML = "";
        document.getElementById("message_div").innerHTML = error.responseJSON.message;
      },
    });
  });
});

