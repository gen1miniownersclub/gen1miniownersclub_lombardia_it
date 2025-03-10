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

    // Carica il footer in ogni pagina
    loadFooter();

    // Imposta il tasto attivo
    highlightActiveButton();

    // Aggiunge un ritardo casuale al bouncing per ogni pulsante
    setTimeout(() => {
        document.querySelectorAll('.btn').forEach(btn => {
            if (!btn.classList.contains("active-btn")) {
                let randomDelay = Math.random() * 1.5; // Ritardo tra 0 e 1.5s
                btn.style.animationDelay = `${randomDelay}s`;
            }
        });
    }, 500); // Aspettiamo il caricamento per evitare problemi di rilevamento
});

// Funzione per evidenziare il pulsante della pagina corrente e fermare il bouncing
function highlightActiveButton() {
    let currentPage = window.location.pathname.split("/").pop(); // Ottiene il nome file corrente
    if (!currentPage) currentPage = "index_v2.html"; // Se vuoto, assegna la home

    document.querySelectorAll('.btn').forEach(btn => {
        let pageHref = btn.getAttribute("onclick")?.match(/'([^']+)'/);

        if (pageHref && pageHref[1] === currentPage) {
            btn.classList.add("active-btn");  // Evidenzia il pulsante attivo
            btn.style.removeProperty('animation'); // Rimuove il bouncing
            btn.style.pointerEvents = "none"; // Disabilita il click
            btn.style.color = "#e2007d"; // Cambia colore per evidenziare
            btn.style.fontWeight = "bold";
        } else {
            btn.classList.remove("active-btn"); // Rimuove evidenziazione dagli altri pulsanti
            btn.style.animation = "bounce 1.5s infinite alternate ease-in-out"; // Riattiva il bouncing sugli altri
            btn.style.color = "black"; // Ripristina colore originale
            btn.style.fontWeight = "normal";
            btn.style.pointerEvents = "auto"; // Riattiva il click sugli altri
        }
    });
}

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


function loadShinyStat() {
    console.log("📊 Caricamento ShinyStat...");

    let shinystatScript = document.createElement("script");
    shinystatScript.type = "text/javascript";
    shinystatScript.src = "//codice.shinystat.com/cgi-bin/getcod.cgi?USER=SS-52618215-692a6";
    shinystatScript.async = true;

    let footer = document.querySelector("footer");
    if (footer) {
        let container = document.createElement("div");
        container.className = "shinystat-container";
        container.appendChild(shinystatScript);

        // Aggiunge lo script DOPO il copyright (alla fine del footer)
        footer.appendChild(container);

        console.log("✅ ShinyStat caricato dopo il copyright.");
    } else {
        console.error("❌ Footer non trovato, impossibile caricare ShinyStat.");
    }
}

function loadFooter() {
    console.log("📥 Avvio caricamento footer...");

    fetch("footer.html")
        .then(response => {
            if (!response.ok) throw new Error("❌ Errore nel caricamento di footer.html");
            return response.text();
        })
        .then(html => {
            console.log("✅ Footer HTML caricato, inserimento nel DOM...");
            document.body.insertAdjacentHTML("beforeend", html);
            console.log("✅ Footer inserito con successo!");

            // Imposta l'anno corrente nel footer
            let yearElement = document.getElementById("current-year");
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
                console.log("📆 Anno corrente aggiornato:", yearElement.textContent);
            } else {
                console.warn("⚠️ Elemento #current-year non trovato nel footer.");
            }

            // Applica la lingua attuale al footer
            const savedLanguage = localStorage.getItem("selectedLanguage") || "it";
            updateFooterLanguage(savedLanguage);

            // Dopo aver caricato il footer, carichiamo ShinyStat
            loadShinyStat();
        })
        .catch(error => console.error("❌ Errore nel caricamento del footer:", error));
}

// Funzione per aggiornare dinamicamente il testo del footer
function updateFooterLanguage(lang) {
    console.log(`🌍 Cambio lingua nel footer a: ${lang}`);

    document.querySelectorAll(".footer-text").forEach(el => {
        if (el.getAttribute("data-lang") === lang) {
            el.style.display = "block";
            console.log(`✅ Mostrato nel footer:`, el.textContent);
        } else {
            el.style.display = "none";
            console.log(`❌ Nascosto nel footer:`, el.textContent);
        }
    });
}

function updateStoryLanguage(lang) {
    console.log(`🌍 Cambio lingua nella Story Page a: ${lang}`);

    document.querySelectorAll(".story-title, .story-subtitle, .story-text").forEach(el => {
        if (el.getAttribute("data-lang") === lang) {
            el.style.display = "block";
        } else {
            el.style.display = "none";
        }
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

    if (document.querySelector(".story-title")) {
        updateStoryLanguage(lang);
    }

    // Ricarica gli eventi nella lingua selezionata se la pagina contiene eventi
    if (document.getElementById("next-events-container")) {
        loadEvents(lang);
    }

    // Aggiorna la lingua nel footer
    updateFooterLanguage(lang);
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
