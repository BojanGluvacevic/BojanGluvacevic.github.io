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

function prepareURL_OWA(to, subject, body) {
    //encode values
    var mailTo = "&to=" + encodeURIComponent(to);
    var mailSubject = "&subject=" + encodeURIComponent(subject);
    var mailBody = "&body=" + encodeURIComponent(body);

    var mailBaseURL = "https://outlook.office.com/?path=/mail/action/compose";
    return (mailBaseURL + mailTo + mailSubject + mailBody);
}

function prepareURL_App(to, subject, body) {
    var mailTo = "mailto:" + encodeURIComponent(to);
    var mailSubject = "&subject=" + encodeURIComponent(subject);
    var mailBody = "&body=" + encodeURIComponent(body);

    return (mailTo + mailSubject + mailBody);
}

function copyToClipboard(input) {
    var copyText = document.getElementById(input).value;
    navigator.clipboard.writeText(copyText);
}

var generateRandomNDigits = (n) => {
    return Math.floor(Math.random() * (9 * (Math.pow(10, n-1)))) + (Math.pow(10, n-1));
}


function deleteWithPrompt(id) {
    if (confirm('Do you really want to delete this entry?')) {
        $('#' + id).remove();  //remove the element
    }
    else {
        alert('Watch where you press!');
    }
}

function MLG_Table_Add(name, to, subject, body, url, uri) {
    if ($("#mlg-table tbody").length == 0) {
        $("#mlg-table").append("<tbody></tbody>");
    }

    //read name from the browser
    var r_name = document.getElementById(name).value;
    var r_to = document.getElementById(to).value;
    var r_subject = document.getElementById(subject).value;
    var r_body = document.getElementById(body).value;

    var r_url_owa = prepareURL_OWA(r_to, r_subject, r_body);
    var r_url_app = prepareURL_App(r_to, r_subject, r_body);

    var rand_id = generateRandomNDigits(8);

    $("#mlg-table tbody").append("<tr id='" + rand_id + "'>" +
        "<td>" + r_name + "</td>" +
        "<td>" +
        "   <button type='button' onclick=\"navigator.clipboard.writeText('" + r_url_owa + "');\" class='btn btn-default' title='Copy Mailto link for OWA'><i class='mdi mdi-content-copy' /></button>" +
        "   <button type='button' onclick=\"navigator.clipboard.writeText('" + r_url_app + "');\" class='btn btn-default' title='Copy Mailto link for Applications'><i class='mdi mdi-application' /></button>" +
        "   <button type='button' onclick=\"window.open('" + r_url_owa  + "', '_blank');\" class='btn btn-default' title='Open in new window'><i class='mdi mdi-open-in-new' /></button>" +
                "   <button type='button' onclick=\"deleteWithPrompt('" + rand_id + "');\" class='btn btn-default' title='Delete record'><i class='mdi mdi-delete' /></button>" +
        "</td>" +
        "</tr>");
}

function MLG__Control(id) {
    var url = document.getElementById(id).value;

    if (url.length > 13) { // don't fire on any change, need to have some input first
        var myregexp = /^(https:\/\/outlook\.office\.com\/\?path=\/mail\/action\/compose&to=|mailto:)(.*?)&subject=(.*?)&body=(.*?)$/img;
        var match = myregexp.exec(url);
        if (match != null) {
            //show recipients
            document.getElementById('mlg__control__to').value = unescape(match[2]);
            //show subject
            document.getElementById('mlg__control__subject').value = unescape(match[3]);
            //show message
            document.getElementById('mlg__control__message').value = unescape(match[4]);
        }
        else {
            //reset values
            document.getElementById('mlg__control__to').value = "";
            document.getElementById('mlg__control__subject').value = "";
            document.getElementById('mlg__control__message').value = "";
        }
    }
}

var openFile = function (event) {
    var input = event.target;

    var file = input.files[0];
    var reader = new FileReader();

    reader.onload = (event) => {
        var file = event.target.result;
        var allLines = file.split(/\r\n|\n/);
        // Reading line by line
        allLines.forEach((line) => {
            eval(line.replace(/^#email>(EM-\d{3}),(.*?),(.*?),(.*?),(.*?),(.*?),(.*?)$/img, "MLG_Table_Add('$1','$2','$3','$4','$5','$6','$7');"));
        });
    };

    reader.onerror = (event) => {
        alert(event.target.error.name);
    };

    reader.readAsText(file);
};