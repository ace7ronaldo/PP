/* activate scrollspy menu */
$('body').scrollspy({
  target: '#navbar-collapsible',
  offset: 52
});

/* smooth scrolling sections */
$('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top - 50
        }, 800);
        
        if (this.hash=="#section1") {
            $('.scroll-up').hide();
        }
        else {
            $('.scroll-up').show();
        }
        
        
        // activte animations in this section
        target.find('.animate').delay(1200).addClass("animated");
        setTimeout(function(){
            target.find('.animated').removeClass("animated");
        },2000);
        
        return false;
      }
    }
});
   $(function(){
  $(window).scroll(function(){
    $('.year').each(function(){
      var year = $(this).find('h2').first().text();
      if($(this).offset().top < $(document).scrollTop() +100){
        $(this).find('.date').addClass('activeYear');
           $('#dataYear').html(year);
        }else{
          $(this).find('.date').removeClass('activeYear');
        }
    });
  });
});
$(document).ready(function(){
  var year = $('.year').find('h2').first().text();
    $('#dataYear').html(year); 
  $('.year').first().find('.date').addClass('activeYear');
});

$(document).ready(function (){
  // create a LatLng object containing the coordinate for the center of the map
  var latlng = new google.maps.LatLng(-33.86455, 151.209);
  // prepare the map properties
  var options = {
    zoom: 15,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    navigationControl: true,
    mapTypeControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true
  };
  // initialize the map object
  var map = new google.maps.Map(document.getElementById('google_map'), options);
  // add Marker
  var marker1 = new google.maps.Marker({
    position: latlng, map: map
  });
  // add listener for a click on the pin
  google.maps.event.addListener(marker1, 'click', function() {
    infowindow.open(map, marker1);
  });
  // add information window
  var infowindow = new google.maps.InfoWindow({
    content:  '<div class="info"><strong>This is my company</strong><br><br>My company address is here<br> 32846 Sydney</div>'
  }); 
});


