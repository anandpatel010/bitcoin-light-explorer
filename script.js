//TODO
// ADD DATATABLE FUNCTIONALITY TO FEE TABLE
// GIVE ERROR & WARNING FUNCTIONALITY

/**
 * Enables bootstrap tooltips
 * More info: https://getbootstrap.com/docs/4.0/components/tooltips/
 * @constructor
 */
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

$('#tx_table').hide();
$('#hash_rate').hide();
$('#halving').hide();
$('#countdown').hide();
$('#id_link').addClass('invisible');
$('#largest_tx').addClass('invisible');


/**
 * On document ready, call continuous method get_height() and notify of page load
 * @constructor
 */
$( document ).ready(function() {
    get_height();
    get_fees();
    get_fee_table();
    get_halving();
    //alert_success('Got height!');
    notify_sound();
    setInterval(get_height,1000);
    setInterval(get_fees,10000);
    setInterval(get_fee_table,10000);
    setInterval(get_price(),12000);
    setInterval(get_halving(),12000);

});


/**
 * Checks for new chain height
 * If true: will update, call get_block and do fancy animation.
 * Sets the new text for the received data and calls get_mempool()
 * Exec time: 3ms**
 * @constructor
 */
function get_height(){
    $.get("https://blockchain.info/latestblock", '&cors=true', function(response, status) {
        $('#height').removeClass('animated rollIn');
        let mtimenow = Date.now();
        let mblocktime = response['time'] + '000';
        let time_since_block = Math.round((mtimenow - mblocktime) / 1000);
        let height = response['height'];
        let block_hash = response["hash"];
        let displayed_height = document.getElementById("height").innerHTML;
        let ntxs = response['txIndexes'].length;

        let hash_link = 'https://blockchair.com/bitcoin/block/' + block_hash;
        if (parseInt(displayed_height) < parseInt(height)) {
            alert_info(height);
            notify_sound();
            $('#height').addClass('animated rollIn');//animate only on change
            //halving animation
            if (parseInt(height) % 210000 === 0){
                alert_halving();
                confetti.start();
            }
        } //else?
        $('#height').text(height); //set height value
        $('#time').text(time_since_block + 's ago');
        $('#words').text(numberToWords.toWords(height) + ' blocks');
        $('#id_link').removeClass('invisible').attr("href", hash_link);//show and link to block
        $('#largest_tx').removeClass('invisible');
        $('#id').text('⬅️ Latest block');
        $('#spinner').remove();
        $('#hash_rate').show();
        $('#halving').show();
        $('#countdown').show();
        $('#txs_inblock').text('Includes: '+ ntxs +' transactions');

        $.get("https://blockchain.info/rawblock/" + block_hash, '&cors=true', function(response, status) {
            console.log(response);
            let size = response['size'];
            $('#block_size').text('Block size: ' + (size/1000**2).toFixed(2) + ' megabytes');
        })
    });



    $.get("https://blockchain.info/q/hashrate", '&cors=true', function(response, status) {
        $('#hash_rate').text('Network hash rate: ' + (response/1000000000).toFixed(2) + ' EH/s')
    });
        get_mempool();
        get_price();
}


/**
 * Simply presents the most relevant fees
 * Exec time: 4ms
 * @constructor
 */
function get_fees() {
    $.get("https://bitcoinfees.earn.com/api/v1/fees/recommended", '&cors=true', function(response, status) {
        let fee_data = response;
        //console.log(fee_data);
        $('#fee1').text('fastest fee: '+ fee_data['fastestFee'] + ' sat/byte $' + ((((fee_data['fastestFee']*141)/100000000)*BTCUSD).toFixed(2)));
        $('#fee2').text('30min fee: '+ fee_data['halfHourFee'] + ' sat/byte $' + ((((fee_data['halfHourFee']*141)/100000000)*BTCUSD).toFixed(2)));
        $('#fee3').text('1hr fee: '+ fee_data['hourFee'] + ' sat/byte $' + ((((fee_data['hourFee']*141)/100000000)*BTCUSD).toFixed(2)));
    });
}


