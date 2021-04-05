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

  setActiveItem()
  window.addEventListener('hashchange', setActiveItem)
})()

function MLG__Prepare(to, subject, body, outputControl) {
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
}

function copyToClipboard(input) {
    var copyText = document.getElementById(input).value;
    navigator.clipboard.writeText(copyText);
}

function MLG__Prepare__URL() {
    document.getElementById('mlg__URLOpen').href = document.getElementById('mlg__temp__value').value;
}
