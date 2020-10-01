/////////////////////////////////////
///////  Progressive enhancement ////
/////////////////////////////////////

// check if browser supports 'server worker api' then run the script
if (navigator.serviceWorker) {
  // register service worker
  navigator.serviceWorker.register("sw.js").catch(console.error);
}

// check if browser supports 'notification api' then run the script
if (window.Notification) {
  function showNotification() {
    let notificationOptions = {
      body: "Some notification information! 😍",
      icon: "/images/icons/mstile-70x70.png",
    };
    let notif = new Notification("Push notification demo", notificationOptions);
    notif.addEventListener("click", function () {
      console.log("We Can Run Custom Scripts When Notification is Clicked! 😊");
    });
  }

  // manage permission from the user
  if (Notification.permission === "granted") {
    showNotification();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission((permission) => {
      if (permission === "granted") {
        showNotification();
      }
    });
  }
}

//////////////////////////////////////////
////////////  Giphygram Script //////////
/////////////////////////////////////////

// Giphy API object
var giphy = {
  url: "https://api.giphy.com/v1/gifs/trending",
  query: {
    api_key: "54452c59b31e4d14aca213ec76014baa",
    limit: 120,
  },
};

// Update trending giphys
function update() {
  // Toggle refresh state
  $("#update .icon").toggleClass("d-none");

  // Call Giphy API
  $.get(giphy.url, giphy.query)

    // Success
    .done(function (res) {
      // Empty Element
      $("#giphys").empty();

      // Loop Giphys
      $.each(res.data, function (i, giphy) {
        // Add Giphy HTML
        $("#giphys").prepend(
          '<div class="col-sm-6 col-md-4 col-lg-3 p-1">' +
            '<img class="w-100 img-fluid" src="' +
            giphy.images.downsized_large.url +
            '">' +
            "</div>"
        );
      });
    })

    // Failure
    .fail(function () {
      $(".alert").slideDown();
      setTimeout(function () {
        $(".alert").slideUp();
      }, 2000);
    })

    // Complete
    .always(function () {
      // Re-Toggle refresh state
      $("#update .icon").toggleClass("d-none");
    });

  // Prevent submission if originates from click
  return false;
}

// Manual refresh
$("#update a").click(update);

// Update trending giphys on load
update();
