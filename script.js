$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

$( document ).ready(function() {
    $('#id_link').addClass('invisible');
    get_height();
    alert_success('Got height!');
    setInterval(get_height,5000);
    $('#tx_table').hide();
});

function get_height(){

    $.get("https://blockchain.info/latestblock" , '&cors=true', function(response, status) {
        let block_data = response;
        console.log(block_data);
        $('#height').removeClass('animated rollIn');
        let height = block_data["height"];
        let block_hash = block_data["hash"];
        let displayed_height = document.getElementById("height").innerHTML;
        if (parseInt(displayed_height) < parseInt(height)) {
            warning.close();//close warning when block updates
            alert_info('New block');
            height_id(block_hash);
            $('#height').addClass('animated rollIn');//animate only on change
        } //else?
        $('#height').text(height); //get height value
        $('#words').text(numberToWords.toWords(height) + ' blocks');
        height_id(block_hash);
        get_delegate();
        return height, block_hash;
    });
}

function height_id(block_hash) {
    $.get("https://blockchain.info/rawblock/" + block_hash , '&cors=true', function(response, status) {
        let hash = block_hash;
        let ntxs = response['n_tx'];
        let size = response['size'];
        let hash_link = 'https://www.blockchain.com/btc/block/' + hash;
        get_delegate();
        get_fees()
        $('#id_link').removeClass('invisible').attr("href", hash_link);//show and link to block
        $('#id').text('hash: ' + hash);
        $('#spinner').remove();
        $('#delegate_spinner').remove();
        $('#ntxs').text('Includes: '+ ntxs +' transactions');
        $('#txed').text('Block size: ' + size/1000 + ' kilobytes');
        return id;
    });
    }

function get_fees() {
    $.get("https://bitcoinfees.earn.com/api/v1/fees/recommended", '&cors=true', function(response, status) {
        let fee_data = response;
        console.log(fee_data);
        $('#supply').text('fastest fee: '+ fee_data['fastestFee'] + ' sat/byte ' + ' 30min fee: '+ fee_data['halfHourFee'] + ' sat/byte ' + ' 1hr fee: '+ fee_data['hourFee' ] + ' sat/byte ');
    });
}

function get_delegate(){
    $.get("https://chain.api.btc.com/v3/tx/unconfirmed/summary", 'JSON' , function(response, status){
        let mempool_data = response['data'];
        console.log(mempool_data);
        mempool_count = mempool_data['count'];
        mempool_size = mempool_data['size'];

        $('#forger').removeClass('animated fadeInRight');//remove to re-enable animation
        $('#rank').removeClass('animated fadeInRight');

        let username = '≈' + mempool_count + ' waiting txs';
        let rank = mempool_size/1000 + ' kb';
        $('#forger').text(username).addClass('animated fadeInRight');
        $('#rank').text(rank).addClass('animated fadeInRight');
    })
}

function block_info(id) {
    rise.blocks.getBlock(id).then(function({ block }) {
        console.log(block);
        transactions = block['transactions'];
        if (transactions['length'] >= 1){
            display_tx(transactions);
            return block, transactions;
        }
        return block;
    })
        .catch(function(err) {
            alert_error('Could not retrieve block info, retrying...');
            console.log('Error: ', err); // handle error
            block_info(id);//retry
        })
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
