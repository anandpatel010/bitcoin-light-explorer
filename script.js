//TODO
// DOCUMENT EACH FUNCTION WITH [INFO] & [MORE_INFO]
// INCLUDE TIME SINCE LAST BLOCK

//this function enables tooltip [INFO]: https://getbootstrap.com/docs/4.0/components/tooltips/
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

$('#tx_table').hide(); //HIDES TABLE

$( document ).ready(function() {
    $('#id_link').addClass('invisible'); // MAKES ID_LINK INVISIBLE
    get_height();                       //getheight -> height_id -> get_mempool & get_fees
    alert_success('Got height!');
    setInterval(get_height,5000);   //get_height is recalled every 5 seconds
    $('#tx_table').hide();
});

function get_height(){

    $.get("https://blockchain.info/latestblock" , '&cors=true', function(response, status) {
        let block_data = response;
        //console.log(block_data);
        $('#height').removeClass('animated rollIn');
        let height = block_data["height"];
        let block_hash = block_data["hash"];
        let displayed_height = document.getElementById("height").innerHTML;
        if (parseInt(displayed_height) < parseInt(height)) {
            alert_info('New block');
            height_id(block_hash);
            $('#height').addClass('animated rollIn');//animate only on change
        } //else?
        $('#height').text(height); //get height value
        $('#words').text(numberToWords.toWords(height) + ' blocks');
        height_id(block_hash);
        get_mempool();
        return height, block_hash;
    });
}

function height_id(block_hash) {
    $.get("https://blockchain.info/rawblock/" + block_hash , '&cors=true', function(response, status) {
        let hash = block_hash;
        let ntxs = response['n_tx'];
        let size = response['size'];
        let hash_link = 'https://www.blockchain.com/btc/block/' + hash;
        get_mempool();
        get_fees();
        display_fees();
        $('#id_link').removeClass('invisible').attr("href", hash_link);//show and link to block
        $('#id').text('Explore block ➡️');
        $('#spinner').remove();
        $('#txs_inblock').text('Includes: '+ ntxs +' transactions');
        $('#block_size').text('Block size: ' + size/1000 + ' kilobytes');
        return id;
    });
    }

function get_fees() {
    $.get("https://bitcoinfees.earn.com/api/v1/fees/recommended", '&cors=true', function(response, status) {
        let fee_data = response;
        //console.log(fee_data);
        $('#fee1').text('fastest fee: '+ fee_data['fastestFee'] + ' sat/byte ');
        $('#fee2').text('30min fee: '+ fee_data['halfHourFee'] + ' sat/byte ');
        $('#fee3').text('1hr fee: '+ fee_data['hourFee' ] + ' sat/byte ');
    });
}

function get_mempool(){
    $.get("https://chain.api.btc.com/v3/tx/unconfirmed/summary", 'JSON' , function(response, status){
        let mempool_data = response['data'];
        //console.log(mempool_data);
        let mempool_count = mempool_data['count'];
        let mempool_size = mempool_data['size'];

        $('#mempool_count').removeClass('animated fadeInRight');//remove to re-enable animation
        $('#mempool_size').removeClass('animated fadeInRight');
        $('#mempool_spinner').remove();
        zeroconf_tx = '≈' + mempool_count + ' waiting txs';
        mempool_size = mempool_size/1000 + ' kb';
        $('#mempool_count').text(zeroconf_tx).addClass('animated fadeInRight');
        $('#mempool_size').text(mempool_size).addClass('animated fadeInRight');
    })
}

function display_fees(){
    $.get("https://bitcoinfees.earn.com/api/v1/fees/list", 'JSON' , function(response, status){
       fees = response['fees'];
       //console.log(fees);
        $("#tx_table").find("tr:gt(0)").remove();
        console.log('data cleared');
        $('#tx_table').show();
        for (let fee in fees) {
           $('#tx_table tbody').before('<tr>\n' +
               '<th scope="row">'+ fees[fee].minFee + ' - ' + fees[fee].maxFee +'</th>\n' +
               '<td>' + (fees[fee].dayCount) + '</td>\n' +
               '<td>' + (fees[fee].memCount) + '</td>\n' +
               '<td>' + (fees[fee].maxDelay) + '</td>\n' +
               '<td>' + (fees[fee].maxMinutes) + '</td>\n' +
               '</tr>');
       }
    });
    }

function alert_success(message){
    $.notify({
        // options
        //icon: 'glyphicon glyphicon-warning-sign',
        title: 'Success: ',
        message: message
    },{
        // settings
        type: 'success',
        allow_dismiss: false,
        newest_on_top: false,
        delay: 5000,
        placement: {
            from: "bottom",
            align: "right"
        },
        animate: {
            enter: 'animated bounceIn',
            exit: 'animated bounceOut'
        }
    });
}

function alert_info(message){
    $.notify({
        // options
        //icon: 'glyphicon glyphicon-warning-sign',
        title: 'Info: ',
        message: message
    },{
        // settings
        type: 'info',
        allow_dismiss: false,
        newest_on_top: false,
        delay: 5000,
        placement: {
            from: "bottom",
            align: "right"
        },
        animate: {
            enter: 'animated bounceIn',
            exit: 'animated bounceOut'
        }
    });
}

function alert_error(message){
    $.notify({
        // options
        //icon: 'glyphicon glyphicon-warning-sign',
        title: 'Error: ',
        message: message
    },{
        // settings
        type: 'danger',
        allow_dismiss: false,
        newest_on_top: false,
        delay: 5000,
        placement: {
            from: "bottom",
            align: "right"
        },
        animate: {
            enter: 'animated bounceIn',
            exit: 'animated bounceOut'
        }
    });
}

function alert_warning(message){
    warning = $.notify({
        // options
        //icon: 'vendor/img/spinner.gif',
        title: '<div class="spinner-border spinner-border-sm" role="status">\n' +
            '  <span class="sr-only"></span>\n' +
            '</div>',
        message: message
    }, {
        // settings
        type: 'warning',
        allow_dismiss: false,
        newest_on_top: false,
        delay: 30000,
        //icon_type: 'image',
        placement: {
            from: "bottom",
            align: "right"
        },
        animate: {
            enter: 'animated bounceIn',
            exit: 'animated bounceOut'
        }
    });
}
