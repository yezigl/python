/**
 * 
 */
$(function() {
    console.log("weibo run");
    $("div[node-type='feed_list_recommend']").remove();
    $("div[node-type='recommendTopic']").remove();
    $("#trustPagelet_recom_memberv5").remove();
    $("#trustPagelet_recom_allinonev5").remove();
    $("#pl_leftnav_app").remove();
    
});

setTimeout(recommend, 100);

function recommend() {
    if ($("div[node-type='feed_list_recommend']")) {
        $("div[node-type='feed_list_recommend']").remove();
    } else {
        setTimeout(recommend, 200);
    }
}