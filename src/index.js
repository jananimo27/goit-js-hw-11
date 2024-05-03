import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let searchQuery = '';
let totalHitsAvailable = 0; 

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
        if (response.data.hits.length === 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            loadMoreBtn.style.display = 'none';
            return null;
        }
        if (currentPage === 1) {
            Notiflix.Notify.success(`Hooray! We found ${response.data.totalHits} images`);
        }
        totalHitsAvailable = response.data.totalHits;
        return response.data;
    } catch (error) {
        console.error('Error fetching images:', error);
        Notiflix.Notify.failure('Failed to fetch images');
        return null;
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    searchQuery = e.target.elements.searchQuery.value.trim();

    if (!searchQuery) {
        Notiflix.Notify.warning('Please enter a search term');
        return;
    }

    gallery.innerHTML = '';
    currentPage = 1;
    const data = await fetchImages(searchQuery, currentPage);

    if (data && data.hits.length > 0) {
        renderImages(data.hits);
        loadMoreBtn.style.display = 'block';
    }
});

loadMoreBtn.addEventListener('click', async () => {
    currentPage += 1;
    const data = await fetchImages(searchQuery, currentPage);
    if (data && data.hits.length > 0) {
        renderImages(data.hits);
        smoothScroll();
    } else {
        Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
        loadMoreBtn.style.display = 'none';
    }
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
    new SimpleLightbox('.gallery a', {});
}

function smoothScroll() {
    if (gallery.firstElementChild) {
        const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
        window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth'
        });
    }
}

Notiflix.Notify.init({
    width: '280px',
    position: 'right-top',
    distance: '15px',
});
