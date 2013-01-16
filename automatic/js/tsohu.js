/**
 *
 */

$("#tsohu_loginCard").remove();

$("#innerToolBar div").each(function() {
    if ($(this).hasClass("tb-nav-tsohu") || $(this).hasClass("tb-nav-tsohu-title")) {
        $(this).remove();
    }
});