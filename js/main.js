let currentLanguage = 'en';
let servicesData = [];
let localization = {};

document.addEventListener('DOMContentLoaded', async function() {
    await loadLocalization();
    await loadServices();
    document.getElementById('lang-switch').addEventListener('click', toggleLanguage);
});

async function loadServices() {
    try {
        const response = await fetch('data/services.json');
        servicesData = await response.json();
        displayServices();
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

async function loadLocalization() {
    const response = await fetch(`lang/${currentLanguage}.json`);
    localization = await response.json();
}

function updateLocalization() {
    document.getElementById('search-box').placeholder = localization.searchPlaceholder;
    document.getElementById('lang-switch').textContent = localization.langSwitch;
    document.getElementById('title').textContent = localization.headerTitle;
    document.getElementById('header').textContent = localization.headerTitle;
    document.title = localization.headerTitle;
}

document.getElementById('search-box').addEventListener('input', function(event) {
    const searchTerm = event.target.value.toLowerCase();
    displayServices(searchTerm);
});

let selectedTag = '';

function displayServices(searchTerm = '') {
    const servicesList = document.getElementById('services-list');
    const tagName = document.getElementById('tag-name');
    const resetButton = document.getElementById('reset-button');

    servicesList.innerHTML = ''; // Очистка списка
    servicesData.filter(service => 
        (service.name.toLowerCase().includes(searchTerm) || 
        service.description[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.episodeName.toLowerCase().includes(searchTerm)||
        service.episodeUrl.toLowerCase().includes(searchTerm)||
        service.url.toLowerCase().includes(searchTerm)) &&
        (selectedTag === '' || service.tags.some(tag => tag.toLowerCase().includes(selectedTag.toLowerCase()))) // преобразование тегов в нижний регистр
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Сортировка сервисов по дате в обратном порядке
    .forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.className = 'service-item';
        serviceElement.innerHTML = `
            <a href="${service.url}" target="_blank"><h3>${service.name}</h3></a>
            <p>${service.description[currentLanguage]}</p>
            <p>
                ${localization.mentionedIn}: <a href="${service.episodeUrl}" target="_blank">${service.episodeName}</a>
            </p>
            <div class="tags">${service.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
            <div class="date">${service.date}</div> <!-- Добавляем дату -->
        `;
        servicesList.appendChild(serviceElement);
    });

    // Добавляем обработчик события на теги
    document.querySelectorAll('.tag').forEach(tagElement => {
        tagElement.addEventListener('click', function() {
            selectedTag = this.textContent;
            displayServices();
        });
    });

    // Обновляем отображение выбранного тега и показываем кнопку сброса
    tagName.textContent = selectedTag;
    resetButton.style.display = selectedTag ? 'inline' : 'none';
}

// Добавляем обработчик события на кнопку сброса
document.getElementById('reset-button').addEventListener('click', function() {
    selectedTag = '';
    displayServices();
});

// Обновляем обработчик события для строки поиска
document.getElementById('search-box').addEventListener('input', function(event) {
    const searchTerm = event.target.value.toLowerCase();
    displayServices(searchTerm);
});

async function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ru' : 'en';
    await loadLocalization();
    updateLocalization();
    displayServices(); // Перерисовка списка сервисов с учетом нового языка
}