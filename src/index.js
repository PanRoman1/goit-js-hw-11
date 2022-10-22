import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import ImagesApiService from './img-service';

const imagesApiService = new ImagesApiService();
let lightbox = new SimpleLightbox('.gallery a');

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  moreButton: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', onFormSearch);
refs.moreButton.addEventListener('click', onButtonClick);

function smoothScroll() {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function makeImageMarkup({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `  
    <div class="gallery__item">
    <a href="${largeImageURL}" class="gallery__link">
  <img src="${webformatURL}" alt="${tags}"  loading="lazy" class="gallery__image" height = "300" /></a>
  <ul class="gallery__info">
    <li class="info-item">
      <p><b>Likes</b>
      <p>${likes}
    </li>
    <li class="info-item">
      <p><b>Views</b>
      <p>${views}
    </li>
    <li class="info-item">
     <p> <b>Comments</b>
     <p> ${comments}
    </li>
    <li class="info-item">
     <p> <b>Downloads</b>
     <p> ${downloads}
    </li>
  </ul>
  
</div>`;
}

function onFormSearch(e) {
  e.preventDefault();
  hideMoreButton();
  imagesApiService.query = e.currentTarget.elements.searchQuery.value;
  if (imagesApiService.query === '') {
    return Notify.failure('You have to fill in a search query!');
  }

  imagesApiService.resetPage();
  clearImages();

  loadAndRenderImages(e.target);
}

function clearImages() {
  refs.gallery.innerHTML = '';
}

function showMoreButton() {
  refs.moreButton.parentNode.classList.add('visible');
}

function hideMoreButton() {
  refs.moreButton.parentNode.classList.remove('visible');
}

function onButtonClick(e) {
  e.preventDefault();

  loadAndRenderImages(e.target);
}

async function loadAndRenderImages(ref) {
  try {
    const setOfImages = await imagesApiService.fetchImages();

    if (ref === refs.moreButton) {
      smoothScroll();
    }
    if (ref === refs.form) {
      showMoreButton();
    }
    renderImages(setOfImages);
  } catch (error) {
    console.log(error);
  }
}

function renderImages(setOfImages) {
  if (imagesApiService.page * 40 > setOfImages.totalHits) {
    hideMoreButton();
    if (imagesApiService.page !== 1) {
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  }

  if (setOfImages.totalHits === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    if (imagesApiService.page === 1) {
      if (setOfImages.total <= 500) {
        Notify.info(`Hooray! We found ${setOfImages.totalHits} images! )`);
      } else {
        Notify.info(
          `Hooray! We found ${setOfImages.total} images, but you will see only ${setOfImages.totalHits} images )`
        );
      }
    }
    addMarkup(setOfImages.hits);

    imagesApiService.incrementPage();
  }
}

function makeGalleryMarkup(images) {
  return images.map(image => makeImageMarkup(image)).join('');
}

function addMarkup(galleryItems) {
  refs.gallery.insertAdjacentHTML('beforeend', makeGalleryMarkup(galleryItems));

  lightbox.refresh();
}