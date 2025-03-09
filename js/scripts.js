document.addEventListener("DOMContentLoaded", function () {
    loadHeader()
        .then(() => {
            console.log("✅ Header caricato con successo!");
            attachMenuListeners();
            
            const savedLanguage = localStorage.getItem("selectedLanguage") || "it";
            changeLanguage(savedLanguage);

            // Se esiste la sezione eventi, carica gli eventi
            if (document.getElementById("next-events-container")) {
                loadEvents(savedLanguage);
            }
        })
        .catch(error => console.error("❌ Errore nel caricamento dell'header:", error));
});

// Carica l'header dinamicamente
function loadHeader() {
    return fetch("header.html")
        .then(response => {
            if (!response.ok) throw new Error("Errore nel caricamento di header.html");
            return response.text();
        })
        .then(html => {
            document.getElementById("header-container").innerHTML = html;
            executeScriptsFromHTML(html);
        });
}

// Esegue eventuali script all'interno di header.html
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

// Aggiunge gli eventi al menu dopo il caricamento
function attachMenuListeners() {
    console.log("📌 Aggiungendo listener al menu...");
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function () {
            console.log("🛠️ Cliccato su:", this.textContent);
        });
    });
}

// Cambia lingua su qualsiasi pagina
function changeLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    document.documentElement.lang = lang;

    console.log(`🌍 Cambio lingua a: ${lang}`);

    // Cambia visibilità dei pulsanti e degli elementi multilingua
    document.querySelectorAll('.btn, .shop-button').forEach(el => {
        el.style.display = el.getAttribute('data-lang') === lang ? 'inline-flex' : 'none';
    });

    // Cambia i titoli della sezione eventi solo se esistono nella pagina
    let nextEventsTitle = document.getElementById("next-events-title");
    let pastEventsTitle = document.getElementById("past-events-title");

    if (nextEventsTitle) nextEventsTitle.textContent = lang === "en" ? "- Next Events -" : "- Prossimi Eventi -";
    if (pastEventsTitle) pastEventsTitle.textContent = lang === "en" ? "- Past Events -" : "- Eventi Passati -";

    // Ricarica gli eventi nella lingua selezionata se la pagina contiene eventi
    if (document.getElementById("next-events-container")) {
        loadEvents(lang);
    }
}

// Carica gli eventi SOLO se la pagina contiene la sezione eventi
function loadEvents(lang) {
    fetch("data/events.csv")
        .then(response => response.text())
        .then(csvText => {
            let events = parseCSV(csvText);
            displayEvents(events, lang);
        })
        .catch(error => console.error("❌ Errore nel caricamento degli eventi:", error));
}

// Converte il CSV in array di eventi
function parseCSV(csvText) {
    let rows = csvText.trim().split("\n").slice(1);
    return rows.map(row => {
        let [date, location, event] = row.split(",");
        return { date, location, event };
    });
}

// Mostra gli eventi nella pagina SE sono presenti
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

    // Inserisce solo se gli elementi esistono nella pagina
    if (document.getElementById("next-events-container")) {
        document.getElementById("next-events-container").innerHTML = nextEvents.map(e => e.html).join("");
    }
    if (document.getElementById("past-events-container")) {
        document.getElementById("past-events-container").innerHTML = pastEvents.map(e => e.html).join("");
    }
}

// Formatta la data in base alla lingua selezionata
function formatDate(dateString, lang) {
    let [year, month, day] = dateString.split("-");
    return lang === "en" ? `${year}-${month}-${day}` : `${day}/${month}/${year}`;
}
