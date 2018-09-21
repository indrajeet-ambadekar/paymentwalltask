(function() {
  if(!window.jQuery){
    var link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-rc.2/css/materialize.min.css";
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);
    var link = document.createElement("link");
    link.href = "widget/css/style.css";
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);
    document.title='Welcome to PaymentWall'
    
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
    script.onload = function() {
      var head = document.getElementsByTagName("head")[0];
      var script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-rc.2/js/materialize.min.js"
      script.onload = function() {
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.src = "http://maps.google.com/maps/api/js?sensor=true&key=AIzaSyCKluZVlsFWy6VtwDM290myCrQqXF2hZaw"
        script.onload = function() {
          initSDK();
        };
        head.appendChild(script);
      };
      head.appendChild(script);
    };
    head.appendChild(script);
  }
  else{
    initSDK();
  }
})();


var countryList = [];
var curr_country = 'IN'
function initSDK(){
  
  fetchCountries().then(function(result) {
    buildWidget().then(function(){
      getPaymentOptions();
    });
    if (navigator.geolocation) { 
      
      navigator.geolocation.getCurrentPosition(function(position) {  
        
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        
        var latlng = new google.maps.LatLng(lat, lng);
        
        var geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({'latLng': latlng}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
              console.log(results)
            }
          } else {
            console.log("Geocoder failed due to: " + status);
          }
        });
      });
    } else {
      console.log("Geolocation services are not supported by your browser.");
    } 
    
    
    
  }, function(err) {
    console.log("Something broke",err);
  });
}

function fetchCountries(){
  var promise = new Promise(function(resolve, reject) {
    $.get('widget/js/countryList.json',function(resp){
      countryList = resp.list;
      resolve(countryList)
    }).fail(function() {
      reject(Error("It broke"));
    });
  });
  return promise
}

var buildWidget = function(){
  var promise = new Promise(function(resolve, reject) {
    var template = "<div class='pw_wdgt'>";
    template+="<div id='section1' class='inputCntnr text-left'>"
    template+="<h3 class='text-center'>Welcome to PaymentWall</h3>"
    template+="<div class='selectCntnr row'>"
    template+="<div class='input-field col s12'>"
    template+="<select class='select-text' required onchange='curr_country=$(this).val();getPaymentOptions()'>"
    countryList.forEach(function(c,i){
      if(c.country_code==curr_country)
      template+="<option selected value='"+c.country_code+"'>"+c.country_name+"</option>"
      else
      template+="<option value='"+c.country_code+"'>"+c.country_name+"</option>"
    });
    template+="</select>"
    template+="<label class=''>Select Country</label>"
    template+="</div>"
    template+="</div>"
    template+="<div class='row'>"
    template+="<div class='input-field col s12'>"
    template+="<input type='number' id='amount' class='form-control input' autofocus required>USD"
    template+="<label class='form-control-placeholder' for='amount'>Amount</label>"
    template+="</div>"
    template+="</div>"
    template+="<div id='pyMethods'>"
    template+="<div class='row'>"
    template+="</div>"
    template+="</div>"
    template+="<div><button class='btn paymentAnchor ' onclick='proceedToForm(this)'>Proceed</button></div>";
    template+="</div>";
    template+="<div id='section2'>";
    template+="</div>";
    template+="</div>";
    $("body").append(template);
    $('select').formSelect();
    resolve(true)
  })
  return promise 
}



function getPaymentOptions(e){
  var url=`https://api.paymentwall.com/api/payment-systems/?key=c38669db68cd1a2ba6afd94345b5b6d6&country_code=${curr_country}&signature=3a759b7917ce64b45800cdddb07cfd15`
  $.get(url,function(resp){
    console.log(resp);
    $('#pyMethods').find('.row').html('')
    var templ="";
    resp.forEach(function(m,i){
      templ+="<div class='col s6'>"
      templ+="<div class='pyMtd'>"
      templ+="<div class='row no-pad-mar'>"
      templ+="<div class='col s1' style='padding-top:8px;'>"
      templ+="<label>"
      templ+="<input name='group1' value='"+m.name+"' type='radio' onchange='selectMethod(this)'/>"
      templ+="<span></span>"
      templ+="</label>"
      templ+="</div>"
      templ+="<div class='col s5 no-pad-mar'>"
      templ+="<img src='"+m.img_url+"' width='100%'/>"
      templ+="</div>"
      templ+="<div class='col s6 no-pad-mar'>"
      templ+="<div class='gateWayName'>"+m.name+"</div>"
      templ+="</div>"
      templ+="</div>"
      templ+="</div>"
      templ+="</div>"
    })
    $('#pyMethods').find('.row').html(templ);
  }).fail(function() {
    reject(Error("It broke"));
  });
}
var method =""
function selectMethod(e){
  method = $(e).val()
}
var amount = 0;
function proceedToForm(){
  if($('#amount').val()==0){
    M.toast({html: 'Please enter an amount', classes: 'error'});
  }
  else if(method.length==0){
    M.toast({html: 'Please select a payment method', classes: 'error'});
  }
  else{
    amount = $('#amount').val()
    showPaymentForm()
  }
}

