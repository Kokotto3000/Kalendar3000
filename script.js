document.addEventListener('DOMContentLoaded', function() {
    const currentMonthElement = document.getElementById('current-month');
    const calendarDaysElement = document.getElementById('calendar-days');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const filterInputs = document.querySelectorAll('.event-filter'); // Sélecteurs pour les filtres
    const dropdownMenu = document.querySelector('.dropdown-menu');
    //const accordionButton = document.querySelectorAll('.accordion button');

    let currentDate = new Date();
    let activeFilters = []; // Utilisé pour stocker les types de filtres activés

    // Noms abrégés des jours
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    let loadedEvents = []; // Variable pour stocker les événements chargés

    // Fonction pour charger les événements à partir d'un fichier JSON
    function loadEvents() {
        return fetch('./events.json')
            .then(response => response.json())
            .then(data => {
                loadedEvents = data.map(event => ({
                    ...event,
                    date: new Date(event.date)
                }));
            })
            .catch(error => console.error('Erreur lors du chargement des événements:', error));
    }

    // Simuler des événements pour les jours
    function getSimulatedEvents(day, month, year) {

        // Filtrer les événements qui correspondent au jour actuel et aux filtres actifs
        return loadedEvents.filter(event => {
            const eventDate = event.date; // Chaque événement n'a plus qu'une seule date
            const currentDay = new Date(year, month, day);

            // Vérifier si la date de l'événement correspond au jour actuel
            const isSameDay = eventDate.getFullYear() === currentDay.getFullYear() &&
                            eventDate.getMonth() === currentDay.getMonth() &&
                            eventDate.getDate() === currentDay.getDate();

            // Vérifier si le type d'événement est dans les filtres actifs
            const isFiltered = activeFilters.length === 0 || activeFilters.some(e => event.type.includes(e));

            return isSameDay && isFiltered;
        });

    }

    // Fonction pour générer le menu déroulant des mois, le but c'est que le menu ne bouge pas en fonction du mois sur lequel on clique mais qu'il y ait les 6 mois précédant la date du jour et les 6 mois suivant avec un sous titre pour l'année
    function generateDropdownMenu() {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        let previousYear = null;

        // Ajouter les 6 mois précédents et les 6 mois suivants dans le dropdown
        for (let i = -6; i <= 6; i++) {
            let month = new Date(currentYear, currentMonth + i, 1);
            let monthName = month.toLocaleDateString('fr-FR', { month: 'long' });
            let year = month.getFullYear();

            // Si l'année change, ajouter un sous-titre pour l'année
            if (year !== previousYear) {
                let yearHeader = document.createElement('li');
                yearHeader.className = 'dropdown-header';
                yearHeader.textContent = year;
                dropdownMenu.appendChild(yearHeader);
                previousYear = year;
            }

            let listItem = document.createElement('li');
            let linkItem = document.createElement('a');
            linkItem.className = 'dropdown-item';
            linkItem.href = '#';
            linkItem.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
            linkItem.dataset.month = month.getMonth();
            linkItem.dataset.year = year;

            // Ajouter l'événement de clic pour changer le mois
            linkItem.addEventListener('click', function(event) {
                event.preventDefault();
                currentDate.setMonth(parseInt(this.dataset.month));
                currentDate.setFullYear(parseInt(this.dataset.year));
                renderCalendar(); // Mettre à jour le calendrier après changement
            });

            listItem.appendChild(linkItem);
            dropdownMenu.appendChild(listItem);
        }
    }

    // Fonction pour mettre à jour les filtres actifs
    function updateActiveFilters() {
        console.log("filters")
        activeFilters= [];

        filterInputs.forEach(input => {
            if(input.checked){
                activeFilters.push(input.value);
            }
        })

        renderCalendar(); // Re-render le calendrier avec les nouveaux filtres
    }

    // Fonction pour afficher le calendrier
    function renderCalendar() {
        console.log("je lance le calendrier");
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
    
        // Met à jour l'affichage du mois et de l'année
        currentMonthElement.textContent = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
        // Efface tous les jours précédents
        while (calendarDaysElement.firstChild) { 
            calendarDaysElement.removeChild(calendarDaysElement.firstChild);
        }
    
        // Détermine le premier jour du mois (en considérant que lundi est le premier jour)
        const firstDayOfMonth = new Date(year, month, 1);
        const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Ajustement pour que lundi soit le premier jour
    
        // Nombre de jours dans le mois actuel
        const daysInMonth = new Date(year, month + 1, 0).getDate();
    
        // Crée une nouvelle ligne pour les jours du mois
        let row = document.createElement('div');
        row.className = 'row';
        calendarDaysElement.appendChild(row);
    
        // Remplit les cases pour les jours du mois précédent
        const prevMonthDays = new Date(year, month, 0).getDate(); // Nombre de jours dans le mois précédent
        for (let i = startDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('col', 'disabled'); // Ajoute la classe "disabled"
            
            const dayTitle = document.createElement('div');
            dayTitle.classList.add('day-title');
            dayElement.appendChild(dayTitle);
    
            // Affiche le numéro du jour du mois précédent
            const dayNumber = document.createElement('div');
            dayNumber.textContent = prevMonthDays - i;
            dayNumber.classList.add('day-number');
            dayTitle.appendChild(dayNumber);
    
            // Ajoute un label pour le jour de la semaine
            const dayLabel = document.createElement('div');
            dayLabel.textContent = dayNames[(startDay - i - 1 + 7) % 7];
            dayLabel.classList.add('day-label');
            dayTitle.appendChild(dayLabel);
    
            row.appendChild(dayElement);
        }
    
        // Remplit le calendrier avec les jours du mois actuel
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('col', 'day');
    
            const dayOfWeek = (startDay + day - 1) % 7; // Jour de la semaine (0 = lundi, 6 = dimanche)
    
            // Vérifier si c'est un week-end (samedi ou dimanche)
            if (dayOfWeek === 5 || dayOfWeek === 6) {
                dayElement.classList.add('weekend');
            }
    
            const dayTitle = document.createElement('div');
            dayTitle.classList.add('day-title');
            dayElement.appendChild(dayTitle);
    
            const dayNumber = document.createElement('div');
            dayNumber.textContent = day;
            dayNumber.classList.add('day-number');
            dayTitle.appendChild(dayNumber);
    
            // Ajoute un label pour le jour de la semaine
            const dayLabel = document.createElement('div');
            dayLabel.textContent = dayNames[(startDay + day - 1) % 7];
            dayLabel.classList.add('day-label');
            dayTitle.appendChild(dayLabel);
    
            // Vérifie si c'est aujourd'hui
            if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
                dayElement.classList.add('today');
            }
    
            // Ajoute un conteneur pour les événements du jour
            const eventsBlock = document.createElement('div');
            eventsBlock.classList.add('eventsBlock');
            dayElement.appendChild(eventsBlock);
    
            // Obtient les événements pour le jour actuel
            const events = getSimulatedEvents(day, month, year);
    
            // Limite le nombre d'événements affichés à 3
            const displayedEvents = events.slice(0, 2);
    
            displayedEvents.forEach(event => {
                // Crée un élément pour l'événement
                const eventElement = document.createElement('div');
                eventElement.textContent = event.name;
                event.type.forEach(type => eventElement.classList.add('event', type));
                eventElement.classList.add('event');
    
                // Ajouter le gestionnaire de clic pour ouvrir la modal
                eventElement.addEventListener('click', function() {
                    console.log(event.description);
                    // Remplir les détails dans la modal
                    document.getElementById('eventName').textContent = event.name;
    
                    const typeTags = document.getElementById('eventType');
                    typeTags.innerHTML = '';
                    event.type.forEach(type => {
                        const tag = document.createElement('span');
                        tag.innerHTML = `<span class="badge rounded-pill ${type}">${type}</span>`;
                        typeTags.appendChild(tag);
                    });
                    document.getElementById('eventDescription').innerHTML = event.description;
    
                    // Ouvrir la modal
                    new bootstrap.Modal(document.getElementById('eventModal')).show();
                });
    
                eventsBlock.appendChild(eventElement);
            });
    
            // Ajoute un bouton "+" si plus de 2 événements
            if (events.length > 2) {
                const moreEventsButton = document.createElement('div');
                moreEventsButton.classList.add('more-events');
                moreEventsButton.innerHTML = '<i class="fa-solid fa-plus"></i>';

                eventsBlock.appendChild(moreEventsButton);

                let moreEventsOpen = false;

                const allEventsBlock = document.createElement('div');
                allEventsBlock.id = 'allEventsBlock';
                
                // Ajouter le gestionnaire de clic pour afficher tous les événements dans un bloc sous le calendrier
                moreEventsButton.addEventListener('click', function(){
                    if(!moreEventsOpen) {
                        moreEventsOpen= true;
                        moreEventsButton.innerHTML = '<i class="fa-solid fa-minus"></i>';
                        eventsBlock.appendChild(allEventsBlock);
                        displayAllEventsForDay(day, month, year);
                    } 
                    else{
                        moreEventsOpen= false;
                        moreEventsButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
                        eventsBlock.removeChild(allEventsBlock);
                    }
                });
            }
    
            row.appendChild(dayElement);
    
            // Ajoute une nouvelle ligne si nous avons atteint la fin de la semaine
            if ((startDay + day) % 7 === 0) {
                row = document.createElement('div');
                row.className = 'row';
                calendarDaysElement.appendChild(row);
            }
        }
    
        // Remplit les cases pour les jours du mois suivant
        const totalCells = startDay + daysInMonth;
        const nextMonthStart = totalCells % 7;
        if (nextMonthStart !== 0) {
            for (let i = 1; i <= (7 - nextMonthStart); i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('col', 'disabled');
    
                const dayTitle = document.createElement('div');
                dayTitle.classList.add('day-title');
                dayElement.appendChild(dayTitle);
    
                const dayNumber = document.createElement('div');
                dayNumber.textContent = i;
                dayNumber.classList.add('day-number');
                dayTitle.appendChild(dayNumber);
    
                const dayLabel = document.createElement('div');
                dayLabel.textContent = dayNames[(startDay + daysInMonth + i - 1) % 7];
                dayLabel.classList.add('day-label');
                dayTitle.appendChild(dayLabel);
    
                row.appendChild(dayElement);
            }
        }
    }
    
    // Fonction pour afficher tous les événements d'un jour donné sous le calendrier
    function displayAllEventsForDay(day, month, year) {
        const allEventsBlock = document.getElementById('allEventsBlock');
        allEventsBlock.innerHTML = ''; // Efface les événements précédents

        const allEventsHeader = document.createElement('div');
        allEventsHeader.classList.add('all-events-header');
        //allEventsHeader.innerHTML= `<h5>Tous les évènements du ${day}</h5>`;
        allEventsHeader.innerHTML= `<h5>Tous les évènements du ${day}</h5>`;

        allEventsBlock.appendChild(allEventsHeader);
    
        const events = getSimulatedEvents(day, month, year);
    
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.textContent = event.name;
            event.type.forEach(type => eventElement.classList.add('event', type));
            eventElement.classList.add('event', 'full-event');
    
            eventElement.addEventListener('click', function() {
                console.log(event.description);
                document.getElementById('eventName').textContent = event.name;
    
                const typeTags = document.getElementById('eventType');
                typeTags.innerHTML = '';
                event.type.forEach(type => {
                    const tag = document.createElement('span');
                    tag.innerHTML = `<span class="badge rounded-pill ${type}">${type}</span>`;
                    typeTags.appendChild(tag);
                });
                document.getElementById('eventDescription').innerHTML = event.description;
    
                new bootstrap.Modal(document.getElementById('eventModal')).show();
            });
    
            allEventsBlock.appendChild(eventElement);
        });
    
        // Affiche le bloc avec tous les événements sous le calendrier
        //allEventsBlock.style.display = 'block';
    }
    


    // Événements de navigation
    prevMonthButton.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Gestion des filtres
    // Sélectionner toutes les cases par défaut
    filterInputs.forEach(input => {
        if(input.checked) activeFilters.push(input.value); // Coche toutes les cases // Ajouter chaque filtre à la liste des filtres actifs
        input.addEventListener('change', updateActiveFilters); // Met à jour les filtres quand une case change
    });

    // Appel de la fonction pour charger les événements puis initialiser le calendrier
    loadEvents().then(() => {
        console.log("je suis chargé")
        // Initialiser le calendrier ou d'autres fonctions qui nécessitent les événements
        // Initialisation du calendrier
        generateDropdownMenu();
        renderCalendar();
    });
});
