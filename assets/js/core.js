/* global bootstrap: false */

(function () {
  'use strict'

  // Tooltip and popover demos
  document.querySelectorAll('.tooltip-demo')
    .forEach(function (tooltip) {
      new bootstrap.Tooltip(tooltip, {
        selector: '[data-bs-toggle="tooltip"]'
      })
    })

  document.querySelectorAll('[data-bs-toggle="popover"]')
    .forEach(function (popover) {
      new bootstrap.Popover(popover)
    })

  document.querySelectorAll('.toast')
    .forEach(function (toastNode) {
      var toast = new bootstrap.Toast(toastNode, {
        autohide: false
      })

      toast.show()
    })

  // Disable empty links
  document.querySelectorAll('[href="#"]')
    .forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault()
      })
    })

    
  function setActiveItem() {
    var hash = window.location.hash

    if (hash === '') {
      return
    }

    var link = document.querySelector('.bd-aside a[href="' + hash + '"]')
    var active = document.querySelector('.bd-aside .active')
    var parent = link.parentNode.parentNode.previousElementSibling

    link.classList.add('active')

    if (parent.classList.contains('collapsed')) {
      parent.click()
    }

    if (!active) {
      return
    }

    var expanded = active.parentNode.parentNode.previousElementSibling

    active.classList.remove('active')

    if (expanded && parent !== expanded) {
      expanded.click()
    }
  }
/*
  setActiveItem()
    window.addEventListener('hashchange', setActiveItem)
*/
})()

function MLG__Prepare(name, to, subject, body, outputControl) {
    var templateName = document.getElementById(name).value;
    var mailTo = document.getElementById(to).value;
    var mailSubject = document.getElementById(subject).value;
    var mailBody = document.getElementById(body).value;

    //encode values
    mailTo = "&to=" + encodeURIComponent(mailTo);
    mailSubject = "&subject=" + encodeURIComponent(mailSubject);
    mailBody = "&body=" + encodeURIComponent(mailBody);

    var mailBaseURL = "https://outlook.office.com/?path=/mail/action/compose";
    var mailNewLink = mailBaseURL + mailTo + mailSubject + mailBody;

    document.getElementById(outputControl).value = mailNewLink;
    $("#mlg__URLOpen").attr("href", mailNewLink);
}

function copyToClipboard(input) {
    var copyText = document.getElementById(input).value;
    navigator.clipboard.writeText(copyText);
}

function MLG_Table_Add(name, to, subject, body) {
    if ($("#mlg-table tbody").length == 0) {
        $("#mlg-table").append("<tbody></tbody>");
    }

    if ($("#mlg__name").val() != null && $("#mlg__name").val() != '') {

        $("#mlg-table tbody").append("<tr>" +
            "<td>" + document.getElementById(name).value + "</td>" +
            "<td>" + document.getElementById(to).value + "</td>" +
            "<td>" + document.getElementById(subject).value + "</td>" +
            "<td>" + document.getElementById(body).value.replace(/(?:\r|\n|\r\n)/g, '<br>') + "</td>" +
            "<td>" + "<button type='button' onclick=\"$(this).closest('tr').remove()\" class='btn btn-default'>" + "<i class='mdi mdi-delete'>" + "</button>" + "</td>" +
            "</tr>");
    }
}