function showPaymentForm(){
  $('#section1').fadeOut();
  setTimeout(function(){
    $('#section2').fadeIn();
  },500);
  $("#section2").html(`<h3 class='text-center'>
  Enter Card Details
  </h3>
  <div class='formCntnr'>
  <div class='row'>
  <div class="input-field col s12">
  <input id="custName" type="text" class="validate" onkeyup="$(this).val($(this).val().replace(/[0-9]/g, ''))">
  <label for="custName">Card Holder's Name</label>
  </div>
  </div>
  <div class='row'>
  <div class="input-field col s12">
  <input id="cardNum" type="text" class="validate" onkeyup='$(this).val($(this).val().replace(/[^0-9]/g,""));if($(this).val().length>0){valid_credit_card($(this).val())}' onblur='valid_credit_card($(this).val())'>
  <label for="cardNum">Card Number</label>
  </div>
  </div>
  <div class='row'>
  <div class="input-field col s4">
  <input id="expDate" type="text" class="datepicker">
  <label for="expDate">Expiry Date</label>
  </div>
  <div class="input-field col s3">
  <input id="cardCVV" type="text" class="validate" maxlength='3' onkeyup='$(this).val($(this).val().replace(/[^0-9]/g,""));'>
  <label for="cardCVV">CVV</label>
  </div>
  </div>
  <div class='row'>
  <div class='col s12 text-center'>
  <button class='btn teal lighten-2' onclick='validateAndPay()'>Pay ${'$'+amount}</button>
  </div>
  </div>
  </div>`);
  $('.datepicker').datepicker({format:'mm/yyyy',minDate:new Date()});
}

function valid_credit_card(value) {
  if (/[^0-9-\s]+/.test(value)) return false;
  var nCheck = 0, nDigit = 0, bEven = false;
  value = value.replace(/\D/g, "");
  for (var n = value.length - 1; n >= 0; n--) {
    var cDigit = value.charAt(n),
    nDigit = parseInt(cDigit, 10);
    
    if (bEven) {
      if ((nDigit *= 2) > 9) nDigit -= 9;
    }
    
    nCheck += nDigit;
    bEven = !bEven;
  }
  validity = (nCheck % 10) == 0;;
  if (!validity){
    if(value.length==16){
      M.toast({html: 'Card Number is invalid', classes: 'error'});
    }
    $('#cardNum').css('border-color','#e65656')
    $('#cardNum').css('box-shadow','0 1px 0 0 #e65656')
  }
  else{
    $('#cardNum').css('border-color','#4CAF50')
    $('#cardNum').css('box-shadow','0 1px 0 0 #4CAF50')
  }
  return validity;
}

function validateAndPay(){
  var payload = {}
  payload['cardHolderName'] = $('#custName').val();
  payload['cardNumber'] = $('#cardNum').val();
  payload['cardExpiryDate'] = $('#expDate').val();
  payload['cardCVV'] = $('#cardCVV').val();
  if($('#custName').val().length==0){
    M.toast({html: 'Cardholder name is invalid', classes: 'error'});
  }
  else if($('#cardNum').val().length==0 ||!valid_credit_card($('#cardNum').val())){
    M.toast({html: 'Card Number is invalid', classes: 'error'});
  }
  else if($('#expDate').val().length==0){
    M.toast({html: 'Card Expiry Date is invalid', classes: 'error'});
  }
  else if($('#cardCVV').val().length==0){
    M.toast({html: 'Card CVV Number is invalid', classes: 'error'});
  }
  else{
    M.toast({html: 'Thank you for the payment', classes: 'success'});
    $('#section2').fadeout();
    setTimeout(function(){
      $('#section1').fadeIn();
    },500);
  }
}