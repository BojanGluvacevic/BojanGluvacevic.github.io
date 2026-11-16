(function () {
    "use strict";

    var templates = [];

    function getElement(id) {
        return document.getElementById(id);
    }

    function setStatus(element, message, state) {
        element.textContent = message;
        if (state) {
            element.dataset.state = state;
        } else {
            delete element.dataset.state;
        }
    }

    function getComposerValues() {
        return {
            name: getElement("template-name").value.trim(),
            to: getElement("mail-to").value.trim(),
            subject: getElement("mail-subject").value.trim(),
            body: getElement("mail-message").value
        };
    }

    function buildOutlookUrl(template) {
        return "https://outlook.office.com/?path=/mail/action/compose" +
            "&to=" + encodeURIComponent(template.to) +
            "&subject=" + encodeURIComponent(template.subject) +
            "&body=" + encodeURIComponent(template.body);
    }

    function buildMailtoUrl(template) {
        return "mailto:" + encodeURIComponent(template.to) +
            "?subject=" + encodeURIComponent(template.subject) +
            "&body=" + encodeURIComponent(template.body);
    }

    async function copyText(value) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            return;
        }

        var fallback = document.createElement("textarea");
        fallback.value = value;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.opacity = "0";
        document.body.appendChild(fallback);
        fallback.select();
        var copied = document.execCommand("copy");
        fallback.remove();

        if (!copied) {
            throw new Error("Copying is not available in this browser.");
        }
    }

    function createAction(label, handler, danger) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "row-action" + (danger ? " row-action--danger" : "");
        button.textContent = label;
        button.addEventListener("click", handler);
        return button;
    }

    function renderTemplates() {
        var list = getElement("template-list");
        var empty = getElement("template-empty");
        var tableWrap = getElement("template-table-wrap");
        var count = getElement("template-count");
        list.replaceChildren();

        templates.forEach(function (template) {
            var row = document.createElement("tr");
            var nameCell = document.createElement("td");
            var recipientCell = document.createElement("td");
            var actionCell = document.createElement("td");
            var actions = document.createElement("span");

            nameCell.textContent = template.name;
            recipientCell.textContent = template.to;
            actions.className = "row-actions";

            actions.append(
                createAction("Copy", async function () {
                    try {
                        await copyText(buildOutlookUrl(template));
                        setStatus(getElement("composer-status"), "Outlook link copied for “" + template.name + "”.", "success");
                    } catch (error) {
                        setStatus(getElement("composer-status"), error.message, "error");
                    }
                }),
                createAction("Open", function () {
                    window.open(buildOutlookUrl(template), "_blank", "noopener");
                }),
                createAction("App", function () {
                    window.location.href = buildMailtoUrl(template);
                }),
                createAction("Delete", function () {
                    templates = templates.filter(function (item) {
                        return item.id !== template.id;
                    });
                    renderTemplates();
                    setStatus(getElement("composer-status"), "Template removed.", "success");
                }, true)
            );

            actionCell.appendChild(actions);
            row.append(nameCell, recipientCell, actionCell);
            list.appendChild(row);
        });

        var hasTemplates = templates.length > 0;
        empty.hidden = hasTemplates;
        tableWrap.hidden = !hasTemplates;
        count.textContent = templates.length + (templates.length === 1 ? " template" : " templates");
    }

    function addTemplate(template) {
        templates.push({
            id: window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
            name: template.name,
            to: template.to,
            subject: template.subject || "",
            body: template.body || ""
        });
    }

    function updateComposerState() {
        var template = getComposerValues();
        var hasRecipient = template.to.length > 0;
        getElement("copy-outlook-link").disabled = !hasRecipient;
        getElement("open-outlook").disabled = !hasRecipient;

        if (hasRecipient) {
            setStatus(getElement("composer-status"), "Your Outlook link is ready.", "success");
        } else {
            setStatus(getElement("composer-status"), "Add a recipient to prepare a link.");
        }
    }

    function parseComposeLink(value) {
        var raw = value.trim();
        if (!raw) {
            return null;
        }

        var url;
        try {
            url = new URL(raw);
        } catch (_error) {
            throw new Error("This is not a valid link.");
        }

        if (url.protocol === "mailto:") {
            return {
                to: decodeURIComponent(url.pathname),
                subject: url.searchParams.get("subject") || "",
                body: url.searchParams.get("body") || ""
            };
        }

        if (url.protocol !== "https:" || url.hostname !== "outlook.office.com") {
            throw new Error("Use an Outlook Web or mailto link.");
        }

        return {
            to: url.searchParams.get("to") || "",
            subject: url.searchParams.get("subject") || "",
            body: url.searchParams.get("body") || ""
        };
    }

    function inspectLink() {
        var status = getElement("inspector-status");
        var results = getElement("inspector-results");
        var value = getElement("inspect-url").value;

        if (!value.trim()) {
            results.hidden = true;
            setStatus(status, "Waiting for a link.");
            return;
        }

        try {
            var parsed = parseComposeLink(value);
            getElement("inspect-to").value = parsed.to;
            getElement("inspect-subject").value = parsed.subject;
            getElement("inspect-message").value = parsed.body;
            results.hidden = false;
            setStatus(status, "Link decoded successfully.", "success");
        } catch (error) {
            results.hidden = true;
            setStatus(status, error.message, "error");
        }
    }

    function parseCsvLine(line) {
        var values = [];
        var current = "";
        var quoted = false;

        for (var index = 0; index < line.length; index += 1) {
            var character = line[index];

            if (character === '"' && quoted && line[index + 1] === '"') {
                current += '"';
                index += 1;
            } else if (character === '"') {
                quoted = !quoted;
            } else if (character === "," && !quoted) {
                values.push(current.trim());
                current = "";
            } else {
                current += character;
            }
        }

        values.push(current.trim());
        return quoted ? null : values;
    }

    function parseTemplateLine(line) {
        if (!line.startsWith("#email>")) {
            return null;
        }

        var fields = parseCsvLine(line.slice(7));
        if (!fields) {
            return null;
        }

        if (/^EM-\d{3}$/i.test(fields[0])) {
            fields.shift();
        }

        if (fields.length < 4 || !fields[0] || !fields[1]) {
            return null;
        }

        return {
            name: fields[0],
            to: fields[1],
            subject: fields[2],
            body: fields[3]
        };
    }

    function loadTemplateFile(file) {
        var reader = new FileReader();
        reader.addEventListener("load", function (event) {
            var imported = 0;
            var lines = String(event.target.result).split(/\r?\n/);

            lines.forEach(function (line) {
                var template = parseTemplateLine(line.trim());
                if (template) {
                    addTemplate(template);
                    imported += 1;
                }
            });

            renderTemplates();
            if (imported > 0) {
                setStatus(getElement("composer-status"), imported + (imported === 1 ? " template loaded." : " templates loaded."), "success");
                window.location.hash = "OMG";
            } else {
                setStatus(getElement("composer-status"), "No compatible #email> templates were found in that file.", "error");
            }
        });
        reader.addEventListener("error", function () {
            setStatus(getElement("composer-status"), "The selected file could not be read.", "error");
        });
        reader.readAsText(file);
    }

    function setActiveNavigation() {
        var sections = document.querySelectorAll("[data-nav-section]");
        var links = document.querySelectorAll("[data-nav-link]");

        function activate(id) {
            links.forEach(function (link) {
                if (link.getAttribute("href") === "#" + id) {
                    link.setAttribute("aria-current", "true");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }

        activate("overview");
        if (!("IntersectionObserver" in window)) {
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            var visible = entries
                .filter(function (entry) { return entry.isIntersecting; })
                .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

            if (visible[0]) {
                activate(visible[0].target.id);
            }
        }, {
            rootMargin: "-20% 0px -60% 0px",
            threshold: [0, 0.2, 0.5]
        });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    function initialise() {
        var composerForm = getElement("composer-form");
        var composerStatus = getElement("composer-status");

        composerForm.addEventListener("input", updateComposerState);
        composerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var template = getComposerValues();

            if (!template.name || !template.to) {
                setStatus(composerStatus, "Add a template name and at least one recipient.", "error");
                (!template.name ? getElement("template-name") : getElement("mail-to")).focus();
                return;
            }

            addTemplate(template);
            renderTemplates();
            setStatus(composerStatus, "“" + template.name + "” added to the template list.", "success");
        });

        getElement("copy-outlook-link").addEventListener("click", async function () {
            try {
                await copyText(buildOutlookUrl(getComposerValues()));
                setStatus(composerStatus, "Outlook link copied.", "success");
            } catch (error) {
                setStatus(composerStatus, error.message, "error");
            }
        });

        getElement("open-outlook").addEventListener("click", function () {
            window.open(buildOutlookUrl(getComposerValues()), "_blank", "noopener");
        });

        getElement("inspect-url").addEventListener("input", inspectLink);
        getElement("inspector-form").addEventListener("submit", function (event) {
            event.preventDefault();
            inspectLink();
        });

        document.querySelectorAll("[data-copy-target]").forEach(function (button) {
            button.addEventListener("click", async function () {
                try {
                    await copyText(getElement(button.dataset.copyTarget).value);
                    setStatus(getElement("inspector-status"), "Field copied.", "success");
                } catch (error) {
                    setStatus(getElement("inspector-status"), error.message, "error");
                }
            });
        });

        getElement("import-trigger").addEventListener("click", function () {
            getElement("file-input").click();
        });
        getElement("file-input").addEventListener("change", function (event) {
            var file = event.target.files[0];
            if (file) {
                loadTemplateFile(file);
            }
            event.target.value = "";
        });

        renderTemplates();
        updateComposerState();
        setActiveNavigation();
    }

    document.addEventListener("DOMContentLoaded", initialise);
})();
