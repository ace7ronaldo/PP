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


