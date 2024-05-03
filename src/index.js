import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let searchQuery = '';

const API_KEY = '43704076-e4399805efcc0ad689cbb211a'; 
const BASE_URL = 'https://pixabay.com/api/';

async function fetchImages(query, page) {
    const params = new URLSearchParams({
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page,
    });

    try {
        const response = await axios.get(`${BASE_URL}?${params}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching images:', error);
        Notiflix.Notify.failure('Failed to fetch images');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    searchQuery = e.target.elements.searchQuery.value.trim();

    if (!searchQuery) {
        return Notiflix.Notify.warning('Please enter a search term');
    }

    gallery.innerHTML = '';
    currentPage = 1;
    const data = await fetchImages(searchQuery, currentPage);

    if (data.hits.length === 0) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    } else {
        renderImages(data.hits);
        loadMoreBtn.style.display = 'block';
    }
});

loadMoreBtn.addEventListener('click', async () => {
    currentPage += 1;
    const data = await fetchImages(searchQuery, currentPage);
    renderImages(data.hits);
});

function renderImages(images) {
    const markup = images.map((img) => `
        <div class="photo-card">
            <a href="${img.largeImageURL}">
                <img src="${img.webformatURL}" alt="${img.tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item"><b>Likes:</b> ${img.likes}</p>
                <p class="info-item"><b>Views:</b> ${img.views}</p>
                <p class="info-item"><b>Comments:</b> ${img.comments}</p>
                <p class="info-item"><b>Downloads:</b> ${img.downloads}</p>
            </div>
        </div>
    `).join('');

    gallery.insertAdjacentHTML('beforeend', markup);
    new SimpleLightbox('.gallery a', { /* options */ });
}

Notiflix.Notify.init({
    width: '280px',
    position: 'right-top',
    distance: '15px',
});
