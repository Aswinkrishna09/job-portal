$(document).ready(function() {
    $('.sideMenuToggler').on('click', function() {
      $('.wrapper').toggleClass('active');
    });
  
    var adjustSidebar = function() {
      $('.sidebar').slimScroll({
        height: document.documentElement.clientHeight - $('.navbar').outerHeight()
      });
    };
  
    adjustSidebar();
    $(window).resize(function() {
      adjustSidebar();
    });
  });
  $(function() {
  
    $(".progress").each(function() {
  
      var value = $(this).attr('data-value');
      var left = $(this).find('.progress-left .progress-bar');
      var right = $(this).find('.progress-right .progress-bar');
  
      if (value > 0) {
        if (value <= 50) {
          right.css('transform', 'rotate(' + percentageToDegrees(value) + 'deg)')
        } else {
          right.css('transform', 'rotate(180deg)')
          left.css('transform', 'rotate(' + percentageToDegrees(value - 50) + 'deg)')
        }
      }
  
    })
  
    function percentageToDegrees(percentage) {
  
      return percentage / 100 * 360
  
    }
  
  });
  function addToCart(productId){
    $.ajax({
        url:"/add-to-cart/"+productId,
        method:"get",
        success:(response)=>{
            if(response.status){
                let count = $("#cart-count").html()
                count =parseInt(count)+1
                $('#cart-count').html(count)
            }
           
        }

    })
}
$('.mdb-select').materialSelect({
});
