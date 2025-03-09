document.addEventListener("DOMContentLoaded", function () {
    loadHeader()
        .then(() => {
            console.log("Header caricato con successo!");
            attachMenuListeners(); // Riassegna eventi al menu
            const savedLanguage = localStorage.getItem("selectedLanguage") || "it";
            loadEvents(savedLanguage);
        })
        .catch(error => console.error("Errore nel caricamento dell'header:", error));
});

function loadHeader() {
    return fetch("header.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Errore nel caricamento di header.html - Verifica il percorso.");
            }
            return response.text();
        })
        .then(html => {
            document.getElementById("header-container").innerHTML = html;
            executeScriptsFromHTML(html); // Esegue eventuali script dentro header.html
        });
}

// Esegue gli script contenuti dentro header.html
function executeScriptsFromHTML(html) {
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    tempDiv.querySelectorAll("script").forEach(script => {
        let newScript = document.createElement("script");
        if (script.src) {
            newScript.src = script.src;
        } else {
            newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript);
    });
}

function attachMenuListeners() {
    console.log("Aggiungendo listener al menu...");
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function () {
            console.log("Cliccato su:", this.textContent);
        });
    });
}

function loadEvents(lang) {
    fetch("data/events.csv")
        .then(response => response.text())
        .then(csvText => {
            let events = parseCSV(csvText);
            displayEvents(events, lang);
        })
        .catch(error => console.error("Errore nel caricamento degli eventi:", error));
}

function parseCSV(csvText) {
    let rows = csvText.trim().split("\n").slice(1);
    return rows.map(row => {
        let [date, location, event] = row.split(",");
        return { date, location, event };
    });
}

function displayEvents(events, lang) {
    const now = new Date();
    let nextEvents = [];
    let pastEvents = [];

    events.forEach(event => {
        let eventDate = new Date(event.date);
        let formattedDate = formatDate(event.date, lang);
        
        let eventHTML = `
            <div class="event-item">
                <div class="event-date" data-original-date="${event.date}">${formattedDate}</div>
                <div class="event-details"><a href="#">${event.location} - ${event.event}</a></div>
            </div>
        `;

        if (eventDate >= now) {
            nextEvents.push({ html: eventHTML, date: eventDate });
        } else {
            pastEvents.push({ html: eventHTML, date: eventDate });
        }
    });

    nextEvents.sort((a, b) => a.date - b.date);
    pastEvents.sort((a, b) => b.date - a.date);

    document.getElementById("next-events-container").innerHTML = nextEvents.map(e => e.html).join("");
    document.getElementById("past-events-container").innerHTML = pastEvents.map(e => e.html).join("");
}

function formatDate(dateString, lang) {
    let [year, month, day] = dateString.split("-");
    return lang === "en" ? `${year}-${month}-${day}` : `${day}/${month}/${year}`;
}

function changeLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    document.documentElement.lang = lang;
    
    document.getElementById("next-events-title").textContent = lang === "en" ? "- Next Events -" : "- Prossimi Eventi -";
    document.getElementById("past-events-title").textContent = lang === "en" ? "- Past Events -" : "- Eventi Passati -";

    loadEvents(lang);
}