/**
 * Presents the mempool transaction count and size in kb with animation
 * Exec time: 4ms
 * @constructor
 */
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
        $('#mempool_size').text((parseFloat(mempool_size)).toFixed(2) + ' kb').addClass('animated fadeInRight');
    })
}

/**
 * Price discovery in all currencies
 * Exec time: 6ms
 * @constructor
 */
function get_price(){
    $.get("https://blockchain.info/ticker" , '&cors=true', function(response, status) {
        BTCUSD = response.USD.last;
        $('#btc-price').text('$' + response.USD.last);
        return BTCUSD;
    });
}


/**
 * Gets halving data from blockchair and presents price % change and difficulty retarget estimate
 * Exec time: 5ms
 * @constructor
 */
function get_halving(){
    $.get("https://api.blockchair.com/bitcoin/stats" , function(response, status) {
        day_change = Math.round(response.data.market_price_usd_change_24h_percentage* 100)/100;
        seconds_to_halving = response.data.countdowns[0].time_left;
        days_to_halving = (seconds_to_halving/60/60/24).toFixed(1);
        largest_tx = response.data.largest_transaction_24h;
        difficulty = response.data.difficulty;
        est_difficulty = response.data.next_difficulty_estimate;
        pct_change_difficulty = (((est_difficulty-difficulty)/difficulty)*100).toFixed(2);
        console.log(pct_change_difficulty);
        $('#countdown').html('in <span id="days" class="badge badge-light"></span> days');
        $('#days').text(days_to_halving);
        if (day_change > 0) {
            $('#24_hr_change').html('<small><span id="change" class="text-success"></span></small>');
            $('#change').text('+' + day_change + '%');
        }else{
            $('#24_hr_change').html('<small><span id="change" class="text-danger"></span></small>');
            $('#change').text(day_change + '%');
        }
        $('#largest_tx').attr("href", 'https://blockchair.com/bitcoin/transaction/'+largest_tx.hash);//show and link to block
        $('#largest_tx_hash').text("👀 $" + Math.round(response.data.largest_transaction_24h.value_usd/1000000) + "m tx ➡️");

        if (pct_change_difficulty > 0){
            $('#est_difficulty').text('Estimated difficulty retarget: +' + pct_change_difficulty + '%')
        } else {
            $('#est_difficulty').text('Estimated difficulty retarget: ' + pct_change_difficulty + '%')
        }

    });
}


/**
 * Refreshes fee table
 * Gets whole fee list and appends each row to a responsive table
 * Exec time: 3ms
 * @constructor
 */
function get_fee_table(){
    $.get("https://bitcoinfees.earn.com/api/v1/fees/list", 'JSON' , function(response, status){
        fees = response['fees'];
        //console.log(fees);
        $("#tx_table").find("tr:gt(0)").remove();
        //console.log('data cleared');
        for (let fee in fees) {
            $('#tx_table tbody').before('<tr class="table-light">\n' +
                '<th scope="row">'+ fees[fee].minFee + ' - ' + fees[fee].maxFee +'</th>\n' +
                '<td>' + (((((fees[fee].minFee + fees[fee].maxFee)/2)*141)/100000000)*BTCUSD).toFixed(2) + '</td>\n' +
                '<td>' + (fees[fee].dayCount) + '</td>\n' +
                '<td>' + (fees[fee].memCount) + '</td>\n' +
                '<td>' + (fees[fee].maxDelay) + '</td>\n' +
                '<td>' + (fees[fee].maxMinutes) + '</td>\n' +
                '</tr>');
        }
        $('#tx_table').show();
    });
}

/**
 * Notify sound function
 * @constructor
 */
function notify_sound() {
    var x = document.getElementById("myAudio");
    x.play();
}

    /**
 * Bootstrap notify settings & options
 * @constructor
 */
function alert_success(message){
    $('#toast_text').text(message);
    $('.toast').toast('show');
}

function alert_info(message){
    $('#toast_text').text("New block: " + message + " mined recently!");
    $('.toast').toast('show');
}

function alert_halving(){
    $('#toast_text').text("Congratulations, Welcome to the new reward era, great wealth awaits you.");
    $('.toast').toast('show');
}