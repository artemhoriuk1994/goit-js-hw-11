import './sass/main.scss';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio'; 
import { renderMurkup } from './js/render-murkup';
import ImagesApiService from './js/API-servis';
import LoadMoreBtn from './js/load-more-btn';

const ImagesApi = new ImagesApiService();
const lightbox = new SimpleLightbox('.gallery a');
const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});

const refs = {
  form: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
  toTopButton: document.querySelector('.to-top-btn'),
};

refs.form.addEventListener("submit", onFormSubmit);
loadMoreBtn.refs.button.addEventListener("click", onLoadMore);
refs.toTopButton.addEventListener("click", backToTop);
window.addEventListener("scroll", showToTopButton);

async function onFormSubmit(e) {
  try {
    e.preventDefault();
    clearGalleryMarkup();
    ImagesApi.resetPage();

    ImagesApi.query = e.currentTarget.elements.searchQuery.value.trim();
    if (ImagesApi.query === "") {
      onNotFoundImages();
      return;
    };

    loadMoreBtn.show();
    loadMoreBtn.disable();

    const images = await ImagesApi.fetchImages();

    checkConditionsForLoadMore();

    if (ImagesApi.totalHits === 0) {
      onNotFoundImages();
    } else {
      onFoundImages(ImagesApi.totalHits);
      renderGalleryMarkup(images);
    }
  }
  catch (error) { console.log(error); };
}

// function onFormSubmit(e) {
//   e.preventDefault();
//   clearGalleryMarkup();
//   ImagesApi.resetPage();

//   ImagesApi.query = e.currentTarget.elements.searchQuery.value.trim();
//   if (ImagesApi.query === "") {
//     onNotFoundImages();
//     return;
//   };

//   loadMoreBtn.show();
//   loadMoreBtn.disable();

//   ImagesApi.fetchImages().then((images) => {
//     checkConditionsForLoadMore();
//     if (ImagesApi.total === 0) {
//       onNotFoundImages();
//     } else {
//       onFoundImages(ImagesApi.total);
//       renderGalleryMarkup(images);
//     }
//   }).catch(error => {console.log(error);});
// }

async function onLoadMore() {
  try {
    loadMoreBtn.disable();
    ImagesApi.incrementPage();

    const images = await ImagesApi.fetchImages();

    renderGalleryMarkup(images);
    loadMoreBtn.enable();
    smoothScroll();
    сheckEndOfSearch();
  }
  catch (error) { console.log(error); };
}

// function onLoadMore() {
//   loadMoreBtn.disable();

//   ImagesApi.incrementPage();

//   ImagesApi.fetchImages()
//     .then(images => {
//       renderGalleryMarkup(images);
//       loadMoreBtn.enable();
//       smoothScroll();
//       сheckEndOfSearch();
//     }).catch(error => {console.log(error);});
// }

function checkConditionsForLoadMore() {
  if (ImagesApi.totalHits <= ImagesApi.per_page) {
      loadMoreBtn.hide();
    } else {
      loadMoreBtn.show();
      loadMoreBtn.enable();
    }
}

function clearGalleryMarkup() {
  refs.galleryContainer.innerHTML = "";
}

function renderGalleryMarkup(images) {
  refs.galleryContainer.insertAdjacentHTML("beforeend", renderMurkup(images));
  lightbox.refresh();
}

function onFoundImages(totalHits) {
	Notify.success(`Hooray! We found ${totalHits} images.`);
}

function onNotFoundImages() {
  loadMoreBtn.hide();
  Notify.failure("Sorry, there are no images matching your search query. Please try again.");
}

function сheckEndOfSearch() {
  const totalPages = Math.ceil(ImagesApi.totalHits / ImagesApi.per_page);
  if (ImagesApi.page === totalPages) {
    setTimeout(() => {
      Notify.warning("We're sorry, but you've reached the end of search results.");
    }, 1000);
    loadMoreBtn.hide();
  }
}

function smoothScroll() {
  const { height: cardHeight } = document.querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
    
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
}

function showToTopButton() {
  if (
    document.body.scrollTop > 500 ||
    document.documentElement.scrollTop > 500
  ) {
    refs.toTopButton.classList.remove('is-hidden');
  } else {
    refs.toTopButton.classList.add('is-hidden');
  }
}

function backToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}
